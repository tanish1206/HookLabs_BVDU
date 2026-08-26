"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useScriptGeneration } from "@/app/hooks/useScriptGeneration";
import { useLiveTrends } from "@/app/hooks/useLiveTrends";
import { useVideoExport } from "@/app/hooks/useVideoExport";
import type { VideoResult, SubtitleLine, SubtitleStyle, Hook } from "@/lib/types";

// ── Constants & Helpers ──────────────────────────────────────────────
const VOICES = [
  { name: "Aria", icon: "🎙" },
  { name: "Marcus", icon: "🎤" },
  { name: "Zoe", icon: "✨" },
  { name: "Kai", icon: "📚" },
];

const DEFAULT_STYLE: SubtitleStyle = {
  fontFamily: 'Syne', fontSize: 22, color: '#FFFFFF',
  bgStyle: 'Highlighted', bgOpacity: 0.7, position: 'Bottom',
  animation: 'Pop', textTransform: 'UPPERCASE', outline: false,
};

function extractKeywords(text: string): string {
  const stop = ['the','a','an','is','are','was','were','how','why','what','when','just','now','new','says','that','this','you','your','and','for','with'];
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ')
    .filter(w => w.length > 3 && !stop.includes(w)).slice(0, 3).join(' ');
}

function buildSubtitleLines(script: Hook, durationMs: number = 30): SubtitleLine[] {
  const full = `${script.hook_line} ${script.body} ${script.cta}`;
  const words = full.split(/\s+/).filter(Boolean);
  const totalChars = words.join(' ').length;
  
  const WORDS_PER_CHUNK = 4;
  const lines: SubtitleLine[] = [];
  let currentTime = 0;

  for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
    const chunk = words.slice(i, i + WORDS_PER_CHUNK).join(' ');
    const chunkDuration = (chunk.length / totalChars) * durationMs;
    lines.push({ id: Math.floor(i / WORDS_PER_CHUNK), text: chunk, start: currentTime, end: currentTime + chunkDuration });
    currentTime += chunkDuration;
  }
  return lines;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [prompt, setPrompt] = useState("");
  const [voice, setVoice] = useState("Aria");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Backend Hooks
  const { trends, isLoading: trendsLoading, refresh: refreshTrends } = useLiveTrends();
  const { scripts, metrics, isLoading: scriptLoading, generate } = useScriptGeneration();
  const { status: exportStatus, downloadUrl, startExport, reset: resetExport } = useVideoExport();

  const activeScript = scripts[0] || null;

  // NLE Sub-States
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<VideoResult[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<'idle'|'loading'|'ready'|'error'|'quota'>('idle');
  const [audioDuration, setAudioDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);

  const [subtitleLines, setSubtitleLines] = useState<SubtitleLine[]>([]);
  const [previewLine, setPreviewLine] = useState<SubtitleLine | null>(null);

  // 1. Fetch Pexels when script generates
  useEffect(() => {
    if (!activeScript) return;
    const kw = extractKeywords(prompt || activeScript.hook_line || 'technology');
    fetchVideos(kw);
    const lines = buildSubtitleLines(activeScript, 30); // fallback duration
    setSubtitleLines(lines);
    if (lines.length > 0) setPreviewLine(lines[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScript]);

  async function fetchVideos(query: string) {
    setLibraryLoading(true);
    try {
      const params = new URLSearchParams({ q: query, page: '1', per_page: '12' });
      const res = await fetch(`/api/pexels/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } finally {
      setLibraryLoading(false);
    }
  }

  // 2. Generate Audio TTS
  async function generateVoiceover(e?: any) {
    if (e) e.preventDefault();
    if (!activeScript) return;
    
    setAudioState('loading');
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hook_line: activeScript.hook_line, body: activeScript.body, cta: activeScript.cta, voice, duration: 30 }),
      });
      if (response.status === 429) { setAudioState('quota'); return; }
      if (!response.ok) { setAudioState('error'); return; }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioState('ready');
    } catch (err) {
      setAudioState('error');
    }
  }

  async function handleGenerateScript(e?: any) {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    setSelectedVideos([]);
    setAudioUrl(null);
    setAudioState('idle');
    await generate({ trend: prompt, format: "YouTube Short", tone: "Energetic", duration: 30 });
  }

  function handleSelectVideo(v: VideoResult) {
    setSelectedVideos(prev => {
      if (prev.some(sv => sv.id === v.id)) return prev.filter(sv => sv.id !== v.id);
      return [...prev, v];
    });
  }

  async function handleSaveVideo(blob: Blob) {
    if (!activeScript) return '';
    const formData = new FormData();
    formData.append('video', blob, 'video.webm');
    formData.append('trendText', prompt || activeScript.hook_line.slice(0, 30));
    formData.append('hookLine', activeScript.hook_line);
    formData.append('body', activeScript.body);
    formData.append('cta', activeScript.cta);
    formData.append('wordCount', String(activeScript.word_count || 0));
    formData.append('toneTag', activeScript.tone_tag || '');
    
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
    if (selectedVideos.length === 0 || !activeScript) return;
    startExport({ 
      videos: selectedVideos, 
      subtitleLines, 
      subtitleStyle: DEFAULT_STYLE, 
      duration: audioDuration, 
      audioUrl,
      onSave: handleSaveVideo
    });
  }

  // Sync Playback state with Audio el
  useEffect(() => {
    if (!audioPreviewRef.current) return;
    if (isPlaying) {
      audioPreviewRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioPreviewRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 260, right: 0, bottom: 0,
      background: 'var(--background)', color: 'var(--text)',
      display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden',
    }}>
      {/* Hidden Audio Element for Timeline Sync */}
      <audio
        ref={audioPreviewRef} src={audioUrl || ''} style={{ display: 'none' }}
        onLoadedMetadata={(e) => {
          setAudioDuration(e.currentTarget.duration);
          if (activeScript) {
            const lines = buildSubtitleLines(activeScript, e.currentTarget.duration);
            setSubtitleLines(lines);
            if (lines.length > 0) setPreviewLine(lines[0]);
          }
        }}
        onTimeUpdate={(e) => {
          const ct = e.currentTarget.currentTime;
          setCurrentTime(ct);
          const activeLine = subtitleLines.find(l => ct >= l.start && ct < l.end);
          if (activeLine && activeLine.id !== previewLine?.id) setPreviewLine(activeLine);
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (audioPreviewRef.current) audioPreviewRef.current.currentTime = 0;
          setCurrentTime(0);
        }}
      />

      {/* ── HEADER ── */}
      <header style={{ height: 64, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.02em', margin: 0 }}>HOOKLABS V2</h1>
          <nav style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
            <span style={{ color: 'var(--text)' }}>MODELS</span><span>ASSETS</span><span>ARCHIVES</span>
          </nav>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button className="btn-primary" onClick={handleExport} disabled={exportStatus === 'rendering'} style={{ padding: '8px 24px', fontSize: 13, fontWeight: 700, borderRadius: 'var(--radius-sm)', opacity: exportStatus === 'rendering' ? 0.6 : 1 }}>
            {exportStatus === 'rendering' ? 'RENDERING...' : exportStatus === 'done' ? 'EXPORT COMPLETE' : 'EXPORT'}
          </button>
        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* LEFT: SCRIPT ENGINE */}
        <div style={{ width: 340, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', padding: 20, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>AI_SCRIPT_ENGINE</span>
            <span style={{ background: 'var(--accent)', color: '#000', fontSize: 10, padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>V2.4</span>
          </div>

          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted2)', marginBottom: 8 }}>LIVE TRENDS (CLICK TO FILL)</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {trends.slice(0, 6).map(t => (
              <button key={t.id} onClick={() => setPrompt(t.text)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: 10, color: 'var(--text)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                {t.text}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleGenerateScript} style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
              style={{ width: '100%', height: 80, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 13, padding: 12, resize: 'none', outline: 'none', fontFamily: 'var(--font-body)', marginBottom: 12 }}
              placeholder="Enter script prompt here or select a trend above..."
              value={prompt} onChange={e => setPrompt(e.target.value)}
            />
            <button disabled={scriptLoading} style={{ background: 'var(--accent)', border: 'none', padding: 12, color: '#000', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s', opacity: scriptLoading ? 0.6 : 1 }}>
              {scriptLoading ? "GENERATING..." : "GENERATE SCRIPT"}
            </button>
          </form>

          {activeScript && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed var(--border2)', fontSize: 13 }}>
              <p style={{ marginBottom: 8, color: 'var(--accent3)' }}>{activeScript.hook_line}</p>
              <p style={{ marginBottom: 12, color: 'var(--text)' }}>{activeScript.body}</p>
              <p style={{ marginBottom: 20, color: 'var(--accent)', fontWeight: 600 }}>{activeScript.cta}</p>

              <div style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted2)', display: 'block', marginBottom: 8 }}>VOICE ARTIST</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
                  {VOICES.map(v => (
                    <button key={v.name} onClick={() => setVoice(v.name)} style={{ padding: '6px', borderRadius: 4, background: voice === v.name ? 'rgba(255,255,255,0.1)' : 'var(--surface2)', border: `1px solid ${voice === v.name ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--text)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{v.icon}</span>{v.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={generateVoiceover} disabled={audioState === 'loading'}
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', padding: 10, color: 'var(--text)', fontSize: 11, fontWeight: 700, borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {audioState === 'loading' ? 'GENERATING AUDIO...' : audioUrl ? 'RE-GENERATE AUDIO' : 'GENERATE AUDIO'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CENTER: LIVE RENDER OUTPUT */}
        <div style={{ flex: 1, background: 'rgba(5, 5, 5, 0.4)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>LIVE_RENDER_OUTPUT</span>
            </div>

            {/* Render Canvas */}
            <div style={{ width: '100%', aspectRatio: '9/16', background: 'var(--surface2)', borderRadius: 24, border: '8px solid var(--surface3)', overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
              
              {exportStatus === 'done' && downloadUrl ? (
                <video src={downloadUrl} autoPlay controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : selectedVideos.length > 0 ? (
                <>
                  <video
                    src={selectedVideos[(previewLine ? subtitleLines.findIndex(l => l.id === previewLine.id) : 0) % selectedVideos.length]?.url || selectedVideos[0].url}
                    autoPlay muted loop playsInline crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: exportStatus === 'rendering' ? 'blur(4px)' : 'none' }}
                  />
                  {previewLine && exportStatus !== 'rendering' && (
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: '15%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, padding: '0 10px', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                      {(DEFAULT_STYLE.textTransform === 'UPPERCASE' ? previewLine.text.toUpperCase() : previewLine.text).split(' ').map((word, i) => (
                        <span key={i} style={{ fontFamily: DEFAULT_STYLE.fontFamily, fontSize: `${DEFAULT_STYLE.fontSize * 0.75}px`, color: DEFAULT_STYLE.color, fontWeight: 700, background: `rgba(255,255,255,${DEFAULT_STYLE.bgOpacity})`, borderRadius: 4, padding: '2px 6px' }}>{word}</span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface3) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                  <span style={{ fontSize: 48, opacity: 0.1 }}>🎬</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>WAITING FOR MEDIA</span>
                </div>
              )}

              {/* Top badges */}
              <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 8px', background: 'rgba(0,0,0,0.6)', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                4K | {exportStatus === 'rendering' ? 'RENDERING' : 'PREVIEW'}
              </div>
            </div>

            {/* Diagnostics Tracker */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 24 }}>
              {[
                { label: 'HOOK SCORE', val: metrics?.hook_score ? `${metrics.hook_score}/100` : '—' },
                { label: 'EST CTR', val: metrics?.est_ctr ? String(metrics.est_ctr) : '—' },
                { label: 'RETENTION', val: metrics?.retention ? String(metrics.retention) : '—' }
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: ASSET VAULT */}
        <div style={{ width: 300, borderLeft: '1px solid var(--border)', background: 'var(--surface)', padding: 20, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>ASSET_VAULT</span>
            <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{selectedVideos.length} SELECTED</span>
          </div>
          
          {libraryLoading ? (
            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 40 }}>Fetching Pexels B-Roll...</div>
          ) : videos.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 40 }}>Generate a script to find videos.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {videos.map(v => {
                const isSelected = selectedVideos.some(sv => sv.id === v.id);
                return (
                  <div key={v.id} onClick={() => handleSelectVideo(v)} style={{ aspectRatio: '9/16', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 6, right: 6, fontSize: 8, fontFamily: 'var(--font-mono)', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', zIndex: 10 }}>{v.duration}s</div>
                    {isSelected && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)', zIndex: 5 }} />}
                    <img src={v.thumbnail} alt="B-roll" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── TIMELINE ── */}
      <footer style={{ height: 240, borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid rgba(210,160,60,0.05)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 16, cursor: 'pointer', color: 'var(--text)' }} onClick={() => {
              if(!audioUrl) alert("Please Generate Audio first!");
              else setIsPlaying(!isPlaying);
            }}>{isPlaying ? '⏸' : '▶'}</span>
            
            <div style={{ background: '#000', border: '1px solid var(--border)', padding: '4px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', borderRadius: 4 }}>
              <span style={{ color: 'var(--text)' }}>{formatTime(currentTime)}</span> <span style={{ color: 'var(--muted)', margin: '0 4px' }}>/</span> <span style={{ color: 'var(--muted)' }}>{formatTime(audioDuration)}</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>TIMELINE_EDITOR V2</div>
        </div>

        <div style={{ flex: 1, padding: '20px 24px', position: 'relative', overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tracker 1: Video */}
          <div style={{ height: 42, background: 'rgba(255,255,255,0.02)', borderRadius: 4, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            {selectedVideos.length === 0 ? (
              <div style={{ fontSize: 10, color: 'var(--muted)', padding: 12, fontFamily: 'var(--font-mono)' }}>No clips selected</div>
            ) : (
              selectedVideos.map((v, i) => (
                <div key={v.id} style={{ flex: 1, background: i % 2 === 0 ? 'linear-gradient(90deg, #ffffff, #e0e0e0)' : 'linear-gradient(90deg, #e0e0e0, #ffffff)', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 9, fontFamily: 'var(--font-mono)', color: '#000', boxShadow: 'inset 0 0 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: 600 }}>
                  CLIP_{v.id.substring(0,6).toUpperCase()}
                </div>
              ))
            )}
          </div>

          {/* Tracker 2: Audio/Waveform */}
          <div style={{ height: 60, marginTop: 16, display: 'flex', alignItems: 'flex-end', gap: '3px', position: 'relative' }}>
            {Array.from({length: 80}).map((_, i) => (
              <div key={i} style={{ flex: 1, maxWidth: 4, height: `${Math.random() * 80 + 10}%`, background: audioUrl ? 'var(--muted)' : 'var(--surface2)', borderRadius: '2px 2px 0 0', opacity: audioDuration ? (i / 80 < (currentTime / audioDuration) ? 1 : 0.3) : 0.3 }} />
            ))}
            
            <div style={{ position: 'absolute', top: -140, bottom: 0, left: `${(currentTime / audioDuration) * 100}%`, width: 2, background: 'var(--accent)', zIndex: 10 }}>
              <div style={{ position: 'absolute', top: -8, left: -4, width: 10, height: 10, background: 'var(--accent)', transform: 'rotate(45deg)', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
