// app/api/trends/route.ts
// GET /api/trends?limit=12 — returns trends from Supabase cache
// GET /api/trends/search?q=query — fuzzy-search trends by title

import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_TRENDS } from "@/lib/constants";

export const revalidate = 300; // Vercel edge cache: 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q     = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "12");

  const forceRefresh = searchParams.get("refresh") === "true";

  try {
    if (q) {
      // ── Search mode ───────────────────────────────────────
      const { searchTrends } = await import("@/lib/supabase/trends");
      const trends = await searchTrends(q, 8);
      return NextResponse.json({ trends }, {
        headers: { "Cache-Control": "public, s-maxage=60" },
      });
    }

    // ── Normal mode: serve from Supabase cache ─────────────
    const { getActiveTrends } = await import("@/lib/supabase/trends");
    let trends = await getActiveTrends(limit);

    // Fetch live data if requested or cache is empty
    if (forceRefresh || trends.length === 0) {
      try {
        const idRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", { cache: 'no-store' });
        const ids = await idRes.json();
        const items = await Promise.allSettled(
          ids.slice(0, limit).map((id: number) => 
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { cache: 'no-store' }).then(r => r.json())
          )
        );
        const hnTrends = items
          .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && !!r.value?.title)
          .map(r => ({
            id: String(r.value.id),
            text: r.value.title as string,
            source: "hacker_news" as const,
            score: Math.min(Math.round(((r.value.score as number) ?? 0) / 10), 100),
            url: r.value.url ?? null,
            category: null,
            region: "global",
          }));

        let redTrends: any[] = [];
        try {
          const redRes = await fetch(`https://www.reddit.com/r/technology/hot.json?limit=${limit}`, { 
            headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"},
            cache: 'no-store'
          });
          if (redRes.ok) {
            const redData = await redRes.json();
            redTrends = (redData?.data?.children ?? []).map((c: any) => ({
              id: c.data.id,
              text: c.data.title as string,
              source: "reddit" as const,
              score: Math.min(Math.round(((c.data.score as number) ?? 0) / 100), 100),
              url: `https://reddit.com${c.data.permalink}`,
              category: "technology",
              region: "global",
            }));
          }
        } catch (redditError) {
          console.warn("[api/trends] Reddit fetch failed:", redditError);
        }

        trends = [...hnTrends, ...redTrends].sort((a,b) => b.score - a.score).slice(0, limit);

        // Upsert into cache
        if (trends.length > 0) {
          const { upsertTrends } = await import("@/lib/supabase/trends");
          await upsertTrends(trends.map(t => ({
            title: t.text,
            source: t.source,
            virality_score: t.score,
            url: t.url ?? undefined,
          })));
        }
      } catch (e) {
        console.warn("[api/trends] Live fetch failed, falling back to mock:", e);
      }
    }

    // Fallback to static data if DB is empty and live fetch failed
    if (trends.length === 0) {
      trends = (FALLBACK_TRENDS ?? []).slice(0, limit).map((t: Record<string, unknown>, i: number) => ({
        id:       String(i),
        text:     t.text as string,
        source:   (t.source ?? "manual") as "reddit" | "hacker_news" | "google_trends" | "manual",
        score:    (t.score ?? 50) as number,
        url:      null,
        category: null,
        region:   "global",
      }));
    }

    return NextResponse.json(
      { trends, source: trends.length > 0 ? "live" : "mock" },
      { headers: { "Cache-Control": "public, s-maxage=300" } }
    );
  } catch (err) {
    console.error("[api/trends] error:", err);
    return NextResponse.json({ trends: [], source: "error" }, { status: 500 });
  }
}
