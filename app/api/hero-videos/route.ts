// Next.js will cache this at build time with `cache: 'force-cache'`
// Pexels video IDs are stable — URLs don't change

export const revalidate = 86400  // refresh once per day

export async function GET() {
  const videoIds = ['3129977','3782037','856110',
                    '3573563','4065975','1851190','4145353']
  
  const videos = await Promise.all(
    videoIds.map(async (id) => {
      const res = await fetch(
        `https://api.pexels.com/videos/videos/${id}`,
        {
          headers: { Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || '' },
          next: { revalidate: 86400 },
        }
      )
      if (!res.ok) return null
      const data = await res.json()
      
      // Pick best SD portrait file instead of HD for performance
      const files = data.video_files || []
      const best = files.find((f: any) => f.quality === 'sd')
        || files.find((f: any) => f.height <= 540)
        || files.filter((f: any) => f.height > f.width)
            .sort((a: any, b: any) => b.height - a.height)[0]
        || files[0]
      
      return {
        id,
        url:       best?.link || '',
        thumbnail: data.image  || '',
      }
    })
  )
  
  return Response.json(videos.filter(Boolean))
}
