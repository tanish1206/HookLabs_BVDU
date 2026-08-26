import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { TTS_QUOTA } from '@/lib/quotaConfig'
import { createHash } from 'crypto'

const VOICE_MAP: Record<string, string> = {
  'Aria':   '9BWtsMINqrJLrRacOk9x',
  'Marcus': 'CwhRBWXzGAHq8TQ4Fs17',
  'Zoe':    'FGY2WhTYpPnrIDTdsKH5',
  'Kai':    'IKne3meq5aSn9XLyUdCD',
}

const TTS_MODEL = 'eleven_flash_v2_5'

// In-memory rate limiter per Vercel instance
const rateLimitMap = new Map<string, number>()

function buildTTSText(script: { hook_line: string; body: string; cta: string }, maxChars: number): string {
  const hook = script.hook_line?.trim() || ''
  const cta = script.cta?.trim() || ''
  
  // Try to fit the first few sentences of the body
  const bodySentences = (script.body || '')
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
  
  let keptBody = ''
  for (const sentence of bodySentences) {
    // Check if adding this sentence plus hook+cta exceeds maxChars
    // +2 for newlines
    const projectedLength = hook.length + keptBody.length + sentence.length + cta.length + 2
    if (keptBody === '' || projectedLength <= maxChars) {
      keptBody += (keptBody ? ' ' : '') + sentence
    } else {
      break
    }
  }

  return [hook, keptBody, cta]
    .filter(Boolean)
    .join('\n')
    .trim()
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // ── 1. Rate Limiting ─────────────────────────────────────────
  const lastCall = rateLimitMap.get(user.id) || 0
  const now = Date.now()
  const RATE_LIMIT_MS = TTS_QUOTA.RATE_LIMIT_SECONDS * 1000

  if (now - lastCall < RATE_LIMIT_MS) {
    const waitSecs = Math.ceil((RATE_LIMIT_MS - (now - lastCall)) / 1000)
    return NextResponse.json({
      error:   'rate_limited',
      message: `Please wait ${waitSecs} seconds before generating another voiceover.`,
      wait_seconds: waitSecs,
    }, { status: 429 })
  }
  rateLimitMap.set(user.id, now)

  // ── Parse body ─────────────────────────────────────────────
  let body: {
    hook_line?: string
    body?:     string
    cta?:      string
    voice?:    string
    text?:     string
    duration?: number 
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const voiceName = body.voice || 'Aria'
  const voiceId   = VOICE_MAP[voiceName] || VOICE_MAP['Aria']
  
  // Calculate character limit based on duration (approx 14 chars/sec)
  const targetChars = body.duration ? body.duration * 14 : TTS_QUOTA.MAX_CHARS_PER_REQUEST
  const maxChars = Math.min(targetChars, TTS_QUOTA.MAX_CHARS_PER_REQUEST)

  let spokenText: string
  if (body.text) {
    spokenText = body.text.slice(0, maxChars)
  } else if (body.hook_line) {
    spokenText = buildTTSText({
      hook_line: body.hook_line || '',
      body:      body.body      || '',
      cta:       body.cta       || '',
    }, maxChars)
  } else {
    return NextResponse.json({ error: 'missing_text', message: 'Provide hook_line+body+cta or text.' }, { status: 400 })
  }

  const trimmedText = spokenText
  const charCount   = trimmedText.length

  // Use admin client for Quota/Cache (bypasses RLS)
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── 2. Caching ───────────────────────────────────────────────
  const cacheKey = createHash('md5')
    .update(`${trimmedText}__${voiceName}`)
    .digest('hex')

  const { data: cachedAudio } = await adminSupabase
    .from('tts_cache')
    .select('audio_url, char_count')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (cachedAudio) {
    const audioRes = await fetch(cachedAudio.audio_url)
    if (audioRes.ok) {
      const audioBuffer = await audioRes.arrayBuffer()
      console.log(`[tts] Cache HIT for ${cacheKey.slice(0,8)} — saved ${charCount} chars`)
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type':   'audio/mpeg',
          'X-Cache':        'HIT',
          'X-Chars-Used':   '0',
        },
      })
    }
  }

  // ── 3. Quota Check ───────────────────────────────────────────
  const { data: quotaCheck, error: quotaErr } = await adminSupabase
    .rpc('increment_tts_usage', {
      p_user_id: user.id,
      p_chars:   charCount,
      p_voice:   voiceName,
    })

  if (quotaErr) {
    console.error('[tts] quota check failed:', quotaErr)
  } else if (quotaCheck && !quotaCheck.allowed) {
    const reason = quotaCheck.reason
    if (reason === 'global_budget_exhausted') {
      return NextResponse.json({
        error:    'tts_quota_exhausted',
        message:  'Monthly voice budget is exhausted. Resets on the 1st.',
        fallback: true,
        global_used:   quotaCheck.global_used,
        global_budget: quotaCheck.global_budget,
      }, { status: 429 })
    }
    if (reason === 'user_limit_exhausted') {
      return NextResponse.json({
        error:    'tts_user_limit',
        message:  'You have reached your personal voice generation limit for this month.',
        fallback: true,
        user_used:  quotaCheck.user_used,
        user_limit: quotaCheck.user_limit,
      }, { status: 429 })
    }
  }

  // Alerts
  if (quotaCheck) {
    const PCT = (quotaCheck.global_used / quotaCheck.global_budget) * 100
    if (PCT >= TTS_QUOTA.CRITICAL_THRESHOLD_PCT) {
      console.error(`🚨 [tts] CRITICAL: Global quota at ${PCT.toFixed(1)}%`)
    } else if (PCT >= TTS_QUOTA.WARNING_THRESHOLD_PCT) {
      console.warn(`⚠️ [tts] WARNING: Global quota at ${PCT.toFixed(1)}%`)
    }
  }

  console.log(`[tts] MISS - generating user=${user.id.slice(0, 8)} voice=${voiceName} chars=${charCount}`)

  // ── 4. Call ElevenLabs API ────────────────────────────────────
  let elevenlabsResBuf: ArrayBuffer
  try {
    const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! })
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: trimmedText,
      modelId: TTS_MODEL,
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.3,
        useSpeakerBoost: true,
      }
    })

    // Consume stream into buffer
    const chunks = []
    for await (const chunk of audioStream as any) {
      chunks.push(chunk)
    }
    elevenlabsResBuf = Buffer.concat(chunks).buffer as ArrayBuffer
  } catch (err: any) {
    console.error('[tts] ElevenLabs error:', err)
    if (err.statusCode === 429 || err.statusCode === 401 || err.statusCode === 402) {
      return NextResponse.json({ error: 'tts_quota_exceeded', message: 'Monthly voice limit reached or invalid key. Audio preview is unavailable.', fallback: true }, { status: 429 })
    }
    return NextResponse.json({ error: 'tts_error', message: 'Voice generation failed. Please try again.' }, { status: 500 })
  }

  // ── 5. Cache the Result Upload to Supabase Storage ───────────
  try {
    const fileName = `tts/${cacheKey}.mp3`
    await adminSupabase.storage
      .from('tts-audio')
      .upload(fileName, elevenlabsResBuf, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    const { data: urlData } = adminSupabase.storage
      .from('tts-audio')
      .getPublicUrl(fileName)

    await adminSupabase.from('tts_cache').upsert({
      cache_key:  cacheKey,
      audio_url:  urlData.publicUrl,
      char_count: charCount,
    })
  } catch (cacheErr) {
    console.error('[tts] Cache save failed:', cacheErr)
  }

  return new NextResponse(elevenlabsResBuf, {
    status: 200,
    headers: {
      'Content-Type':   'audio/mpeg',
      'X-Chars-Used':   String(charCount),
      'Cache-Control':  'no-store',
    },
  })
}
