// app/api/feedback-analysis/route.ts
// POST { feedbackStats, recentScripts }
// → Calls Claude for AI-powered improvement recommendations

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, FEEDBACK_TOKENS } from "@/lib/constants";
import type { FeedbackStats, Hook } from "@/lib/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

function buildFeedbackPrompt(stats: FeedbackStats, scripts: Hook[]): string {
  const scriptSummary = scripts
    .slice(0, 3)
    .map((s) => `- "${s.hook_line}" [${s.tone_tag ?? "unknown"}]`)
    .join("\n");

  return `You are a short-form video analytics expert. Analyze this creator's performance data and give actionable recommendations.

Performance Stats:
- Average CTR: ${stats.avgCtr}%
- Average Retention: ${stats.avgRetention}%
- Total Videos: ${stats.totalVideos}
- Top Performing Tone: ${stats.topTone ?? "unknown"}
- Top Performing Format: ${stats.topFormat ?? "unknown"}

Recent Scripts:
${scriptSummary || "No recent scripts"}

Return ONLY valid JSON:
{
  "insights": [
    "Insight 1 about what's working",
    "Insight 2 about improvement area",
    "Insight 3 about trend opportunity"
  ],
  "recommended_tone": "Punchy",
  "recommended_hook_styles": ["Question", "Shocking Stat"],
  "avoid": ["Wordy intros", "Soft CTAs"],
  "optimized_cta": "Follow for more AI secrets →",
  "confidence": 78
}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { feedbackStats, recentScripts = [] } = body;

    if (!feedbackStats) {
      return NextResponse.json({ error: "feedbackStats is required" }, { status: 400 });
    }

    const message = await client.messages.create({
      model:      CLAUDE_MODEL,
      max_tokens: FEEDBACK_TOKENS,
      messages: [
        {
          role:    "user",
          content: buildFeedbackPrompt(feedbackStats as FeedbackStats, recentScripts as Hook[]),
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error("[api/feedback-analysis]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
