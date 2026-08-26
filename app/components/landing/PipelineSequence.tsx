'use client'
import { useEffect, useRef, useState } from 'react'
import { BorderGlow } from '@/app/components/reactbits/BorderGlow'

const PIPELINE_CARDS = [
  {
    id: 'trend',
    step: '01',
    emoji: '📡',
    title: 'Trend Fetcher',
    sub: 'Reddit · HN · Google Trends',
    accent: '#ffffff',
    description:
      'Scans 3 live data sources every 15 minutes. Scores topics by velocity, virality potential, and niche relevance. Only the hottest 5% reach your queue.',
    details: ['Reddit hot + rising feeds', 'Hacker News trending', 'Google Trends momentum', 'Virality score 0–100'],
  },
  {
    id: 'script',
    step: '02',
    emoji: '✍️',
    title: 'Script Writer',
    sub: 'Groq AI · 3 hook variants',
    accent: '#4db8e8',
    description:
      'Generates three complete scripts with different hooks — curiosity, controversy, and proof. Each is optimised for 30–90 second runtime with pattern-interrupt pacing.',
    details: ['3 unique hook styles', 'Groq LLaMA 3 70B', 'Hook → Build → CTA structure', 'Avg 68-word script'],
  },
  {
    id: 'audio',
    step: '03',
    emoji: '🎙️',
    title: 'Neural Audio',
    sub: 'ElevenLabs TTS · 4 voices',
    accent: '#26c48a',
    description:
      'Professional-grade AI voiceover in 4 distinct voices. Automatic pacing, emphasis markers, and breath points. Exports clean WAV in under 8 seconds.',
    details: ['4 voice personas', 'ElevenLabs v2 model', 'Auto emphasis + pacing', 'WAV 44.1kHz export'],
  },
  {
    id: 'broll',
    step: '04',
    emoji: '🎬',
    title: 'B-Roll Library',
    sub: 'Pexels · 10M+ vertical clips',
    accent: '#ffffff',
    description:
      'Semantic search across 10 million licensed vertical clips. AI matches B-roll to each sentence of your script. Zero copyright risk, instant download.',
    details: ['10M+ Pexels clips', 'AI semantic matching', '9:16 vertical format', 'Royalty-free licensed'],
  },
  {
    id: 'edit',
    step: '05',
    emoji: '✂️',
    title: 'Final Edits',
    sub: 'Subtitles · Filters · Trim',
    accent: '#e83050',
    description:
      'Burned-in captions synced to the millisecond, colour-grade filters, and auto-trim to optimal length. All in a 15-second render pipeline.',
    details: ['Burned-in captions', '8 colour filters', 'Auto-trim to hook', '15s average render'],
  },
  {
    id: 'export',
    step: '06',
    emoji: '⬇️',
    title: 'Ready to Export',
    sub: 'MP4 · Share link · Publish',
    accent: '#26c48a',
    description:
      'One-click export to MP4 or direct publish to YouTube Shorts, TikTok, and Instagram Reels. Shareable preview link included for team review.',
    details: ['MP4 1080×1920', 'Direct publish 3 platforms', 'Shareable preview link', 'Avg 47s total pipeline'],
  },
]

const ENTRY_FROM = [
  { x: '-120vw', y: '-30vh', rotate: -22 },
  { x: '120vw', y: '-20vh', rotate: 18 },
  { x: '-120vw', y: '0vh', rotate: -14 },
  { x: '120vw', y: '15vh', rotate: 24 },
  { x: '-120vw', y: '25vh', rotate: -16 },
  { x: '120vw', y: '20vh', rotate: 12 },
]

export default function PipelineSequence() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState(-1)

  useEffect(() => {
    function onScroll() {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalH = containerRef.current.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / totalH))

      const cardProgress = Math.max(0, (progress - 0.08) / 0.92)
      const newActive = Math.min(5, Math.floor(cardProgress * 6))
      setActiveCard(progress < 0.05 ? -1 : newActive)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={containerRef} style={{ height: '250vh', position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            opacity: activeCard === -1 ? 1 : 0,
            transition: 'opacity 0.6s ease',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <p
            style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '11px',
              letterSpacing: '0.15em',
              color: 'rgba(245,240,235,0.4)',
              marginBottom: '12px',
            }}
          >
            THE PIPELINE
          </p>
          <h2
            style={{
              fontFamily: 'Syne,sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(32px,5vw,56px)',
              color: '#f5f0eb',
              margin: 0,
            }}
          >
            Four steps. Zero effort.
          </h2>
          <p
            style={{
              fontFamily: 'DM Sans,sans-serif',
              fontWeight: 300,
              fontSize: '16px',
              color: 'rgba(245,240,235,0.5)',
              marginTop: '12px',
            }}
          >
            Scroll to see how it works
          </p>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '8%',
            transform: 'translateX(-50%)',
            width: '4px',
            height: '84%',
            opacity: activeCard >= 0 ? 0.25 : 0,
            transition: 'opacity 0.8s ease',
            background:
              'linear-gradient(to bottom, #ffffff, #4db8e8, #26c48a, #ffffff, #e83050, #26c48a)',
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        />

        {PIPELINE_CARDS.map((card, i) => {
          const isActive = activeCard === i
          const isPast = activeCard > i
          const isFuture = activeCard < i

          let transform = ''
          let opacity = 1
          let scale = 1

          if (isFuture) {
            transform = `translate(${ENTRY_FROM[i].x}, ${ENTRY_FROM[i].y}) rotate(${ENTRY_FROM[i].rotate}deg)`
            opacity = 0
          } else if (isActive) {
            transform = `translate(-50%, -50%)`
            scale = 1
          } else {
            const pastIndex = i
            transform = `translate(calc(35vw - 50%), calc(-220px + ${pastIndex * 60}px))`
            scale = 0.52
            opacity = 0.7
          }

          return (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform,
                opacity,
                scale: String(scale),
                transition: isFuture
                  ? 'none'
                  : 'transform 0.9s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease, scale 0.7s ease',
                zIndex: isActive ? 20 : isPast ? 10 : 5,
                willChange: 'transform, opacity',
              }}
            >
              {isActive ? (
                <PipelineCardExpanded card={card} />
              ) : (
                <PipelineCardMini card={card} isPast={isPast} />
              )}
            </div>
          )
        })}

        {activeCard >= 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '8%',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            {PIPELINE_CARDS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: activeCard === i ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background:
                    activeCard === i
                      ? PIPELINE_CARDS[i].accent
                      : activeCard > i
                        ? 'rgba(245,240,235,0.5)'
                        : 'rgba(245,240,235,0.15)',
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PipelineCardExpanded({ card }: { card: (typeof PIPELINE_CARDS)[0] }) {
  return (
    <BorderGlow glowColor={card.accent} borderRadius={20}>
      <div
        style={{
          width: 'min(480px, 90vw)',
          background: `linear-gradient(135deg, ${card.accent}20 0%, rgba(10,10,10,0.97) 100%)`,
          border: `1px solid ${card.accent}55`,
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(24px)',
          boxShadow: `0 0 60px ${card.accent}25, 0 30px 80px rgba(0,0,0,0.5)`,
          animation: 'cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
          borderBottom: `3px solid ${card.accent}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '11px',
              background: `${card.accent}25`,
              border: `1px solid ${card.accent}45`,
              color: card.accent,
              padding: '4px 12px',
              borderRadius: '20px',
              letterSpacing: '0.08em',
            }}
          >
            STEP {card.step}
          </span>
          <span style={{ fontSize: '28px' }}>{card.emoji}</span>
        </div>

        <h3
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '32px',
            color: card.accent,
            margin: '0 0 8px',
          }}
        >
          {card.title}
        </h3>

        <p
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '12px',
            color: 'rgba(245,240,235,0.4)',
            margin: '0 0 20px',
            letterSpacing: '0.05em',
          }}
        >
          {card.sub}
        </p>

        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 300,
            fontSize: '15px',
            color: 'rgba(245,240,235,0.78)',
            lineHeight: 1.7,
            margin: '0 0 24px',
          }}
        >
          {card.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {card.details.map((d, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(245,240,235,0.6)',
                padding: '5px 12px',
                borderRadius: '8px',
                letterSpacing: '0.04em',
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </BorderGlow>
  )
}

function PipelineCardMini({ card }: { card: (typeof PIPELINE_CARDS)[0]; isPast: boolean }) {
  return (
    <div
      style={{
        width: '200px',
        background: `linear-gradient(135deg, ${card.accent}15 0%, rgba(10,10,10,0.9) 100%)`,
        border: `1px solid ${card.accent}30`,
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span
        style={{
          fontFamily: 'DM Mono,monospace',
          fontSize: '10px',
          background: `${card.accent}20`,
          border: `1px solid ${card.accent}40`,
          color: card.accent,
          padding: '3px 8px',
          borderRadius: '12px',
        }}
      >
        ✓ {card.step}
      </span>
      <span
        style={{
          fontFamily: 'Syne,sans-serif',
          fontWeight: 700,
          fontSize: '13px',
          color: 'rgba(245,240,235,0.6)',
        }}
      >
        {card.title}
      </span>
    </div>
  )
}

