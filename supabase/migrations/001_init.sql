-- supabase/migrations/001_init.sql
-- HookLabs AI — Initial database schema
-- Run via: supabase db push  OR  paste in Supabase SQL editor

-- ── Enable UUID extension ─────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════════════════════════════
-- TABLE: videos
-- Stores every generated video script / export record
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.videos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trend        TEXT NOT NULL,
  hook_line    TEXT NOT NULL,
  body         TEXT NOT NULL,
  cta          TEXT NOT NULL,
  hook_score   INT,
  est_ctr      TEXT,
  retention    TEXT,
  viral_score  INT,
  voice        TEXT,
  format       TEXT,
  tone         TEXT,
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: users can only see/modify their own rows
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos_select_own" ON public.videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "videos_select_public" ON public.videos
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "videos_insert_own" ON public.videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "videos_update_own" ON public.videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "videos_delete_own" ON public.videos
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos (user_id);
CREATE INDEX IF NOT EXISTS idx_videos_public   ON public.videos (is_public) WHERE is_public = TRUE;

-- ══════════════════════════════════════════════════════════════
-- TABLE: feedback
-- Actual performance metrics from YouTube/TikTok
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.feedback (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id          UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  actual_ctr        FLOAT,
  actual_retention  FLOAT,
  views             INT,
  tone              TEXT,
  format            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_select_own" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "feedback_insert_own" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_update_own" ON public.feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "feedback_delete_own" ON public.feedback
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback (user_id);

-- ══════════════════════════════════════════════════════════════
-- TABLE: trends_cache
-- Cached trending topics from HN + Reddit (refreshed every 15 min)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.trends_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source      TEXT,           -- 'hn' | 'reddit' | 'google'
  text        TEXT NOT NULL,
  score       INT NOT NULL DEFAULT 0,
  url         TEXT,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public read — no auth needed to read trending topics
ALTER TABLE public.trends_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trends_select_all" ON public.trends_cache
  FOR SELECT USING (TRUE);

-- Service role (cron job) can insert/update
CREATE POLICY "trends_service_insert" ON public.trends_cache
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "trends_service_delete" ON public.trends_cache
  FOR DELETE USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_trends_fetched_at ON public.trends_cache (fetched_at DESC);

-- ══════════════════════════════════════════════════════════════
-- TABLE: users_metadata
-- Plan info, Stripe IDs, usage tracking
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users_metadata (
  user_id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                     TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'team'
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  videos_used_this_month   INT NOT NULL DEFAULT 0,
  reset_date               TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meta_select_own" ON public.users_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meta_update_own" ON public.users_metadata
  FOR UPDATE USING (auth.uid() = user_id);

-- ── Trigger: auto-insert metadata row on sign-up ──────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_metadata (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Trigger: reset monthly usage on reset_date ────────────────
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE public.users_metadata
  SET videos_used_this_month = 0,
      reset_date = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  WHERE reset_date <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Call this function from a Supabase scheduled job or Vercel cron
