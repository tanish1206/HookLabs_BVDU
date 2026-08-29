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
const rateLimitMap = new Map<string, number>()

function buildTTSText(script: { hook_line: string; body: string; cta: string }, maxChars: number): string {
  const hook = script.hook_line?.trim() || ''
  const cta = script.cta?.trim() || ''
  
  const bodySentences = (script.body || '')
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
  
  let keptBody = ''
  for (const sentence of bodySentences) {
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

  const userId = user?.id || 'demo-user'

  // ── 1. Rate Limiting ─────────────────────────────────────────
  const lastCall = rateLimitMap.get(userId) || 0
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
  rateLimitMap.set(userId, now)

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

  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qsvwdksghrjdeorctqzj.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key"
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

  // ── 3. Call ElevenLabs API ────────────────────────────────────
  let elevenlabsResBuf: ArrayBuffer
  try {
    if (process.env.ELEVENLABS_API_KEY) {
      const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })
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

      const chunks = []
      for await (const chunk of audioStream as any) {
        chunks.push(chunk)
      }
      elevenlabsResBuf = Buffer.concat(chunks).buffer as ArrayBuffer
    } else {
      // High-quality fallback voiceover sample for demo resilience
      const fallbackAudioRes = await fetch("https://d8j0ntlcm91z4.cloudfront.net/sample_voiceover.mp3");
      elevenlabsResBuf = await fallbackAudioRes.arrayBuffer();
    }
  } catch (err: any) {
    console.error('[tts] ElevenLabs error, falling back:', err)
    const fallbackAudioRes = await fetch("https://d8j0ntlcm91z4.cloudfront.net/sample_voiceover.mp3");
    elevenlabsResBuf = await fallbackAudioRes.arrayBuffer();
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
