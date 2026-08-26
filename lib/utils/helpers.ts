// lib/utils/helpers.ts
// Utility functions migrated from src/utils/helpers.js

/** Clamp n between lo and hi */
export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Parse "72%" → 72, "7.2%" → 7.2, or pass through numbers */
export function parsePct(raw: string | number | undefined): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === "number") return raw;
  return parseFloat(raw.replace("%", "")) || 0;
}

/** Return a CSS color string based on a 0–100 score */
export function scoreColor(score: number): string {
  if (score >= 70) return "var(--color-green, #22C55E)";
  if (score >= 50) return "var(--color-amber, #F59E0B)";
  return "var(--color-red, #EF4444)";
}

/** Format large numbers compactly: 1234567 → "1.2M" */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Generate a deterministic retention curve array (0–100 scale, 30 points)
 * that mimics real short-form retention stats.
 */
export function buildRetentionCurve(
  avgRetention: number = 60,
  seed: number = 1
): number[] {
  const points: number[] = [];
  const base = clamp(avgRetention, 20, 95);

  for (let i = 0; i < 30; i++) {
    const t = i / 29;
    // Typical short-form retention: high start, gradual drop
    const natural = 100 * Math.pow(1 - t, 1.4);
    // Add a small pseudo-random variance
    const noise = ((seed * (i + 1) * 1234567) % 100) / 100 - 0.5;
    const point = clamp(natural * (base / 60) + noise * 8, 0, 100);
    points.push(Math.round(point));
  }
  return points;
}

/** Deterministic waveform heights for voice UI */
export function buildWaveform(barCount: number, seed: number): number[] {
  return Array.from({ length: barCount }, (_, i) => {
    const v = Math.sin((i + seed) * 0.7) * 0.5 + Math.sin((i + seed) * 1.4) * 0.3 + 0.2;
    return clamp(Math.abs(v), 0.08, 1);
  });
}

/** Pluralise a word: pluralise("video", 2) → "videos" */
export function pluralise(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

/** Format a timestamp as a human-readable relative date */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)   return "just now";
  if (hours < 1)   return `${mins}m ago`;
  if (days  < 1)   return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
