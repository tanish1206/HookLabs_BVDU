'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, SectionHeader, Button, MonoLabel, MetaPill, Skeleton, Badge } from './ui'
import { scoreColor, parsePct, buildRetentionCurve } from '@/lib/utils/helpers'
import { useVideoExport } from '@/app/hooks/useVideoExport'
import type { Hook, Metrics, VideoResult, SubtitleLine, SubtitleStyle } from '@/lib/types'

// ── Constants ──────────────────────────────────────────────────────
const DEFAULT_STYLE: SubtitleStyle = {
  fontFamily:    'Syne',
  fontSize:      22,
  color:         '#FFFFFF',
  bgStyle:       'Highlighted',
  bgOpacity:     0.7,
  position:      'Bottom',
  animation:     'Pop',
  textTransform: 'UPPERCASE',
  outline:       false,
}

const CATEGORY_FILTERS = [
  { label: 'AI & Tech',  key: 'ai',        query: 'artificial intelligence technology' },
  { label: 'Crypto',     key: 'crypto',     query: 'cryptocurrency bitcoin finance' },
  { label: 'Science',    key: 'science',    query: 'science laboratory research' },
  { label: 'Finance',    key: 'finance',    query: 'business finance economy' },
  { label: 'Lifestyle',  key: 'lifestyle',  query: 'lifestyle modern city' },
  { label: 'News',       key: 'news',       query: 'breaking news media journalism' },
]

const FONT_OPTIONS = ['Syne', 'DM Sans', 'Impact', 'Arial Black', 'Georgia']
const COLOR_SWATCHES = ['#FFFFFF', '#FFFF00', '#00FFFF', '#FF4444', '#000000']

// ── Helpers ──────────────────────────────────────────────────────
function extractKeywords(text: string): string {
  const stop = ['the','a','an','is','are','was','were','how','why','what','when','just','now','new','says','that','this','you','your']
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(w => w.length > 3 && !stop.includes(w))
    .slice(0, 3)
    .join(' ')
}

function buildSubtitleLines(script: Hook, durationMs: number = 30): SubtitleLine[] {
  const full  = `${script.hook_line} ${script.body} ${script.cta}`
  const words = full.split(/\s+/).filter(Boolean)
  const totalChars = words.join(' ').length
  
  const WORDS_PER_CHUNK = 4
  const lines: SubtitleLine[] = []
  let currentTime = 0

  for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
    const chunk = words.slice(i, i + WORDS_PER_CHUNK).join(' ')
    const chunkChars = chunk.length
    // portion of total time (proportional by text length)
    const chunkDuration = (chunkChars / totalChars) * durationMs
    
    lines.push({
      id: i / WORDS_PER_CHUNK,
      text: chunk,
      start: currentTime,
      end: currentTime + chunkDuration
    })
    currentTime += chunkDuration
  }
  return lines
}

// ── Sub-components ──────────────────────────────────────────────

function VideoCard({ video, selected, onSelect }: { video: VideoResult; selected: boolean; onSelect: () => void }) {
  const [hovering, setHovering] = useState(false)
  const vidRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!vidRef.current) return
    if (hovering) { vidRef.current.play().catch(() => {}) }
    else            { vidRef.current.pause() }
  }, [hovering])

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: 'relative', cursor: 'pointer', borderRadius: 'var(--radius-md)',
        overflow: 'hidden', aspectRatio: '9/16',
        border: selected ? '2px solid var(--accent)' : '2px solid var(--border)',
        transition: 'border-color 0.2s, transform 0.15s',
        transform: hovering ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected ? 'var(--shadow-accent)' : 'var(--shadow)',
      }}
    >
      {hovering ? (
        <video
          ref={vidRef} src={video.url} muted loop playsInline crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={video.thumbnail} alt={`${video.videographer} video`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}

      {/* Duration badge */}
      <div style={{
        position: 'absolute', bottom: 24, left: 6, fontSize: 10,
        background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 6px',
        borderRadius: 4, fontFamily: 'var(--font-mono)',
      }}>
        {video.duration}s
      </div>

      {/* Hover play icon */}
      {hovering && !selected && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontSize: 24, opacity: 0.9 }}>▶</div>
        </div>
      )}

      {/* Selected checkmark */}
      {selected && (
        <div style={{
          position: 'absolute', top: 6, right: 6, width: 22, height: 22,
          borderRadius: '50%', background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 12,
        }}>✓</div>
      )}

      {/* Attribution — required by Pexels */}
      <a href={video.pexels_url} target="_blank" rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '2px 6px', fontSize: 9,
          background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)',
          fontFamily: 'var(--font-mono)', textDecoration: 'none',
          display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}
      >
        by {video.videographer} on Pexels
      </a>
    </div>
  )
}

// ── Phone Preview Frame ─────────────────────────────────────────
function PhonePreview({
  video, subtitleLines, style: subStyle, currentLine,
}: {
  video: VideoResult; subtitleLines: SubtitleLine[]
  style: SubtitleStyle; currentLine: SubtitleLine | null
}) {
  const y = subStyle.position === 'Top' ? '15%' : subStyle.position === 'Center' ? '50%' : '82%'

  return (
    <div style={{
      width: 180, borderRadius: 28, background: '#000',
      border: '8px solid var(--surface3)', boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden', position: 'relative', margin: '0 auto',
    }}>
      <div style={{ padding: '6px 16px 0', display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
        <span>9:41</span><span>●●●</span>
      </div>
      <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
        <video
          key={video.id}
          src={video.url} autoPlay muted loop playsInline crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {currentLine && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, padding: '0 8px',
          }}>
            {(subStyle.textTransform === 'UPPERCASE' ? currentLine.text.toUpperCase() : currentLine.text)
              .split(' ').map((word, i) => (
                <span key={i} style={{
                  fontFamily: subStyle.fontFamily,
                  fontSize:   `${subStyle.fontSize * 0.45}px`,
                  color:      subStyle.color,
                  fontWeight: 700,
                  background: subStyle.bgStyle === 'Highlighted' ? `rgba(255,255,255,${subStyle.bgOpacity})` :
                              subStyle.bgStyle === 'Bar'         ? `rgba(0,0,0,${subStyle.bgOpacity})`       :
                              subStyle.bgStyle === 'Pill'        ? `rgba(0,0,0,${subStyle.bgOpacity})`       : 'transparent',
                  borderRadius: subStyle.bgStyle === 'Highlighted' ? 4 : subStyle.bgStyle === 'Pill' ? 100 : 0,
                  padding: subStyle.bgStyle !== 'None' ? '1px 4px' : 0,
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                }}>
                  {word}
                </span>
              ))}
          </div>
        )}
        {/* Social chrome */}
        <div style={{ position: 'absolute', right: 6, bottom: 60, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {['❤️', '💬', '⤴️'].map(icon => (
            <div key={icon} style={{ fontSize: 16, textAlign: 'center' }}>
              <div>{icon}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)' }}>42K</div>
            </div>
          ))}
        </div>
        {/* Pexels attribution */}
        <div style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
          via Pexels
        </div>
      </div>
      <div style={{ padding: 6, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────
interface VideoComposerProps {
  script:     Hook
  metrics?:   Metrics
  trendText:  string
  voice:      string
  voiceUrl?:  string | null
  format:     string
  onNewVideo: () => void
}

export default function VideoComposer({ script, metrics, trendText, voice, voiceUrl, format, onNewVideo }: VideoComposerProps) {
  type SubStep = 'library' | 'editor' | 'preview'
  const [subStep,         setSubStep]         = useState<SubStep>('library')
  const [videos,          setVideos]          = useState<VideoResult[]>([])
  const [loading,         setLoading]         = useState(false)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [activeCategory,  setActiveCategory]  = useState<string | null>(null)
  const [selectedVideos,  setSelectedVideos]  = useState<VideoResult[]>([])
  const [page,            setPage]            = useState(1)
  const [hasMore,         setHasMore]         = useState(false)
  const [subtitleLines,   setSubtitleLines]   = useState<SubtitleLine[]>([])
  const [subtitleStyle,   setSubtitleStyle]   = useState<SubtitleStyle>(DEFAULT_STYLE)
  const [previewLine,     setPreviewLine]     = useState<SubtitleLine | null>(null)
  const [previewPlaying,  setPreviewPlaying]  = useState(false)
  const [editingLineId,   setEditingLineId]   = useState<number | null>(null)
  const [audioDuration,   setAudioDuration]   = useState(0)
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null)

  const { status: exportStatus, progress, downloadUrl, startExport, reset: resetExport } = useVideoExport()

  // ── Init ─────────────────────────────────────────────
  useEffect(() => {
    // Basic fallback if no audio is present yet
    if (!voiceUrl) {
      const lines = buildSubtitleLines(script, 30) // fallback 30s
      setSubtitleLines(lines)
      if (lines.length > 0) setPreviewLine(lines[0])
    }
    const kw = extractKeywords(trendText || script.hook_line || 'technology')
    setSearchQuery(kw)
    fetchVideos(kw, 1, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script, trendText])

  // ── Preview Play/Pause Sync ─────────────────────────
  useEffect(() => {
    if (!audioPreviewRef.current) return;
    if (previewPlaying) {
      audioPreviewRef.current.play().catch(e => {
        console.error("Preview play blocked", e);
        setPreviewPlaying(false);
      });
    } else {
      audioPreviewRef.current.pause();
    }
  }, [previewPlaying])

  // ── Fetch videos ─────────────────────────────────────
  async function fetchVideos(query: string, pg: number, replace: boolean) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ q: query || 'technology', page: String(pg), per_page: '12' })
      const res = await fetch(`/api/pexels/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setVideos(prev => replace ? data.videos : [...prev, ...data.videos])
        setHasMore((data.videos?.length || 0) >= 12)
        setPage(pg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    setActiveCategory(null)
    fetchVideos(q, 1, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCategoryClick(cat: typeof CATEGORY_FILTERS[0]) {
    setActiveCategory(cat.key)
    setSearchQuery(cat.query)
    fetchVideos(cat.query, 1, true)
  }

  function handleLoadMore() {
    fetchVideos(searchQuery, page + 1, false)
  }

  function handleSelectVideo(video: VideoResult) {
    setSelectedVideos(prev => {
      const isSelected = prev.some(v => v.id === video.id)
      if (isSelected) return prev.filter(v => v.id !== video.id)
      const next = [...prev, video]
      if (next.length >= subtitleLines.length) {
        setTimeout(() => setSubStep('editor'), 400)
      }
      return next
    })
  }

  function handleAutoFill() {
    setSelectedVideos(videos.slice(0, Math.max(1, subtitleLines.length)))
    setSubStep('editor')
  }

  function updateStyle<K extends keyof SubtitleStyle>(key: K, val: SubtitleStyle[K]) {
    setSubtitleStyle(prev => ({ ...prev, [key]: val }))
  }

  async function handleSaveVideo(blob: Blob) {
    const formData = new FormData();
    formData.append('video', blob, 'video.webm');
    formData.append('trendText', trendText || script.hook_line.slice(0, 30));
    formData.append('hookLabel', script.label || 'Hook');
    formData.append('hookStyle', subtitleStyle.bgStyle || '');
    formData.append('hookLine', script.hook_line);
    formData.append('body', script.body);
    formData.append('cta', script.cta);
    formData.append('wordCount', String(script.word_count || 0));
    formData.append('toneTag', script.tone_tag || '');
    
    const res = await fetch('/api/save-video', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
       const err = await res.json().catch(()=>({}));
       throw new Error(err.error || 'Failed to save video');
    }
    const data = await res.json();
    return data.url;
  }

  function handleExport() {
    if (selectedVideos.length === 0) return
    let dur = audioDuration > 0 ? audioDuration : (subtitleLines.length > 0 ? Math.max(...subtitleLines.map(l => l.end)) : 10)
    startExport({
      videos:        selectedVideos,
      subtitleLines,
      subtitleStyle,
      duration:      dur,
      audioUrl:      voiceUrl,
      onSave:        handleSaveVideo
    })
    setSubStep('preview')
  }

  const retentionCurve = buildRetentionCurve(parsePct(metrics?.retention), 1)

  // ══════════════════════════════════════════════════════
  // PANEL 4A — VIDEO LIBRARY
  // ══════════════════════════════════════════════════════
  if (subStep === 'library') {
    return (
      <div className="animate-fade-in">
        <SectionHeader 
          icon="🎬" title="Choose Your B-Rolls" 
          subtitle={`Pick ${subtitleLines.length} vertical clips for your segments. Hover to preview.`}
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedVideos.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSubStep('editor')}>
                  Continue ({selectedVideos.length}/{subtitleLines.length}) →
                </Button>
              )}
              <Button size="sm" onClick={handleAutoFill}>
                ⚡ Auto-Fill
              </Button>
            </div>
          }
        />

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {CATEGORY_FILTERS.map(cat => (
            <button key={cat.key} onClick={() => handleCategoryClick(cat)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12,
                fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 0.2s',
                background: activeCategory === cat.key ? 'var(--accent)' : 'var(--surface2)',
                color: activeCategory === cat.key ? '#fff' : 'var(--muted)',
                border: activeCategory === cat.key ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <input
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search B-roll... (e.g. 'AI robot', 'city timelapse')"
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Grid */}
        {loading && videos.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} height={200} style={{ aspectRatio: '9/16' }} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📹</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>No videos found for "{searchQuery}"</div>
            <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Try: technology, city, abstract, people, nature</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {videos.map(v => {
                const selIdx = selectedVideos.findIndex(sv => sv.id === v.id)
                return (
                  <div key={v.id} style={{ position: 'relative' }}>
                    <VideoCard
                      video={v}
                      selected={selIdx !== -1}
                      onSelect={() => handleSelectVideo(v)}
                    />
                    {selIdx !== -1 && (
                      <div style={{
                        position: 'absolute', top: -8, left: -8, width: 24, height: 24,
                        borderRadius: '50%', background: 'var(--accent)', color: '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 'bold', zIndex: 10, border: '2px solid #000'
                      }}>
                        {selIdx + 1}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button variant="ghost" size="sm" onClick={handleLoadMore} style={{ opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Loading…' : 'Load more videos'}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Pexels footer attribution — required */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>
          Videos provided by{' '}
          <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Pexels
          </a>. Free to use with attribution.
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // PANEL 4B — SUBTITLE EDITOR
  // ══════════════════════════════════════════════════════
  if (subStep === 'editor' && selectedVideos.length > 0) {
    return (
      <div className="animate-fade-in">
        <SectionHeader
          icon="✏️" title="Style Your Subtitles"
          subtitle="Customize captions then preview live."
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => setSubStep('library')}>← Back</Button>
              <Button size="sm" onClick={() => setSubStep('preview')}>Preview & Export →</Button>
            </div>
          }
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          {/* ── LEFT: Controls ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Font Family */}
            <Card style={{ padding: '14px 16px' }}>
              <MonoLabel style={{ marginBottom: 10 }}>FONT FAMILY</MonoLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FONT_OPTIONS.map(f => (
                  <button key={f} onClick={() => updateStyle('fontFamily', f)} style={{
                    padding: '5px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    fontFamily: f, fontSize: 13, transition: 'all 0.15s',
                    background: subtitleStyle.fontFamily === f ? 'var(--accent)' : 'var(--surface2)',
                    color: subtitleStyle.fontFamily === f ? '#fff' : 'var(--text)',
                    border: subtitleStyle.fontFamily === f ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}>{f}</button>
                ))}
              </div>
            </Card>

            {/* Font Size */}
            <Card style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <MonoLabel>FONT SIZE</MonoLabel>
                <MonoLabel style={{ color: 'var(--accent)' }}>{subtitleStyle.fontSize}px</MonoLabel>
              </div>
              <input type="range" min={14} max={32} step={2} value={subtitleStyle.fontSize}
                onChange={e => updateStyle('fontSize', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
            </Card>

            {/* Text Color */}
            <Card style={{ padding: '14px 16px' }}>
              <MonoLabel style={{ marginBottom: 10 }}>TEXT COLOR</MonoLabel>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {COLOR_SWATCHES.map(c => (
                  <button key={c} onClick={() => updateStyle('color', c)} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: subtitleStyle.color === c ? '3px solid var(--accent)' : '2px solid var(--border)',
                    boxSizing: 'border-box', transition: 'border 0.15s',
                  }} />
                ))}
                <input type="color" value={subtitleStyle.color} onChange={e => updateStyle('color', e.target.value)}
                  style={{ width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', border: '2px solid var(--border)', background: 'transparent' }} />
              </div>
            </Card>

            {/* Background Style */}
            <Card style={{ padding: '14px 16px' }}>
              <MonoLabel style={{ marginBottom: 10 }}>BACKGROUND STYLE</MonoLabel>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['None', 'Pill', 'Bar', 'Highlighted'] as const).map(s => (
                  <button key={s} onClick={() => updateStyle('bgStyle', s)} style={{
                    padding: '5px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 'var(--radius-md)',
                    background: subtitleStyle.bgStyle === s ? 'var(--accent)' : 'var(--surface2)',
                    color: subtitleStyle.bgStyle === s ? '#fff' : 'var(--muted)',
                    border: subtitleStyle.bgStyle === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}>{s}</button>
                ))}
              </div>
              {subtitleStyle.bgStyle !== 'None' && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>OPACITY</span>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{Math.round(subtitleStyle.bgOpacity * 100)}%</span>
                  </div>
                  <input type="range" min={0} max={0.9} step={0.1} value={subtitleStyle.bgOpacity}
                    onChange={e => updateStyle('bgOpacity', Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                </div>
              )}
            </Card>

            {/* Position */}
            <Card style={{ padding: '14px 16px' }}>
              <MonoLabel style={{ marginBottom: 10 }}>POSITION</MonoLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Top', 'Center', 'Bottom'] as const).map(p => (
                  <button key={p} onClick={() => updateStyle('position', p)} style={{
                    flex: 1, padding: '7px 0', fontSize: 12, cursor: 'pointer', borderRadius: 'var(--radius-md)',
                    background: subtitleStyle.position === p ? 'var(--accent)' : 'var(--surface2)',
                    color: subtitleStyle.position === p ? '#fff' : 'var(--muted)',
                    border: subtitleStyle.position === p ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}>{p}</button>
                ))}
              </div>
            </Card>

            {/* Text Transform & Outline */}
            <Card style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <MonoLabel style={{ marginBottom: 8 }}>TRANSFORM</MonoLabel>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['Normal', 'UPPERCASE'] as const).map(t => (
                      <button key={t} onClick={() => updateStyle('textTransform', t)} style={{
                        flex: 1, padding: '6px', fontSize: 11, cursor: 'pointer',
                        borderRadius: 'var(--radius-md)', textTransform: t === 'UPPERCASE' ? 'uppercase' : 'none',
                        background: subtitleStyle.textTransform === t ? 'var(--accent)' : 'var(--surface2)',
                        color: subtitleStyle.textTransform === t ? '#fff' : 'var(--muted)',
                        border: subtitleStyle.textTransform === t ? '1px solid var(--accent)' : '1px solid var(--border)',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <MonoLabel style={{ marginBottom: 8 }}>OUTLINE</MonoLabel>
                  <button onClick={() => updateStyle('outline', !subtitleStyle.outline)} style={{
                    padding: '6px 14px', fontSize: 11, cursor: 'pointer', borderRadius: 'var(--radius-md)',
                    background: subtitleStyle.outline ? 'var(--accent)' : 'var(--surface2)',
                    color: subtitleStyle.outline ? '#fff' : 'var(--muted)',
                    border: subtitleStyle.outline ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}>
                    {subtitleStyle.outline ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </Card>

            {/* Subtitle line list */}
            <Card style={{ padding: '14px 16px' }}>
              <MonoLabel style={{ marginBottom: 10 }}>SUBTITLE LINES</MonoLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
                {subtitleLines.map(line => (
                  <div key={line.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', fontSize: 12,
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--muted2)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {Math.floor(line.start / 60)}:{String(Math.floor(line.start % 60)).padStart(2, '0')} →{' '}
                      {Math.floor(line.end / 60)}:{String(Math.floor(line.end % 60)).padStart(2, '0')}
                    </span>
                    {editingLineId === line.id ? (
                      <input
                        autoFocus defaultValue={line.text}
                        onBlur={e => {
                          setSubtitleLines(prev => prev.map(l => l.id === line.id ? { ...l, text: e.target.value } : l))
                          setEditingLineId(null)
                        }}
                        style={{
                          flex: 1, background: 'transparent', border: 'none', outline: '1px solid var(--accent)',
                          color: 'var(--text)', fontSize: 12, borderRadius: 4, padding: '1px 4px',
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.text}</span>
                    )}
                    <button onClick={() => setEditingLineId(line.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)' }}>✏️</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <MonoLabel>LIVE PREVIEW</MonoLabel>

            {/* Hidden audio player for syncing */}
            <audio
              ref={audioPreviewRef}
              src={voiceUrl || ''}
              style={{ display: 'none' }}
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                setAudioDuration(dur);
                const lines = buildSubtitleLines(script, dur);
                setSubtitleLines(lines);
                if (lines.length > 0) setPreviewLine(lines[0]);
              }}
              onTimeUpdate={(e) => {
                const ct = e.currentTarget.currentTime;
                // Find matching subtitle line
                const activeLine = subtitleLines.find(l => ct >= l.start && ct < l.end);
                if (activeLine && activeLine.id !== previewLine?.id) {
                  setPreviewLine(activeLine);
                }
              }}
              onEnded={() => {
                setPreviewPlaying(false);
                if (audioPreviewRef.current) audioPreviewRef.current.currentTime = 0;
                setPreviewLine(subtitleLines[0]);
              }}
            />

            <PhonePreview
              video={selectedVideos[(previewLine ? subtitleLines.findIndex(l => l.id === previewLine.id) : 0) % selectedVideos.length] || selectedVideos[0]}
              subtitleLines={subtitleLines}
              style={subtitleStyle}
              currentLine={previewLine}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => { 
                if (audioPreviewRef.current) audioPreviewRef.current.currentTime = 0;
                setPreviewLine(subtitleLines[0]);
              }}>
                ↺ Reset
              </Button>
              <Button
                variant={previewPlaying ? 'ghost' : 'primary'} size="sm"
                onClick={() => setPreviewPlaying(p => !p)}
              >
                {previewPlaying ? '⏸ Pause' : '▶ Play'}
              </Button>
            </div>
            {/* Selected video attribution */}
            <div style={{ fontSize: 11, color: 'var(--muted2)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              Video by{' '}
              <a href={(selectedVideos[(previewLine ? subtitleLines.findIndex(l => l.id === previewLine.id) : 0) % selectedVideos.length] || selectedVideos[0]).pexels_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                {(selectedVideos[(previewLine ? subtitleLines.findIndex(l => l.id === previewLine.id) : 0) % selectedVideos.length] || selectedVideos[0]).videographer}
              </a>{' '}on Pexels
            </div>
            <Button size="md" onClick={() => setSubStep('preview')} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              Continue to Export →
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // PANEL 4C — FINAL PREVIEW + EXPORT
  // ══════════════════════════════════════════════════════
  if (selectedVideos.length > 0) {
    const isBrowser = typeof window !== 'undefined'
    const supportsMediaRecorder = isBrowser && typeof MediaRecorder !== 'undefined'

    return (
      <div className="animate-fade-in">
        <SectionHeader
          icon="🚀" title="Export Your Reel"
          subtitle="Preview your finished short and download."
          action={
            <Button variant="ghost" size="sm" onClick={() => { resetExport(); setSubStep('editor') }}>← Back to Editor</Button>
          }
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
          {/* Phone preview — larger */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 220, borderRadius: 32, background: '#000',
              border: '10px solid var(--surface3)', boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden', position: 'relative',
            }}>
              <div style={{ padding: '6px 18px 0', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                <span>9:41</span><span>●●●</span>
              </div>
              <div style={{ position: 'relative', height: 390 }}>
                {exportStatus === 'done' && downloadUrl ? (
                  <video src={downloadUrl} autoPlay controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 5, position: 'relative' }} />
                ) : (
                  <video
                    src={selectedVideos[0].url} autoPlay muted loop playsInline crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: exportStatus === 'rendering' ? 'blur(4px)' : 'none' }}
                  />
                )}
                {/* Subtitle overlay */}
                {exportStatus !== 'done' && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0,
                    top: subtitleStyle.position === 'Top' ? '10%' : subtitleStyle.position === 'Center' ? '50%' : '82%',
                    transform: 'translateY(-50%)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, padding: '0 10px',
                  }}>
                    {subtitleLines.length > 0 && (
                      (subtitleStyle.textTransform === 'UPPERCASE' ? subtitleLines[0].text.toUpperCase() : subtitleLines[0].text)
                        .split(' ').map((word, i) => (
                          <span key={i} style={{
                            fontFamily: subtitleStyle.fontFamily, fontSize: `${subtitleStyle.fontSize * 0.52}px`,
                            color: subtitleStyle.color, fontWeight: 700,
                            background: subtitleStyle.bgStyle === 'Highlighted' ? `rgba(255,255,255,${subtitleStyle.bgOpacity})` :
                                        subtitleStyle.bgStyle !== 'None'        ? `rgba(0,0,0,${subtitleStyle.bgOpacity})` : 'transparent',
                            borderRadius: subtitleStyle.bgStyle === 'Pill' ? 100 : subtitleStyle.bgStyle === 'Highlighted' ? 4 : 0,
                            padding: subtitleStyle.bgStyle !== 'None' ? '2px 6px' : 0,
                            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                          }}>{word}</span>
                        ))
                    )}
                  </div>
                )}
                {exportStatus !== 'done' && <div style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>via Pexels</div>}
              </div>
              <div style={{ padding: 8, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 70, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
              </div>
            </div>

            {/* Video attribution */}
            <div style={{ fontSize: 11, color: 'var(--muted2)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              Video by{' '}
              <a href={selectedVideos[0].pexels_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                {selectedVideos[0].videographer}
              </a>{' '}on Pexels
            </div>
          </div>

          {/* Right: metrics + export */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Metrics */}
            {metrics ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <MetaPill label="HOOK SCORE" value={metrics.hook_score ? `${metrics.hook_score}/100` : '—'} color={scoreColor(metrics.hook_score ?? 0)} />
                <MetaPill label="EST. CTR"   value={String(metrics.est_ctr ?? '—')} color={scoreColor(parsePct(metrics.est_ctr) * 10)} />
                <MetaPill label="RETENTION"  value={String(metrics.retention ?? '—')} color={scoreColor(parsePct(metrics.retention))} />
                <MetaPill label="VIRAL SCORE" value={metrics.viral_score ? `${metrics.viral_score}/100` : '—'} color={scoreColor(metrics.viral_score ?? 0)} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[0,1,2,3].map(i => <Skeleton key={i} height={64} />)}
              </div>
            )}

            {/* Retention curve */}
            <Card style={{ padding: '14px 16px' }}>
              <MonoLabel style={{ marginBottom: 10 }}>PREDICTED RETENTION CURVE</MonoLabel>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
                {retentionCurve.map((v, i) => (
                  <div key={i} style={{ flex: 1, height: `${v}%`, background: `rgba(255,255,255,${0.3 + v / 200})`, borderRadius: 2 }} />
                ))}
              </div>
            </Card>

            {/* Export card */}
            <Card style={{ padding: '16px' }}>
              {!supportsMediaRecorder && (
                <div style={{ padding: '8px 12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#FCD34D' }}>
                  ⚠️ Full export works best in Chrome. On other browsers, use screen recording.
                </div>
              )}

              {exportStatus === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Button onClick={handleExport} size="md" style={{ width: '100%', justifyContent: 'center' }}>
                    ⬇ Download as WebM
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onNewVideo} style={{ width: '100%', justifyContent: 'center' }}>
                    + Create New Video
                  </Button>
                </div>
              )}

              {exportStatus === 'rendering' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <MonoLabel>RENDERING…</MonoLabel>
                    <MonoLabel style={{ color: 'var(--accent)' }}>{progress}%</MonoLabel>
                  </div>
                  <div className="score-bar">
                    <div className="score-bar-fill" style={{ width: `${progress}%`, background: 'var(--accent)', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>Canvas recording in progress…</div>
                </div>
              )}

              {exportStatus === 'done' && downloadUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href={downloadUrl} download={`hooklabs-${Date.now()}.webm`} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="md" style={{ width: '100%', justifyContent: 'center', background: 'var(--green)' }}>
                      ✓ Download Video
                    </Button>
                  </a>
                  <div style={{ fontSize: 11, color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>
                    File is .webm. Convert to MP4 at{' '}
                    <a href="https://cloudconvert.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>cloudconvert.com</a>
                    {' '}if needed for TikTok.
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { resetExport() }} style={{ width: '100%', justifyContent: 'center' }}>
                    Export Again
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onNewVideo} style={{ width: '100%', justifyContent: 'center' }}>
                    + Create New Video
                  </Button>
                </div>
              )}

              {exportStatus === 'error' && (
                <div>
                  <div style={{ fontSize: 12, color: '#FCA5A5', marginBottom: 8 }}>Export failed — CORS issue or unsupported browser. Try Chrome.</div>
                  <Button variant="ghost" size="sm" onClick={resetExport} style={{ width: '100%', justifyContent: 'center' }}>Retry</Button>
                </div>
              )}
            </Card>

            {/* Required Pexels footer */}
            <div style={{ fontSize: 11, color: 'var(--muted2)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
              Videos provided by{' '}
              <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Pexels</a>.
              Free to use with attribution.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
