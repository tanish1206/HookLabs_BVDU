-- ================================================================
--  HookLabs × RocketRide Buildathon — PS #10 Schema Additions
--  Run this query in the SQL Editor of your NEW Hackathon Supabase Project.
-- ================================================================

-- ── Enable required extensions ─────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
--  TABLE: campaigns
--  Tracks ad campaigns across platforms (Meta, Google, TikTok)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  platform         TEXT        NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok', 'other')),
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'learning', 'archived')),
  daily_budget     NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  total_spend      NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  target_roas      NUMERIC(5, 2)  NOT NULL DEFAULT 2.50,
  current_roas     NUMERIC(5, 2)  NOT NULL DEFAULT 0.00,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_select_own" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "campaigns_insert_own" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "campaigns_update_own" ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "campaigns_delete_own" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns (user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status  ON public.campaigns (status);


-- ================================================================
--  TABLE: campaign_metrics
--  Granular time-series metrics per campaign (impressions, spend, conversions)
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
CREATE POLICY "campaign_metrics_select_own" ON public.campaign_metrics FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_metrics.campaign_id AND c.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_metrics_campaign_id ON public.campaign_metrics (campaign_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp   ON public.campaign_metrics (timestamp DESC);


-- ================================================================
--  TABLE: creative_memory
--  Compounding intelligence store for winning hooks, formats, and messages
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
CREATE POLICY "creative_memory_select_all" ON public.creative_memory FOR SELECT USING (TRUE);
CREATE POLICY "creative_memory_insert_own" ON public.creative_memory FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "creative_memory_update_own" ON public.creative_memory FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');


-- ================================================================
--  TABLE: approval_requests
--  Human-in-the-Loop review queue for high-risk spend/campaign actions
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
CREATE POLICY "approval_select_own" ON public.approval_requests FOR SELECT USING (TRUE);
CREATE POLICY "approval_update_own" ON public.approval_requests FOR UPDATE USING (TRUE);


-- ================================================================
--  TABLE: pipeline_runs
--  RocketRide multi-agent pipeline telemetry & batch processing observability
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
CREATE POLICY "pipeline_runs_select_all" ON public.pipeline_runs FOR SELECT USING (TRUE);
