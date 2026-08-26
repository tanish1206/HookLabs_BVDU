// lib/constants.ts
// Single source of truth for all magic numbers, keys, and config.

// ── Claude / Anthropic ────────────────────────────────────────
export const CLAUDE_MODEL    = "claude-3-5-sonnet-20241022";
export const MAX_TOKENS      = 1200;
export const FEEDBACK_TOKENS = 700;

// ── Storage (Supabase table names) ───────────────────────────
export const TABLES = {
  VIDEOS:        "videos",
  FEEDBACK:      "feedback",
  TRENDS_CACHE:  "trends_cache",
  USERS_METADATA: "users_metadata",
} as const;

// ── Trends cache ──────────────────────────────────────────────
export const TRENDS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ── Audio player ──────────────────────────────────────────────
export const AUDIO_DURATION_SECONDS = 30;
export const AUDIO_TICK_MS          = 100;

// ── Pipeline steps ────────────────────────────────────────────
export const STEPS = {
  TREND:     1,
  SCRIPT:    2,
  VOICEOVER: 3,
  PREVIEW:   4,
} as const;

// ── Scoring thresholds ────────────────────────────────────────
export const SCORE_THRESHOLDS = {
  GOOD: 70,
  OK:   50,
} as const;

// ── Waveform ──────────────────────────────────────────────────
export const WAVEFORM_BAR_COUNT = 60;
export const WAVEFORM_SEED      = 42;

// ── Tab names ─────────────────────────────────────────────────
export const TABS = ["Pipeline", "A/B Test", "History", "Feedback Loop"] as const;

// ── Video export ──────────────────────────────────────────────
export const EXPORT_RENDER_MS  = 2500;
export const EXPORT_DIMENSIONS = { width: 1080, height: 1920 } as const;

// ── ElevenLabs voice ID mapping ───────────────────────────────
// Voice name → ElevenLabs voice ID
export const ELEVENLABS_VOICE_IDS: Record<string, string> = {
  Aria:   "21m00Tcm4TlvDq8ikWAM", // Rachel
  Marcus: "pNInz6obpgDQGcFmaJgB", // Adam
  Zoe:    "AZnzlk1XvdvUeBnXmlld", // Domi
  Kai:    "MF3mGyEYCl7XYWbV9V6O", // Elli
};

// ── Stripe plans ─────────────────────────────────────────────
export const PLAN_LIMITS = {
  free: 3,
  pro:  Infinity,
  team: Infinity,
} as const;

export const PLAN_PRICES = {
  free: 0,
  pro:  19,
  team: 49,
} as const;

// ── Remotion ─────────────────────────────────────────────────
export const REMOTION_COMPOSITION_ID = "ShortVideo";
export const REMOTION_FPS            = 30;
export const REMOTION_WIDTH          = 1080;
export const REMOTION_HEIGHT         = 1920;

// ── Format → gradient map (for Remotion composition) ─────────
export const FORMAT_GRADIENTS: Record<string, [string, string]> = {
  "YouTube Short": ["#FF0000", "#CC0000"],
  "TikTok":        ["#010101", "#69C9D0"],
  "Instagram Reel":["#833AB4", "#FD1D1D"],
};

// ── Fallback trends (used when Supabase DB is empty) ──────────
export const FALLBACK_TRENDS: Array<{ text: string; source: string; score: number }> = [
  { text: "AI agents are now writing their own languages to communicate faster", source: "hacker_news", score: 98 },
  { text: "Show HN: Local-first database that synchronizes over sound waves",    source: "hacker_news", score: 92 },
  { text: "The Dopamine-First approach to deep work in 2025",                    source: "reddit",       score: 84 },
  { text: "Vibe coding is replacing traditional pair programming",               source: "reddit",       score: 79 },
  { text: "Why everyone is switching to Cursor from VS Code",                    source: "reddit",       score: 76 },
  { text: "Sam Altman says AGI will be built this decade",                       source: "hacker_news",  score: 71 },
  { text: "The new Apple Vision Pro killer feature nobody is talking about",     source: "reddit",       score: 68 },
  { text: "How I went from 0 to 50k subscribers in 90 days using AI",           source: "reddit",       score: 65 },
];
