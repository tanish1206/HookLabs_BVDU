"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, SectionHeader, Button, MonoLabel, Badge } from "./ui";
import { buildWaveform } from "@/lib/utils/helpers";
import { WAVEFORM_BAR_COUNT, WAVEFORM_SEED } from "@/lib/constants";
import type { Hook } from "@/lib/types";

const VOICES = [
  { name: "Aria",   desc: "Warm & Clear",       icon: "🎙" },
  { name: "Marcus", desc: "Deep & Authoritative", icon: "🎤" },
  { name: "Zoe",    desc: "Energetic & Fun",      icon: "✨" },
  { name: "Kai",    desc: "Calm & Educational",   icon: "📚" },
];

interface VoiceoverPanelProps {
  script: Hook;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  onContinue: (audioUrl: string | null) => void;
  onBack: () => void;
  duration?: number;
}

export default function VoiceoverPanel({ script, selectedVoice, onVoiceChange, onContinue, onBack, duration }: VoiceoverPanelProps) {
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error' | 'quota'>('idle');
  const [charCount, setCharCount] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [durationState, setDurationState] = useState(0);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  const waveform = buildWaveform(WAVEFORM_BAR_COUNT, WAVEFORM_SEED);

  useEffect(() => {
    fetch('/api/tts/quota')
      .then(r => r.json())
      .then(setQuotaStatus)
      .catch(console.error)
  }, []);

  useEffect(() => {
    // The blob URL needs to persist beyond this component's unmount so that the 
    // downstream video export pipeline can fetch and decode it. Do not revoke it here.
  }, [audioUrl]);

  async function generateVoiceover() {
    setAudioState('loading');
    setAudioUrl(null);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hook_line: script.hook_line,
          body:      script.body,
          cta:       script.cta,
          voice:     selectedVoice,
          duration:  duration,
        }),
      });

      if (response.status === 429) {
        setAudioState('quota');
        return;
      }
      if (!response.ok) {
        setAudioState('error');
        return;
      }

      const chars = response.headers.get('X-Chars-Used');
      if (chars) setCharCount(parseInt(chars));

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioState('playing');

      // Auto-play the audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(e => {
             console.error('Autoplay blocked:', e);
             setAudioState('ready'); // Fallback to ready if blocked
          });
        }
      }, 50);
    } catch (err) {
      console.error('[VoiceoverPanel] TTS error:', err);
      setAudioState('error');
    }
  }

  function handleVoiceSelect(voice: string) {
    setAudioState('idle');
    setAudioUrl(null);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    onVoiceChange(voice);
  }

  function handleToggle() {
    if (!audioRef.current || audioState === 'idle') {
      generateVoiceover();
      return;
    }
    if (audioState === 'playing') {
      audioRef.current.pause();
      setAudioState('paused');
    } else if (audioState === 'ready' || audioState === 'paused') {
      audioRef.current.play();
      setAudioState('playing');
    }
  }

  function getButtonLabel() {
    switch (audioState) {
      case 'idle': return "▶ Generate Voiceover";
      case 'loading': return "Generating...";
      case 'ready': return "▶ Play";
      case 'playing': return "⏸ Pause";
      case 'paused': return "▶ Resume";
      case 'error': return "↺ Try again";
      default: return "▶ Generate Voiceover";
    }
  }

  return (
    <div style={{ marginBottom: 28 }} className="animate-fade-in">
      <SectionHeader icon="🎙️" title="Voiceover" subtitle="Choose a voice and preview your script" />

      {/* Voice selector */}
      <Card style={{ marginBottom: 16 }}>
        <MonoLabel style={{ marginBottom: 12 }}>SELECT VOICE</MonoLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {VOICES.map((v) => (
            <button
              key={v.name}
              onClick={() => handleVoiceSelect(v.name)}
              style={{
                padding: "12px 8px", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.15s",
                background: selectedVoice === v.name ? "rgba(124,92,252,0.15)" : "var(--surface2)",
                border: `1px solid ${selectedVoice === v.name ? "var(--accent)" : "var(--border)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 20 }}>{v.icon}</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{v.name}</span>
              <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{v.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      {quotaStatus && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted2)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            <span>MONTHLY VOICE BUDGET</span>
            <span style={{ color: quotaStatus.global.pct > 80 ? 'var(--red)' : quotaStatus.global.pct > 50 ? 'var(--amber)' : 'var(--accent)' }}>
              {quotaStatus.global.pct}% used
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 2 }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, quotaStatus.global.pct)}%`,
              background: quotaStatus.global.pct > 80 ? 'var(--red)' : quotaStatus.global.pct > 50 ? 'var(--amber)' : 'var(--accent)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted2)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
            Your usage: {quotaStatus.user.used.toLocaleString()} / {quotaStatus.user.limit.toLocaleString()} chars this month
          </div>

          {quotaStatus.global.is_exhausted && (
            <div style={{
              marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: 12, color: '#FCA5A5'
            }}>
              ⚠ Monthly voice budget exhausted. Resets on the 1st.
            </div>
          )}

          {quotaStatus.global.pct >= 70 && !quotaStatus.global.is_exhausted && (
            <div style={{
              marginTop: 12, padding: '10px 14px', background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--amber)'
            }}>
              Voice budget at {quotaStatus.global.pct}%. Upgrade to Creator ($22/mo) for 10× more voices.
            </div>
          )}
        </Card>
      )}

      {/* Quota Warning Panel */}
      {audioState === 'quota' && (
        <Card style={{ marginBottom: 16, border: "1px solid var(--amber)", background: "rgba(251, 191, 36, 0.1)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontWeight: 600, color: "var(--amber)" }}>Monthly voice limit reached</span>
            <span style={{ fontSize: 13, color: "var(--text)" }}>Monthly quota is being used carefully. The pipeline still works: select your script and continue without preview.</span>
            <Button size="sm" onClick={() => onContinue(null)} style={{ alignSelf: "flex-start", marginTop: 8 }}>
              Continue anyway →
            </Button>
          </div>
        </Card>
      )}

      {/* Waveform player */}
      <Card>
        <audio
          ref={audioRef}
          src={audioUrl || ''}
          onTimeUpdate={() => {
            if (!audioRef.current) return;
            const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(isNaN(pct) ? 0 : pct);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDurationState(audioRef.current.duration);
          }}
          onEnded={() => {
            setAudioState('ready');
            setProgress(0);
          }}
          style={{ display: 'none' }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <MonoLabel style={{ flex: 1 }}>PREVIEW — {selectedVoice.toUpperCase()}</MonoLabel>
          {audioState === 'loading' && <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Loading audio…</span>}
        </div>

        {/* Waveform */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, height: 48, marginBottom: 12 }}>
          <button
            onClick={handleToggle}
            disabled={audioState === 'loading'}
            style={{ 
              flexShrink: 0, width: 36, height: 36, borderRadius: "50%", 
              background: audioState === 'error' ? 'transparent' : "var(--accent)", 
              color: audioState === 'error' ? 'var(--text)' : '#fff',
              border: audioState === 'error' ? '1px solid var(--border)' : "none", 
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 14, marginRight: 10, boxShadow: audioState === 'error' ? 'none' : "var(--shadow-accent)",
              opacity: audioState === 'loading' ? 0.6 : 1
            }}
          >
            {audioState === 'playing' ? "⏸" : "▶"}
          </button>
          <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: "var(--text)", marginLeft: -4, marginRight: 8, whiteSpace: "nowrap" }}>
             {getButtonLabel()}
          </div>
          {waveform.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1, maxWidth: 4,
                height: `${h * 100}%`,
                borderRadius: 2,
                background: i / waveform.length < progress / 100
                  ? "var(--accent)"
                  : "var(--surface3)",
                transition: "background 0.1s",
                transform: audioState === 'playing' ? `scaleY(${0.6 + Math.sin(Date.now() / 200 + i) * 0.4})` : "scaleY(1)",
                transformOrigin: "center",
              }}
            />
          ))}
        </div>

        {/* Progress bar (clickable to seek) */}
        <div 
          className="score-bar" 
          style={{ marginBottom: 16, cursor: audioState === 'playing' || audioState === 'paused' || audioState === 'ready' ? 'pointer' : 'default' }}
          onClick={(e) => {
            if (!audioRef.current || (audioState !== 'playing' && audioState !== 'paused' && audioState !== 'ready')) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct  = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = pct * audioRef.current.duration;
            setProgress(pct * 100);
          }}
        >
          <div className="score-bar-fill" style={{ width: `${progress}%`, background: "var(--accent)" }} />
        </div>

        {/* Char count */}
        {charCount > 0 && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted2)", marginBottom: 16 }}>
            {charCount} chars used · ~{Math.round(charCount * 0.5)} credits (Flash model)
          </div>
        )}

        {/* Script preview */}
        <div style={{ padding: "12px 14px", background: "var(--surface2)", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          {script.hook_line} {script.body} {script.cta}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
          <Button size="md" onClick={() => onContinue(audioUrl)} style={{ flex: 1, justifyContent: "center" }}>
            Continue to Preview →
          </Button>
        </div>
      </Card>
    </div>
  );
}
