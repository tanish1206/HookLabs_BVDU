// app/api/cron/refresh-trends/route.ts
// Vercel Cron Job — fetches HN + Reddit and upserts into trends_cache
// Schedule: */15 * * * * (every 15 minutes)
// Add to vercel.json: { "crons": [{ "path": "/api/cron/refresh-trends", "schedule": "*/15 * * * *" }] }

import { NextRequest, NextResponse } from "next/server";
import type { TrendTopic } from "@/lib/types";

async function fetchHNTrends(): Promise<Omit<TrendTopic, "id">[]> {
  const res  = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  const ids: number[] = await res.json();

  const items = await Promise.allSettled(
    ids.slice(0, 20).map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json())
    )
  );

  return items
    .filter((r): r is PromiseFulfilledResult<Record<string, unknown>> => r.status === "fulfilled" && !!r.value?.title)
    .map((r) => ({
      text:   r.value.title as string,
      source: "hn",
      score:  (r.value.score as number) ?? 0,
      url:    r.value.url as string | undefined,
    }));
}

async function fetchRedditTrends(): Promise<Omit<TrendTopic, "id">[]> {
  const subs = ["technology", "science", "worldnews", "business", "programming"];
  const results: Omit<TrendTopic, "id">[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=5`, {
        headers: { "User-Agent": "HookLabs-Cron/1.0" },
      });
      if (!res.ok) return;
      const json = await res.json();
      const posts: Record<string, unknown>[] = (json?.data?.children ?? []).map(
        (c: Record<string, unknown>) => c.data
      );
      posts
        .filter((p) => !p.stickied)
        .forEach((p) =>
          results.push({
            text:   p.title as string,
            source: "reddit",
            score:  Math.min((p.score as number) ?? 0, 1000),
            url:    `https://reddit.com${p.permalink}`,
          })
        );
    })
  );

  return results;
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [hn, reddit] = await Promise.allSettled([fetchHNTrends(), fetchRedditTrends()]);

    const trends: Omit<TrendTopic, "id">[] = [
      ...(hn.status === "fulfilled" ? hn.value : []),
      ...(reddit.status === "fulfilled" ? reddit.value : []),
    ];

    const trendsToUpsert = trends.map((t) => ({
      title: t.text,
      source: t.source,
      virality_score: t.score,
      url: t.url ?? undefined,
    }));

    if (trendsToUpsert.length > 0 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { upsertTrends } = await import("@/lib/supabase/trends");
      await upsertTrends(trendsToUpsert);
    }

    return NextResponse.json({
      ok:      true,
      fetched: trends.length,
      at:      new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/refresh-trends]", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
