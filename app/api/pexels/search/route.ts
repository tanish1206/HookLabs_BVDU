import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { VideoResult } from '@/lib/types'

const PEXELS_BASE = 'https://api.pexels.com/videos/search'

function mapPexelsVideo(v: any): VideoResult {
  const files: any[] = v.video_files || []
  const portrait = files
    .filter(f => f.height > f.width && f.quality === 'hd')
    .sort((a, b) => b.height - a.height)[0]
  const bestFile = portrait
    || files.find(f => f.height > f.width)
    || files[0]

  return {
    id:               String(v.id),
    url:              bestFile?.link || '',
    width:            bestFile?.width  || v.width,
    height:           bestFile?.height || v.height,
    duration:         v.duration,
    thumbnail:        v.image,
    pexels_url:       v.url,
    videographer:     v.user?.name || 'Pexels',
    videographer_url: v.user?.url  || 'https://www.pexels.com',
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query   = searchParams.get('q')?.trim()
  const page    = parseInt(searchParams.get('page') || '1')
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '12'), 20)

  if (!query) {
    return NextResponse.json({ error: 'query required' }, { status: 400 })
  }

  const cacheKey = `${query.toLowerCase().replace(/\s+/g, '_')}_p${page}`

  const { data: cached } = await supabase
    .from('pexels_cache')
    .select('results, cached_at')
    .eq('cache_key', cacheKey)
    .gt('cached_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .single()

  if (cached?.results && (cached.results as any).videos?.length > 0) {
    return NextResponse.json({ ...cached.results, from_cache: true })
  }

  const url = new URL(PEXELS_BASE)
  url.searchParams.set('query',       query)
  url.searchParams.set('orientation', 'portrait')
  url.searchParams.set('size',        'medium')
  url.searchParams.set('per_page',    String(perPage))
  url.searchParams.set('page',        String(page))

  const pexelsRes = await fetch(url.toString(), {
    headers: { Authorization: process.env.PEXELS_API_KEY! },
    next: { revalidate: 3600 },
  })

  if (!pexelsRes.ok) {
    if (pexelsRes.status === 429) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Video search temporarily unavailable.' },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: 'pexels_error' }, { status: 500 })
  }

  const remaining = pexelsRes.headers.get('X-Ratelimit-Remaining')
  const resetTime = pexelsRes.headers.get('X-Ratelimit-Reset')
  if (remaining) {
    console.log(`[pexels] Quota remaining: ${remaining}, resets: ${resetTime}`)
  }

  const data = await pexelsRes.json()
  // Client-side filter for truly portrait results
  const videos: VideoResult[] = (data.videos || [])
    .map(mapPexelsVideo)
    .filter((v: VideoResult) => v.height >= v.width)

  const result = { videos, total_results: data.total_results, page, per_page: perPage, from_cache: false }

  await supabase
    .from('pexels_cache')
    .upsert({ cache_key: cacheKey, query: query.toLowerCase(), page, results: result, cached_at: new Date().toISOString() })

  return NextResponse.json(result)
}
