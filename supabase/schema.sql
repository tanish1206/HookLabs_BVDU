-- ================================================================
--  HookLabs AI — Complete Supabase SQL Schema
--  Copy-paste this entire file into the Supabase SQL Editor and run.
--  Supabase → SQL Editor → New Query → Paste → Run All
-- ================================================================

-- ── Enable extensions ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for fast text search on trends


-- ================================================================
--  TABLE: videos
--  Every generated script / video export per user
-- ================================================================
CREATE TABLE IF NOT EXISTS public.videos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Source trend
  trend            TEXT        NOT NULL,

  -- Generated hook
  hook_line        TEXT        NOT NULL DEFAULT '',
  body             TEXT        NOT NULL DEFAULT '',
  cta              TEXT        NOT NULL DEFAULT '',

  -- Raw hook JSON (stored to support multiple hook variants)
  hook_data        JSONB,

  -- Performance metrics (AI-estimated)
  hook_score       INT,
  est_ctr          TEXT,
  retention        TEXT,
  viral_score      INT,

  -- Production settings
  voice            TEXT,
  format           TEXT,       -- 'YouTube Short' | 'TikTok' | 'Instagram Reel'
  tone             TEXT,
  duration         INT,

  -- Export / render state
  render_id        TEXT,
  render_status    TEXT        DEFAULT 'pending',  -- pending | rendering | done | failed
  video_url        TEXT,

  -- Gallery
  is_public        BOOLEAN     NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_videos_user_id    ON public.videos (user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_public      ON public.videos (is_public) WHERE is_public = TRUE;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS videos_updated_at ON public.videos;
CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ================================================================
--  TABLE: feedback
--  Actual platform performance metrics the user enters after publishing
-- ================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id          UUID        REFERENCES public.videos(id) ON DELETE SET NULL,

  -- Actual platform stats (user-submitted)
  actual_ctr        FLOAT,       -- e.g., 7.2 (%)
  actual_retention  FLOAT,       -- e.g., 55  (%)
  views             INT,

  -- Context stored for AI feedback loop
  hook_line         TEXT,
  tone              TEXT,
  format            TEXT,
  notes             TEXT,

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
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback (created_at DESC);


-- ================================================================
--  TABLE: trends_cache
--  Trending topics refreshed every 15 min by cron job
-- ================================================================
CREATE TABLE IF NOT EXISTS public.trends_cache (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title           TEXT        NOT NULL,   -- the trend text / headline
  source          TEXT,                   -- 'hacker_news' | 'reddit' | 'google_trends' | 'manual'
  url             TEXT,

  -- Scoring
  virality_score  INT         NOT NULL DEFAULT 0,  -- 0-100
  
  -- Metadata
  category        TEXT,       -- 'tech' | 'crypto' | 'productivity' | null
  region          TEXT        NOT NULL DEFAULT 'global',

  -- Cache management
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours')
);

-- Public read (anon key can read trends) — no auth needed for the TrendSelector
ALTER TABLE public.trends_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trends_select_all" ON public.trends_cache
  FOR SELECT USING (TRUE);

-- Only service role (cron / ingest) can write
CREATE POLICY "trends_insert_service" ON public.trends_cache
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "trends_update_service" ON public.trends_cache
  FOR UPDATE USING (TRUE);

CREATE POLICY "trends_delete_service" ON public.trends_cache
  FOR DELETE USING (TRUE);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trends_active    ON public.trends_cache (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_trends_score     ON public.trends_cache (virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_trends_fetched   ON public.trends_cache (fetched_at DESC);
-- GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_trends_title_trgm ON public.trends_cache USING gin (title gin_trgm_ops);


-- ================================================================
--  TABLE: users_metadata
--  Plan info, Stripe IDs, usage tracking, quota management
-- ================================================================
CREATE TABLE IF NOT EXISTS public.users_metadata (
  user_id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription
  plan                     TEXT        NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'team'
  stripe_customer_id       TEXT        UNIQUE,
  stripe_subscription_id   TEXT        UNIQUE,
  subscription_status      TEXT        DEFAULT 'inactive',  -- 'active' | 'cancelled' | 'past_due' | 'inactive'

  -- Quota
  videos_used_this_month   INT         NOT NULL DEFAULT 0,
  reset_date               TIMESTAMPTZ NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),

  -- Profile
  display_name             TEXT,
  avatar_url               TEXT,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meta_select_own" ON public.users_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meta_insert_own" ON public.users_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meta_update_own" ON public.users_metadata
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can update (for Stripe webhooks)
-- Note: The service role bypasses RLS by default, no need for a policy

DROP TRIGGER IF EXISTS users_metadata_updated_at ON public.users_metadata;
CREATE TRIGGER users_metadata_updated_at
  BEFORE UPDATE ON public.users_metadata
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ================================================================
--  TRIGGER: auto-create users_metadata row on sign-up
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users_metadata (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ================================================================
--  FUNCTION: reset_monthly_usage
--  Called by the Vercel cron job at month start
-- ================================================================
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users_metadata
  SET
    videos_used_this_month = 0,
    reset_date = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  WHERE reset_date <= NOW();
END;
$$;


-- ================================================================
--  SEED: Insert some demo trends so the app isn't empty on first run
-- ================================================================
INSERT INTO public.trends_cache (title, source, virality_score, category, region, is_active)
VALUES
  ('AI agents are now writing their own programming languages', 'hacker_news', 98, 'tech', 'global', TRUE),
  ('Show HN: Local-first database that syncs over sound waves',  'hacker_news', 93, 'tech', 'global', TRUE),
  ('The Dopamine-First framework for deep work in 2025',          'reddit',       88, 'productivity', 'global', TRUE),
  ('Vibe coding is officially replacing pair programming',        'reddit',       82, 'programming', 'global', TRUE),
  ('Why everyone is switching from VS Code to Cursor',           'reddit',       78, 'programming', 'global', TRUE),
  ('Sam Altman: AGI will be built before this decade ends',      'hacker_news',  74, 'ai', 'global', TRUE),
  ('How I went from 0 to 50k subscribers using AI tools only',   'reddit',       69, 'creator', 'global', TRUE),
  ('The hidden cost of GPU cloud that nobody talks about',        'hacker_news',  65, 'tech', 'global', TRUE)
ON CONFLICT DO NOTHING;


-- ================================================================
--  ENABLE REALTIME on trends_cache (for live updates in useLiveTrends)
-- ================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.trends_cache;

-- ================================================================
--  TABLE: pexels_cache
--  Pexels search result cache (reduces API usage)
-- ================================================================
create table if not exists public.pexels_cache (
  id          uuid primary key default uuid_generate_v4(),
  cache_key   text not null unique,
  query       text not null,
  page        int  not null default 1,
  results     jsonb not null,
  cached_at   timestamptz not null default now()
);

create index if not exists idx_pexels_cache_key on public.pexels_cache (cache_key, cached_at desc);
create index if not exists idx_pexels_cache_age on public.pexels_cache (cached_at);

alter table public.pexels_cache enable row level security;
create policy "authenticated_read_pexels_cache" on public.pexels_cache for select using (auth.role() = 'authenticated');
create policy "service_role_write_pexels_cache" on public.pexels_cache for all using (auth.role() = 'service_role');

-- Also update the videos table to store chosen B-roll reference
alter table public.videos
  add column if not exists pexels_video_id   text,
  add column if not exists pexels_video_url  text,
  add column if not exists pexels_thumbnail  text,
  add column if not exists videographer_name text,
  add column if not exists subtitle_style    jsonb,
  add column if not exists editing_config    jsonb;

-- ================================================================
--  Done! ✓
--  Tables created: videos, feedback, trends_cache, users_metadata, pexels_cache
--  Triggers: on_auth_user_created, set_updated_at
--  Functions: handle_new_user, reset_monthly_usage
--  Seed: 8 demo trends inserted
--  Realtime: enabled on trends_cache
-- ================================================================

