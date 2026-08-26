// app/api/cron/ingest-trends/route.ts
// Vercel Cron — runs every 15 minutes.
// Fetches HN + Reddit and upserts into trends_cache, then expires old trends.
// cron schedule: "*/15 * * * *"

import { NextRequest, NextResponse } from "next/server";

async function fetchHN(limit = 10): Promise<Array<{ title: string; source: string; virality_score: number; url?: string }>> {
  const ids: number[] = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
    .then(r => r.json());
  const items = await Promise.allSettled(
    ids.slice(0, 20).map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
    )
  );
  return items
    .filter((r): r is PromiseFulfilledResult<Record<string, unknown>> => r.status === "fulfilled" && !!r.value?.title)
    .slice(0, limit)
    .map(r => ({
      title:          r.value.title as string,
      source:         "hacker_news",
      virality_score: Math.min(Math.round(((r.value.score as number) ?? 0) / 10), 100),
      url:            (r.value.url as string | undefined),
    }));
}

async function fetchReddit(limit = 10): Promise<Array<{ title: string; source: string; virality_score: number; url?: string; category?: string }>> {
  const subs = ["technology", "worldnews", "science", "programming", "business"];
  const results: Array<{ title: string; source: string; virality_score: number; url?: string; category?: string }> = [];

  await Promise.allSettled(
    subs.map(async sub => {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=4`, {
        headers: { "User-Agent": "HookLabs-Cron/1.0" },
      });
      if (!res.ok) return;
      const json = await res.json();
      const posts = (json?.data?.children ?? []) as Array<{ data: Record<string, unknown> }>;
      posts.filter(p => !p.data.stickied).forEach(p => {
        results.push({
          title:          p.data.title as string,
          source:         "reddit",
          virality_score: Math.min(Math.round(((p.data.score as number) ?? 0) / 100), 100),
          url:            `https://reddit.com${p.data.permalink}`,
          category:       sub,
        });
      });
    })
  );

  return results.slice(0, limit);
}

export async function GET(req: NextRequest) {
  // Validate cron secret
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [hn, reddit] = await Promise.allSettled([fetchHN(10), fetchReddit(10)]);
    const trends = [
      ...(hn.status === "fulfilled" ? hn.value : []),
      ...(reddit.status === "fulfilled" ? reddit.value : []),
    ];

    if (trends.length > 0) {
      const { upsertTrends } = await import("@/lib/supabase/trends");
      await upsertTrends(trends);
    }

    // Expire old trends
    const { expireOldTrends } = await import("@/lib/supabase/trends");
    const expiredCount = await expireOldTrends(30);

    return NextResponse.json({
      ok: true,
      ingested: trends.length,
      expired: expiredCount,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/ingest-trends]", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
