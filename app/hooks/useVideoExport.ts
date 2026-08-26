'use client'

import { useState, useRef, useCallback } from 'react'
import type { SubtitleLine, SubtitleStyle } from '@/lib/types'

type ExportStatus = 'idle' | 'rendering' | 'done' | 'error'

function drawSubtitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  style: SubtitleStyle,
  canvasWidth: number,
  canvasHeight: number
) {
  const {
    fontFamily    = 'Syne',
    fontSize      = 44,
    color         = '#FFFFFF',
    bgStyle       = 'Highlighted',
    bgOpacity     = 0.7,
    position      = 'Bottom',
    textTransform = 'UPPERCASE',
  } = style

  const displayText = textTransform === 'UPPERCASE' ? text.toUpperCase() : text

  ctx.font      = `700 ${fontSize}px ${fontFamily}, sans-serif`
  ctx.textAlign = 'center'

  const y = position === 'Top'    ? 200
          : position === 'Center' ? canvasHeight / 2
          : canvasHeight - 200

  if (bgStyle === 'Bar') {
    const metrics = ctx.measureText(displayText)
    const padding = 20
    ctx.fillStyle = `rgba(0,0,0,${bgOpacity})`
    ctx.fillRect(
      canvasWidth / 2 - metrics.width / 2 - padding,
      y - fontSize - 10,
      metrics.width + padding * 2,
      fontSize + 20
    )
  }

  if (bgStyle === 'Highlighted') {
    const words = displayText.split(' ')
    let x = canvasWidth / 2 - ctx.measureText(displayText).width / 2
    words.forEach(word => {
      const wWidth = ctx.measureText(word).width + 16
      ctx.fillStyle = `rgba(124,92,252,${bgOpacity})`
      ctx.beginPath()
      const rx = x - 8, ry = y - fontSize, rw = wWidth, rh = fontSize + 10, r = 6
      ctx.moveTo(rx + r, ry)
      ctx.lineTo(rx + rw - r, ry)
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r)
      ctx.lineTo(rx + rw, ry + rh - r)
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh)
      ctx.lineTo(rx + r, ry + rh)
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r)
      ctx.lineTo(rx, ry + r)
      ctx.quadraticCurveTo(rx, ry, rx + r, ry)
      ctx.closePath()
      ctx.fill()
      x += wWidth + 8
    })
  }

  if (bgStyle === 'Pill') {
    const metrics  = ctx.measureText(displayText)
    const pw       = metrics.width + 32
    const ph       = fontSize + 16
    const px       = canvasWidth / 2 - pw / 2
    const py       = y - fontSize - 4
    const pr       = ph / 2
    ctx.fillStyle  = `rgba(0,0,0,${bgOpacity})`
    ctx.beginPath()
    ctx.moveTo(px + pr, py)
    ctx.lineTo(px + pw - pr, py)
    ctx.arcTo(px + pw, py, px + pw, py + ph, pr)
    ctx.lineTo(px + pw, py + ph - pr)
    ctx.arcTo(px + pw, py + ph, px + pw - pr, py + ph, pr)
    ctx.lineTo(px + pr, py + ph)
    ctx.arcTo(px, py + ph, px, py + ph - pr, pr)
    ctx.lineTo(px, py + pr)
    ctx.arcTo(px, py, px + pr, py, pr)
    ctx.closePath()
    ctx.fill()
  }

  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.shadowBlur  = 8
  ctx.fillStyle   = color
  ctx.fillText(displayText, canvasWidth / 2, y)
  ctx.shadowBlur  = 0
}

export function useVideoExport() {
  const [status,      setStatus]      = useState<ExportStatus>('idle')
  const [progress,    setProgress]    = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const recorderRef    = useRef<MediaRecorder | null>(null)
  const animFrameRef   = useRef<number>(0)
  const downloadUrlRef = useRef<string | null>(null)

  const startExport = useCallback(async ({
    videos,
    subtitleLines,
    subtitleStyle,
    duration,
    audioUrl,
    onSave, // Added
  }: {
    videos:        import('@/lib/types').VideoResult[]
    subtitleLines: SubtitleLine[]
    subtitleStyle: SubtitleStyle
    duration:      number
    audioUrl?:     string | null
    onSave?:       (blob: Blob) => Promise<string> // Returns the URL
  }) => {
    setStatus('rendering')
    setProgress(0)
    setDownloadUrl(null)
    setError(null)

    try {
      let actualDuration = duration;
      let audioSourceNode: AudioBufferSourceNode | null = null;
      let audioCtx: AudioContext | null = null;
      let audioDestNode: MediaStreamAudioDestinationNode | null = null;

      if (audioUrl) {
        try {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioDestNode = audioCtx.createMediaStreamDestination();
          const response = await fetch(audioUrl);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          
          audioSourceNode = audioCtx.createBufferSource();
          audioSourceNode.buffer = audioBuffer;
          audioSourceNode.connect(audioDestNode);
          
          if (audioBuffer.duration > actualDuration) {
            actualDuration = audioBuffer.duration;
          }
        } catch (err) {
          console.error('[useVideoExport] Failed to load/decode audio:', err);
        }
      }

      // Canvas setup
      const canvas    = document.createElement('canvas')
      canvas.width    = 1080
      canvas.height   = 1920
      const ctx       = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')
      // Non-null assertion helps TS narrow ctx inside the nested drawFrame closure
      const ctx2d: CanvasRenderingContext2D = ctx

      // Video elements mapping
      const videoElements = await Promise.all(videos.map(async (v, i) => {
        const vid       = document.createElement('video')
        vid.src         = v.url
        vid.crossOrigin = 'anonymous'
        vid.muted       = true
        vid.playsInline = true
        vid.currentTime = 0
        await new Promise<void>((res, rej) => {
          vid.oncanplay = () => res()
          vid.onerror   = () => rej(new Error(`Video ${i} failed to load`))
          vid.load()
        })
        return vid
      }))

      // Play the first video immediately to prep it
      if (videoElements.length > 0) {
        await Promise.all([
          videoElements[0].play().catch(() => {}),
          new Promise(r => setTimeout(r, 200)), // paint first frame
        ])
      }

      const startRef = { time: -1 }

      const drawFrame = (timestamp: number) => {
        if (startRef.time < 0) startRef.time = timestamp
        const elapsed     = (timestamp - startRef.time) / 1000
        const progressPct = Math.min(100, (elapsed / actualDuration) * 100)
        setProgress(Math.round(progressPct))

        const currentLineIndex = subtitleLines.findIndex(l => elapsed >= l.start && elapsed < l.end)
        const currentLine = currentLineIndex >= 0 ? subtitleLines[currentLineIndex] : null

        const activeVidIndex = currentLineIndex >= 0 ? (currentLineIndex % videoElements.length) : 0
        const activeVid = videoElements[activeVidIndex]

        if (activeVid) {
          if (activeVid.paused) activeVid.play().catch(() => {})
          ctx2d.drawImage(activeVid, 0, 0, 1080, 1920)
        }

        // Pause others
        videoElements.forEach((vid, i) => {
          if (i !== activeVidIndex && !vid.paused) vid.pause()
        })

        if (currentLine) {
          drawSubtitle(ctx2d, currentLine.text, subtitleStyle, 1080, 1920)
        }

        // Required Pexels attribution
        ctx2d.font      = '28px DM Sans, sans-serif'
        ctx2d.fillStyle = 'rgba(255,255,255,0.5)'
        ctx2d.textAlign = 'right'
        ctx2d.fillText('via Pexels', 1060, 1900)

        if (elapsed < actualDuration) {
          animFrameRef.current = requestAnimationFrame(drawFrame)
        }
      }

      animFrameRef.current = requestAnimationFrame(drawFrame)

      // Determine supported mimeType
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4'

      const stream   = canvas.captureStream(30)

      let finalStream = stream;

      if (audioDestNode) {
        const audioTracks = audioDestNode.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          finalStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...audioTracks
          ]);
        }
      }

      const recorder = new MediaRecorder(finalStream, { mimeType, videoBitsPerSecond: 4_000_000 })
      recorderRef.current = recorder

      const chunks: BlobPart[] = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = async () => {
        cancelAnimationFrame(animFrameRef.current)
        videoElements.forEach(vid => vid.pause())
        const blob    = new Blob(chunks, { type: mimeType })
        let finalUrl  = URL.createObjectURL(blob)
        downloadUrlRef.current = finalUrl

        if (onSave) {
          try {
            setStatus('rendering') // Keep it in rendering state while uploading
            const savedUrl = await onSave(blob)
            if (savedUrl) finalUrl = savedUrl
          } catch (e: any) {
            console.error('[useVideoExport] onSave error:', e)
            setError('Saved locally but failed to upload to cloud: ' + e.message)
          }
        }

        setDownloadUrl(finalUrl)
        setStatus('done')
        setProgress(100)
      }

      recorder.start(100)
      if (audioSourceNode && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (audioSourceNode) {
        audioSourceNode.start(0);
      }

      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
        if (audioSourceNode) {
            try { audioSourceNode.stop(); } catch(e) {}
        }
        if (audioCtx) {
            try { audioCtx.close(); } catch(e) {}
        }
      }, (actualDuration + 0.5) * 1000)

    } catch (err: any) {
      console.error('[useVideoExport]', err)
      setError(err.message || 'Export failed')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current)
    downloadUrlRef.current = null
    setStatus('idle')
    setProgress(0)
    setDownloadUrl(null)
    setError(null)
  }, [])

  return {
    status,
    progress,
    downloadUrl,
    error,
    isRendering: status === 'rendering',
    isDone:      status === 'done',
    startExport,
    reset,
  }
}
