// types/database.ts
// TypeScript type aliases for the HookLabs Supabase schema.
// Run `npx supabase gen types typescript --project-id <YOUR_ID> > types/database.ts`
// to replace the `Database` type below with the generated version once Supabase is set up.

// ── Raw Supabase DB type (replace with generated when available) ──
export type Database = {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          user_id: string;
          trend: string;
          trend_source: string | null;
          trend_id: string | null;
          hook_label: string | null;
          hook_style: string | null;
          hook_line: string;
          body: string;
          cta: string;
          word_count: number | null;
          tone_tag: string | null;
          format: string | null;
          tone: string | null;
          duration: number | null;
          voice: string | null;
          hook_score: number | null;
          est_ctr: string | null;
          retention: string | null;
          viral_score: number | null;
          was_edited: boolean;
          edited_hook: string | null;
          edited_body: string | null;
          edited_cta: string | null;
          is_public: boolean;
          render_status: "pending" | "rendering" | "done" | "error" | null;
          video_url: string | null;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["videos"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
      };
      trends_cache: {
        Row: {
          id: string;
          title: string;
          source: string;
          virality_score: number;
          url: string | null;
          category: string | null;
          region: string;
          is_active: boolean;
          fetched_at: string;
          expires_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["trends_cache"]["Row"], "id" | "fetched_at">;
        Update: Partial<Database["public"]["Tables"]["trends_cache"]["Insert"]>;
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          platform: string;
          actual_views: number | null;
          actual_ctr: number | null;
          actual_retention: number | null;
          actual_shares: number | null;
          platform_video_id: string | null;
          data_source: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["feedback"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["feedback"]["Insert"]>;
      };
      users_metadata: {
        Row: {
          user_id: string;
          plan: "free" | "pro" | "team";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          videos_used_this_month: number;
          reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users_metadata"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users_metadata"]["Insert"]>;
      };
      campaigns: {
        Row: {
          id: string;
          user_id?: string;
          name: string;
          platform: string;
          status: string;
          daily_budget: number;
          total_spend: number;
          target_roas: number;
          current_roas: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: Partial<Database["public"]["Tables"]["campaigns"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Row"]>;
      };
      campaign_metrics: {
        Row: {
          id: string;
          campaign_id: string;
          timestamp?: string;
          impressions: number;
          clicks: number;
          spend: number;
          conversions: number;
          revenue: number;
          ctr: number;
          cpc: number;
          roas: number;
        };
        Insert: Partial<Database["public"]["Tables"]["campaign_metrics"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["campaign_metrics"]["Row"]>;
      };
      creative_memory: {
        Row: {
          id: string;
          user_id?: string;
          message_hook: string;
          format_type: string;
          audience_segment: string;
          platform: string;
          roas_multiplier: number;
          ctr_lift: number;
          sample_size: number;
          confidence_score: number;
          insights: string;
          updated_at?: string;
        };
        Insert: Partial<Database["public"]["Tables"]["creative_memory"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["creative_memory"]["Row"]>;
      };
      approval_requests: {
        Row: {
          id: string;
          campaign_id?: string | null;
          action_type: string;
          proposed_change: any;
          current_budget?: number;
          proposed_budget?: number;
          risk_level: string;
          confidence_score: number;
          status: string;
          reasoning: string;
          created_at?: string;
          reviewed_at?: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["approval_requests"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["approval_requests"]["Row"]>;
      };
      pipeline_runs: {
        Row: {
          id: string;
          pipeline_name: string;
          records_count: number;
          execution_time_ms: number;
          approx_cost: number;
          status: string;
          error_log?: string | null;
          escalations_count: number;
          trace_id: string;
          created_at?: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pipeline_runs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["pipeline_runs"]["Row"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

// ── Friendly domain type aliases ─────────────────────────────────

export type TrendTopic = {
  id: string;
  text: string;
  source: "reddit" | "google_trends" | "hacker_news" | "manual";
  score: number;          // virality_score, 0-100
  url: string | null;
  category: string | null;
  region: string;
};

export type HookScript = {
  label: string;
  style: string;
  hook_line: string;
  body: string;
  cta: string;
  word_count: number;
  tone_tag: string;
};

export type ScriptGenerationResult = {
  hooks: HookScript[];
  hook_score: number;
  est_ctr: string;
  retention: string;
  viral_score: number;
};

export type QuotaStatus = {
  allowed: boolean;
  used: number;
  limit: number;   // -1 = unlimited
  plan: "free" | "pro" | "team";
  month: string;
};

export type FeedbackLoopContext = {
  stats: {
    total_videos: number;
    avg_ctr: number;
    avg_retention: number;
    total_views: number;
    top_tone: string;
    top_format: string;
    top_hook_style: string;
  };
  recent_scripts: Array<{
    hook_line: string;
    hook_style: string;
    tone: string;
    hook_score: number;
    actual_ctr: number;
    actual_ret: number;
  }>;
  ctr_by_tone: Record<string, number>;
};

export type GalleryVideo = {
  id: string;
  trend: string;
  hook_line: string;
  hook_style: string | null;
  format: string | null;
  hook_score: number | null;
  viral_score: number | null;
  thumbnail_url: string | null;
  video_url: string | null;
  created_at: string;
};

export type UserProfile = {
  user_id: string;
  plan: "free" | "pro" | "team";
  videos_used_this_month: number;
  videos_limit: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  reset_date: string;
};

export type SaveVideoParams = {
  trendText: string;
  trendSource?: string;
  trendId?: string;
  hookLabel: string;
  hookStyle: string;
  hookLine: string;
  body: string;
  cta: string;
  wordCount?: number;
  toneTag?: string;
  format?: string;
  tone?: string;
  duration?: number;
  voice?: string;
  hookScore?: number;
  estCtr?: string;
  retention?: string;
  viralScore?: number;
  wasEdited?: boolean;
  editedHook?: string;
  editedBody?: string;
  editedCta?: string;
};

export type SaveFeedbackParams = {
  videoId: string;
  platform: string;
  actualViews?: number;
  actualCtr?: number;
  actualRetention?: number;
  actualShares?: number;
  platformVideoId?: string;
  dataSource?: string;
};
