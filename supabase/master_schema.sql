-- ================================================================
--  HOOKLABS × ROCKETRIDE BUILDATHON — MASTER CONSOLIDATED SQL SCHEMA
-- ================================================================
--  Copy and paste this ENTIRE file into your Supabase SQL Editor:
--  Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ================================================================

-- ── 1. ENABLE EXTENSIONS ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── 2. SHARED TRIGGER FUNCTION: set_updated_at ───────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ================================================================
--  TABLE 1: users_metadata
--  Subscription plan info, usage tracking, display profiles
-- ================================================================
CREATE TABLE IF NOT EXISTS public.users_metadata (
  user_id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                     TEXT        NOT NULL DEFAULT 'pro',  -- 'free' | 'pro' | 'team'
  stripe_customer_id       TEXT        UNIQUE,
  stripe_subscription_id   TEXT        UNIQUE,
  subscription_status      TEXT        DEFAULT 'active',
  videos_used_this_month   INT         NOT NULL DEFAULT 0,
  reset_date               TIMESTAMPTZ NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  display_name             TEXT,
  avatar_url               TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meta_select_own" ON public.users_metadata;
CREATE POLICY "meta_select_own" ON public.users_metadata FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "meta_insert_own" ON public.users_metadata;
CREATE POLICY "meta_insert_own" ON public.users_metadata FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "meta_update_own" ON public.users_metadata;
CREATE POLICY "meta_update_own" ON public.users_metadata FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Trigger to auto-create user_metadata on signup
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
--  TABLE 2: videos (Creative Generator Assets)
--  Generated script & video export records per user
-- ================================================================
CREATE TABLE IF NOT EXISTS public.videos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trend            TEXT        NOT NULL DEFAULT '',
  hook_line        TEXT        NOT NULL DEFAULT '',
  body             TEXT        NOT NULL DEFAULT '',
  cta              TEXT        NOT NULL DEFAULT '',
  hook_data        JSONB,
  hook_score       INT,
  est_ctr          TEXT,
  retention        TEXT,
  viral_score      INT,
  voice            TEXT,
  format           TEXT,
  tone             TEXT,
  duration         INT,
  render_id        TEXT,
  render_status    TEXT        DEFAULT 'done',
  video_url        TEXT,
  is_public        BOOLEAN     NOT NULL DEFAULT TRUE,
  pexels_video_id  TEXT,
  pexels_video_url TEXT,
  pexels_thumbnail TEXT,
  videographer_name TEXT,
  subtitle_style   JSONB,
  editing_config   JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "videos_select_own" ON public.videos;
CREATE POLICY "videos_select_own" ON public.videos FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "videos_insert_own" ON public.videos;
CREATE POLICY "videos_insert_own" ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "videos_update_own" ON public.videos;
CREATE POLICY "videos_update_own" ON public.videos FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "videos_delete_own" ON public.videos;
CREATE POLICY "videos_delete_own" ON public.videos FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos (user_id);


-- ================================================================
--  TABLE 3: feedback
--  Actual platform performance metrics entered by user after publishing
-- ================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id          UUID        REFERENCES public.videos(id) ON DELETE SET NULL,
  actual_ctr        FLOAT,
  actual_retention  FLOAT,
  views             INT,
  hook_line         TEXT,
  tone              TEXT,
  format            TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "feedback_select_own" ON public.feedback;
CREATE POLICY "feedback_select_own" ON public.feedback FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "feedback_insert_own" ON public.feedback;
CREATE POLICY "feedback_insert_own" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');


-- ================================================================
--  TABLE 4: trends_cache
--  Trending topics refreshed by cron job
-- ================================================================
CREATE TABLE IF NOT EXISTS public.trends_cache (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  source          TEXT,
  url             TEXT,
  virality_score  INT         NOT NULL DEFAULT 0,
  category        TEXT,
  region          TEXT        NOT NULL DEFAULT 'global',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours')
);

ALTER TABLE public.trends_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trends_select_all" ON public.trends_cache;
CREATE POLICY "trends_select_all" ON public.trends_cache FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "trends_all_service" ON public.trends_cache;
CREATE POLICY "trends_all_service" ON public.trends_cache FOR ALL USING (TRUE);


-- ================================================================
--  TABLE 5: pexels_cache
--  Cache stock video metadata to optimize API usage
-- ================================================================
CREATE TABLE IF NOT EXISTS public.pexels_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key   TEXT NOT NULL UNIQUE,
  query       TEXT NOT NULL,
  page        INT  NOT NULL DEFAULT 1,
  results     JSONB NOT NULL,
  cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pexels_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pexels_select_all" ON public.pexels_cache;
CREATE POLICY "pexels_select_all" ON public.pexels_cache FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "pexels_write_service" ON public.pexels_cache;
CREATE POLICY "pexels_write_service" ON public.pexels_cache FOR ALL USING (TRUE);


-- ================================================================
--  TABLE 6: campaigns (PS #10 Ad Spend Autopilot)
--  Track advertising campaigns across Meta, Google, TikTok
-- ================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  platform         TEXT        NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok', 'other')),
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'learning', 'archived')),
  daily_budget     NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
  total_spend      NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  target_roas      NUMERIC(5, 2)  NOT NULL DEFAULT 2.80,
  current_roas     NUMERIC(5, 2)  NOT NULL DEFAULT 0.00,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaigns_select_all" ON public.campaigns;
CREATE POLICY "campaigns_select_all" ON public.campaigns FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "campaigns_insert_all" ON public.campaigns;
CREATE POLICY "campaigns_insert_all" ON public.campaigns FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "campaigns_update_all" ON public.campaigns;
CREATE POLICY "campaigns_update_all" ON public.campaigns FOR UPDATE USING (TRUE);


-- ================================================================
--  TABLE 7: campaign_metrics (PS #10 Time-Series Performance)
--  Granular time-series metrics per campaign
-- ================================================================
CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      UUID        NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  impressions      INT         NOT NULL DEFAULT 0,
  clicks           INT         NOT NULL DEFAULT 0,
  spend            NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  conversions      INT         NOT NULL DEFAULT 0,
  revenue          NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  ctr              NUMERIC(5, 2)  NOT NULL DEFAULT 0.00,
  cpc              NUMERIC(5, 2)  NOT NULL DEFAULT 0.00,
  roas             NUMERIC(5, 2)  NOT NULL DEFAULT 0.00
);

ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "metrics_select_all" ON public.campaign_metrics;
CREATE POLICY "metrics_select_all" ON public.campaign_metrics FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "metrics_insert_all" ON public.campaign_metrics;
CREATE POLICY "metrics_insert_all" ON public.campaign_metrics FOR INSERT WITH CHECK (TRUE);


-- ================================================================
--  TABLE 8: creative_memory (PS #10 Compounding Intelligence)
--  Pattern repository for message hooks, formats, and lifts
-- ================================================================
CREATE TABLE IF NOT EXISTS public.creative_memory (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  message_hook     TEXT        NOT NULL,
  format_type      TEXT        NOT NULL, -- 'problem_solution' | 'ugc_unboxing' | 'stat_lead'
  audience_segment TEXT        NOT NULL, -- 'founders' | 'marketers' | 'genz_creators'
  platform         TEXT        NOT NULL,
  roas_multiplier  NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
  ctr_lift         NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  sample_size      INT         NOT NULL DEFAULT 1,
  confidence_score NUMERIC(3, 2) NOT NULL DEFAULT 0.85,
  insights         TEXT        NOT NULL DEFAULT '',
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.creative_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "memory_select_all" ON public.creative_memory;
CREATE POLICY "memory_select_all" ON public.creative_memory FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "memory_write_all" ON public.creative_memory;
CREATE POLICY "memory_write_all" ON public.creative_memory FOR ALL USING (TRUE);


-- ================================================================
--  TABLE 9: approval_requests (PS #10 Human Approval Gate)
--  Queue for consequential spend & creative actions
-- ================================================================
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      UUID        REFERENCES public.campaigns(id) ON DELETE CASCADE,
  action_type      TEXT        NOT NULL, -- 'budget_increase' | 'pause_creative' | 'launch_variant'
  proposed_change  JSONB       NOT NULL,
  current_budget   NUMERIC(10, 2),
  proposed_budget  NUMERIC(10, 2),
  risk_level       TEXT        NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  confidence_score NUMERIC(3, 2) NOT NULL DEFAULT 0.80,
  status           TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reasoning        TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ
);

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "approval_select_all" ON public.approval_requests;
CREATE POLICY "approval_select_all" ON public.approval_requests FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "approval_write_all" ON public.approval_requests;
CREATE POLICY "approval_write_all" ON public.approval_requests FOR ALL USING (TRUE);


-- ================================================================
--  TABLE 10: pipeline_runs (PS #10 RocketRide Observability)
--  Telemetry & batch execution logging
-- ================================================================
CREATE TABLE IF NOT EXISTS public.pipeline_runs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_name    TEXT        NOT NULL,
  records_count    INT         NOT NULL DEFAULT 1,
  execution_time_ms INT        NOT NULL,
  approx_cost      NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
  status           TEXT        NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'escalated')),
  error_log        TEXT,
  escalations_count INT        NOT NULL DEFAULT 0,
  trace_id         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pipeline_select_all" ON public.pipeline_runs;
CREATE POLICY "pipeline_select_all" ON public.pipeline_runs FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "pipeline_write_all" ON public.pipeline_runs;
CREATE POLICY "pipeline_write_all" ON public.pipeline_runs FOR ALL USING (TRUE);


-- ================================================================
--  DEMO SEED DATA (Populates dashboard immediately with realistic data)
-- ================================================================

-- 1. Insert Initial Trends
INSERT INTO public.trends_cache (title, source, virality_score, category, region, is_active)
VALUES
  ('AI agents are now writing their own programming languages', 'hacker_news', 98, 'tech', 'global', TRUE),
  ('Show HN: Local-first database that syncs over sound waves',  'hacker_news', 93, 'tech', 'global', TRUE),
  ('The Dopamine-First framework for deep work in 2025',          'reddit',       88, 'productivity', 'global', TRUE),
  ('Vibe coding is officially replacing pair programming',        'reddit',       82, 'programming', 'global', TRUE),
  ('Why everyone is switching from VS Code to Cursor',           'reddit',       78, 'programming', 'global', TRUE),
  ('Sam Altman: AGI will be built before this decade ends',      'hacker_news',  74, 'ai', 'global', TRUE)
ON CONFLICT DO NOTHING;

-- 2. Insert Demo Campaigns
INSERT INTO public.campaigns (id, name, platform, status, daily_budget, total_spend, target_roas, current_roas)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Q3 Growth Scale — Founder UGC Hooks', 'meta', 'active', 500.00, 4820.00, 3.20, 3.85),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Retargeting — Stat-Lead Comparison', 'google', 'active', 300.00, 2150.00, 2.80, 2.45),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'TikTok Gen Z Creator Blitz', 'tiktok', 'learning', 200.00, 890.00, 2.50, 1.85)
ON CONFLICT DO NOTHING;

-- 3. Insert Demo Compounding Creative Memory
INSERT INTO public.creative_memory (message_hook, format_type, audience_segment, platform, roas_multiplier, ctr_lift, sample_size, confidence_score, insights)
VALUES
  ('Stop spending $5k/mo on video editors when AI writes & renders hooks in 30s', 'problem_solution', 'founders', 'meta', 1.45, 2.80, 1420, 0.94, 'High emotional resonance on pain-point hook. Converts best with clean bold captions.'),
  ('3 Marketing Hacks Top 1% Brands Use (That Cost $0)', 'stat_lead', 'marketers', 'google', 1.25, 1.90, 980, 0.89, 'Listicle angle drives high CTR, but needs strong immediate offer CTA to convert.'),
  ('Unboxing the AI workflow that generated $100k in 14 days', 'ugc_unboxing', 'genz_creators', 'tiktok', 0.85, 0.95, 450, 0.72, 'Lower ROAS on TikTok unless paired with upbeat trending audio track.')
ON CONFLICT DO NOTHING;

-- 4. Insert Demo Human Approval Queue Item
INSERT INTO public.approval_requests (campaign_id, action_type, proposed_change, current_budget, proposed_budget, risk_level, confidence_score, status, reasoning)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'budget_increase',
    '{"reason": "ROAS 3.85 exceeds target 3.20 by 20%. Recommend scaling daily spend from $500 to $850."}',
    500.00,
    850.00,
    'HIGH',
    0.92,
    'pending',
    'RocketRide Optimization Agent detected high-performing Founder UGC hook. Budget increase exceeds $100 threshold and requires human approval.'
  )
ON CONFLICT DO NOTHING;

-- 5. Insert Demo RocketRide Pipeline Run Observability
INSERT INTO public.pipeline_runs (pipeline_name, records_count, execution_time_ms, approx_cost, status, escalations_count, trace_id)
VALUES
  ('campaign_analysis.pipe', 1250, 840, 0.0125, 'success', 0, 'trace_rr_8849a0'),
  ('creative_intelligence.pipe', 850, 1120, 0.0180, 'success', 0, 'trace_rr_8849b1'),
  ('campaign_optimization.pipe', 1, 450, 0.0045, 'escalated', 1, 'trace_rr_8849c2')
ON CONFLICT DO NOTHING;

-- ================================================================
--  SUCCESS! All 10 tables, triggers, security policies, and seed data created.
-- ================================================================
