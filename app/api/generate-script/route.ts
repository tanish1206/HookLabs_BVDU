import { createClient }  from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { checkWordQuota, incrementWordUsage } from '@/lib/supabase/quota'


// ── System prompt — the "personality" of HookLabs' script engine ──
// This is what makes the scripts genuinely good.
// Groq + llama-3.3-70b-versatile handles long system prompts well.

const SYSTEM_PROMPT = `You are an elite, top-1% viral short-form scriptwriter (TikTok, Instagram Reels, YouTube Shorts). Your scripts regularly hit 10M+ views because you understand neuroscience, watch-time optimization, and scroll-stopping psychology.

CORE PRINCIPLES:
1. THE 3-SECOND RULE: If the first frame doesn’t hook them, they scroll. The hook must instantly challenge a belief, reveal a massive secret, or create an unbearable information gap.
2. NO FLUFF: Zero introductions. Zero "Hey guys". Zero "In this video". Start in the middle of the action.
3. RELENTLESS PACING: Speak in punchy, rhythmic sentences. No run-on sentences. 
4. THE "RE-HOOK": Every 3-4 sentences, introduce a new spike of curiosity to reset their attention. 
5. SHOW, DON'T PRAY: Give them raw value, controversial opinions, or untold stories. 
6. THE SEAMLESS LOOP: The CTA should naturally flow into the beginning of the video, creating a perfect loop.

CRITICAL LENGTH RULES:
- 15 seconds: EXACTLY 40-50 words. Cut to the bone.
- 30 seconds: EXACTLY 80-100 words. Fast-paced story or 3-step value.
- 60 seconds: EXACTLY 160-200 words. Deep dive, intense storytelling, multiple re-hooks.

You strictly output valid JSON with no markdown formatting. No \`\`\`json blocks. Just the raw JSON object.`

// ── User prompt builder ───────────────────────────────────────────
function buildUserPrompt(
  trend: string,
  format: string,
  tone: string,
  duration: string
): string {
  return `Write a highly-converting short script for ${format}.
TOPIC/TREND: "${trend}"
DESIRED TONE: ${tone}
TARGET DURATION: ${duration}

Generate EXACTLY 3 fiercely unique hook variations.

VARIATION A: THE 'ENEMY' HOOK (Call out a common enemy or misconception)
VARIATION B: THE 'SECRET' HOOK (Reveal something they didn't know existed)
VARIATION C: THE 'STORY' HOOK (Start mid-action of an unbelievable story)

For each variation, output:
1. "hook_line": The opening 1-2 seconds. MAXIMUM 12 WORDS. Mind-blowing. NO questions. Bold statements only.
2. "body": The meat. Break it down into 2-4 punchy paragraphs (use newlines). Include a pattern interrupt. Every sentence must propel the narrative forward.
3. "cta": A highly converting call to action that feels natural, not salesy.

Return exactly this JSON structure and absolutely nothing else:
{
  "hooks": [
    {
      "label": "Hook A (The Enemy)",
      "style": "Enemy",
      "hook_line": "...",
      "body": "...",
      "cta": "...",
      "word_count": 85,
      "tone_tag": "aggressive"
    },
    {
      "label": "Hook B (The Secret)",
      "style": "Secret",
      "hook_line": "...",
      "body": "...",
      "cta": "...",
      "word_count": 92,
      "tone_tag": "mysterious"
    },
    {
      "label": "Hook C (The Story)",
      "style": "Story",
      "hook_line": "...",
      "body": "...",
      "cta": "...",
      "word_count": 88,
      "tone_tag": "narrative"
    }
  ],
  "topic": "${trend}",
  "hook_score": 95,
  "est_ctr": "12.4%",
  "retention": "88%",
  "viral_score": 92
}`
}

export async function POST(request: NextRequest) {
  // ── Auth check ─────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Sign in to generate scripts.' },
      { status: 401 }
    )
  }

  // ── Quota Check ────────────────────────────────────────────
  const quota = await checkWordQuota(user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: 'quota_exceeded', message: `You have reached your ${quota.limit} word generation limit for this month.` },
      { status: 429 }
    )
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'missing_key' });


  // ── Parse body ─────────────────────────────────────────────
  let body: { trend: string; format: string; tone: string; duration: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  const { trend, format, tone, duration } = body

  if (!trend?.trim()) {
    return NextResponse.json(
      { error: 'missing_trend', message: 'A trend topic is required.' },
      { status: 400 }
    )
  }

  // ── Call Groq ──────────────────────────────────────────────
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(trend, format, tone, duration) },
      ],
      temperature: 0.85,       // slightly creative but structured
      max_tokens: 2048,        // enough for 3 full scripts
      response_format: { type: 'json_object' },  // forces valid JSON output
    })

    const rawText = completion.choices[0]?.message?.content ?? ''

    let parsed: any
    try {
      parsed = JSON.parse(rawText)
    } catch {
      console.error('[generate-script] Groq JSON parse failed:', rawText.slice(0, 300))
      return NextResponse.json(
        { error: 'parse_error', message: 'AI response was malformed. Please retry.' },
        { status: 500 }
      )
    }

    if (!Array.isArray(parsed?.hooks) || parsed.hooks.length === 0) {
      return NextResponse.json(
        { error: 'invalid_response', message: 'Unexpected AI response shape. Please retry.' },
        { status: 500 }
      )
    }

    // Ensure each hook has all required fields with fallbacks
    parsed.hooks = parsed.hooks.map((h: any, i: number) => ({
      label:      h.label      ?? `Hook ${String.fromCharCode(65 + i)}`,
      style:      h.style      ?? 'Hook',
      hook_line:  h.hook_line  ?? '',
      body:       h.body       ?? '',
      cta:        h.cta        ?? '',
      word_count: h.word_count ?? 80,
      tone_tag:   h.tone_tag   ?? 'engaging',
    }))

    // Increment user quota
    const totalWords = parsed.hooks.reduce((acc: number, h: any) => acc + (h.word_count || 0), 0);
    if (totalWords > 0) {
      await incrementWordUsage(user.id, totalWords).catch(err => {
         console.error('[generate-script] Failed to increment word usage:', err);
      });
    }

    return NextResponse.json(parsed, { status: 200 })

  } catch (err: any) {
    console.error('[generate-script] Groq error:', err)

    if (err?.status === 429) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'AI is busy — please wait a few seconds and retry.' },
        { status: 429 }
      )
    }
    if (err?.status === 401) {
      return NextResponse.json(
        { error: 'api_key_error', message: 'Script generation unavailable.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'groq_error', message: 'Failed to generate script. Please try again.' },
      { status: 500 }
    )
  }
}
