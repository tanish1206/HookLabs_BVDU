import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('video') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    const trendText = formData.get('trendText') as string || ''
    const hookLabel = formData.get('hookLabel') as string || 'Hook'
    const hookStyle = formData.get('hookStyle') as string || ''
    const hookLine  = formData.get('hookLine') as string || ''
    const body      = formData.get('body') as string || ''
    const cta       = formData.get('cta') as string || ''
    const wordCount = parseInt(formData.get('wordCount') as string || '0', 10)
    const toneTag   = formData.get('toneTag') as string || ''
    
    // Attempt standard bucket names, fallback to whichever works
    let bucketName = 'videos-bucket'
    let publicUrl = ''
    
    // We'll create a unique folder for the user
    // e.g. "USER_ID/UUID.webm"
    const fileName = `${user.id}/${randomUUID()}.webm`

    // Try 'videos-bucket' first, and if it fails, 'tts-audio'
    let uploadRes = await supabase.storage.from(bucketName).upload(fileName, file, {
      contentType: 'video/webm'
    })

    if (uploadRes.error) {
       console.warn('Cannot upload to videos-bucket, falling back to tts-audio:', uploadRes.error)
       bucketName = 'tts-audio'
       uploadRes = await supabase.storage.from(bucketName).upload(fileName, file, {
          contentType: 'video/webm'
       })
    }

    if (uploadRes.error) {
      console.error('[api/save-video] Final upload error:', uploadRes.error)
      return NextResponse.json({ error: 'Failed to upload video to Supabase Storage' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName)
    publicUrl = urlData.publicUrl

    // Now save to videos table using the full metadata
    const { saveVideo } = await import("@/lib/supabase/videos");
    const videoId = await saveVideo({
        trendText,
        hookLine,
        body,
        cta,
        hookLabel,
        hookStyle,
        wordCount,
        toneTag,
        format: '9:16',
        hookScore: 95,
        viralScore: 92
    });

    // Update with the final URL and set public
    await supabase.from('videos').update({
        video_url: publicUrl,
        render_status: 'done',
        is_public: true // immediately put in gallery
    }).eq('id', videoId);

    // Increment quota counter (fire and forget)
    import("@/lib/supabase/quota")
      .then(({ incrementVideoUsage }) => incrementVideoUsage(user.id))
      .catch((e) => console.error("[api/save-video] quota increment failed:", e));

    return NextResponse.json({ url: publicUrl, videoId }, { status: 200 })

  } catch (error: any) {
    console.error('[api/save-video] unhandled error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
