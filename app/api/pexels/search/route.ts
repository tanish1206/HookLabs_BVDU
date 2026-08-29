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

const FALLBACK_VIDEOS: VideoResult[] = [
  {
    id: "demo_vid_001",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4",
    width: 1080,
    height: 1920,
    duration: 15,
    thumbnail: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
    pexels_url: "https://www.pexels.com",
    videographer: "Pexels Creator",
    videographer_url: "https://www.pexels.com",
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query   = searchParams.get('q')?.trim() || "business"
  const page    = parseInt(searchParams.get('page') || '1')
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '12'), 20)

  if (!process.env.PEXELS_API_KEY) {
    return NextResponse.json({
      videos: FALLBACK_VIDEOS,
      total_results: 1,
      page,
      per_page: perPage,
      from_cache: true,
      demo_fallback: true
    })
  }

  try {
    const url = new URL(PEXELS_BASE)
    url.searchParams.set('query',       query)
    url.searchParams.set('orientation', 'portrait')
    url.searchParams.set('size',        'medium')
    url.searchParams.set('per_page',    String(perPage))
    url.searchParams.set('page',        String(page))

    const pexelsRes = await fetch(url.toString(), {
      headers: { Authorization: process.env.PEXELS_API_KEY },
      next: { revalidate: 3600 },
    })

    if (!pexelsRes.ok) {
      return NextResponse.json({ videos: FALLBACK_VIDEOS, total_results: 1, page, per_page: perPage, from_cache: true })
    }

    const data = await pexelsRes.json()
    const videos: VideoResult[] = (data.videos || [])
      .map(mapPexelsVideo)
      .filter((v: VideoResult) => v.height >= v.width)

    return NextResponse.json({ videos: videos.length ? videos : FALLBACK_VIDEOS, total_results: data.total_results || 1, page, per_page: perPage, from_cache: false })
  } catch (err) {
    return NextResponse.json({ videos: FALLBACK_VIDEOS, total_results: 1, page, per_page: perPage, from_cache: true })
  }
}
