// lib/types.ts
// Central TypeScript types for HookLabs AI — replaces src/propTypes.js

export interface TrendTopic {
  id: string | number;
  text: string;
  source: string;
  score: number;
  url?: string | null;
}

export interface Hook {
  label: string;
  style?: string;
  hook_line: string;
  body: string;
  cta: string;
  word_count?: number;
  tone_tag?: string;
}

export interface Metrics {
  hook_score?: number;
  est_ctr?: string | number;
  retention?: string | number;
  viral_score?: number;
}

export interface VideoRecord {
  id: string;
  user_id?: string;
  trend: string;
  hook: Hook;
  metrics?: Metrics;
  voice?: string;
  format?: string;
  tone?: string;
  createdAt: string;
  is_public?: boolean;
}

export interface FeedbackEntry {
  id: string;
  user_id: string;
  video_id: string;
  actual_ctr: number;
  actual_retention: number;
  views: number;
  tone?: string;
  format?: string;
  createdAt: string;
}

export interface FeedbackStats {
  avgCtr: number;
  avgRetention: number;
  totalVideos: number;
  topTone?: string;
  topFormat?: string;
}

export interface Recommendations {
  insights: string[];
  recommended_tone?: string;
  recommended_hook_styles?: string[];
  avoid?: string[];
  optimized_cta?: string;
  confidence?: number;
}

export type PlanType = "free" | "pro" | "team";

export interface UserMetadata {
  user_id: string;
  plan: PlanType;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  videos_used_this_month: number;
  reset_date?: string;
}

export interface GenerateScriptRequest {
  trend: string;
  format: string;
  tone: string;
  duration: number;
}

export interface GenerateScriptResponse {
  hooks: Hook[];
  hook_score: number;
  est_ctr: string;
  retention: string;
  viral_score: number;
}

export interface ExportVideoRequest {
  script: Hook;
  voice: string;
  format: string;
}

export interface ExportVideoResponse {
  renderId: string;
  status: "rendering" | "done" | "error";
  downloadUrl?: string;
}

export interface VideoResult {
  id:               string
  url:              string
  width:            number
  height:           number
  duration:         number
  thumbnail:        string
  pexels_url:       string
  videographer:     string
  videographer_url: string
}

export interface SubtitleLine {
  id:    number
  text:  string
  start: number
  end:   number
}

export interface SubtitleStyle {
  fontFamily:    string
  fontSize:      number
  color:         string
  bgStyle:       'None' | 'Pill' | 'Bar' | 'Highlighted'
  bgOpacity:     number
  position:      'Top' | 'Center' | 'Bottom'
  animation:     'None' | 'Fade' | 'Pop' | 'Slide Up'
  textTransform: 'Normal' | 'UPPERCASE'
  outline:       boolean
}
