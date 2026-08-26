'use client'
import { useEffect, useRef, useState } from 'react'
import { BorderGlow } from '@/app/components/reactbits/BorderGlow'

function formatNumber(
  value: number,
  opts: { style?: 'int' | 'float'; decimals?: number } = {}
) {
  if (opts.style === 'float') {
    const decimals = typeof opts.decimals === 'number' ? opts.decimals : 1
    return value.toFixed(decimals)
  }
  // Default: integer formatting
  return Math.round(value).toLocaleString()
}

function CountUp({
  to,
  durationMs = 1800,
  format,
}: {
  to: number
  durationMs?: number
  format: (value: number) => string
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    let raf: number | null = null
    let started = false

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return
        started = true

        const start = performance.now()
        const from = 0

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs)
          // Ease-out: 1 - (1-t)^3
          const eased = 1 - Math.pow(1 - t, 3)
          const next = from + (to - from) * eased
          setValue(next)

          if (t < 1) raf = requestAnimationFrame(tick)
        }

        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.25 }
    )

    obs.observe(el)
    return () => {
      obs.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [durationMs, to])

  return (
    <div ref={hostRef}>
      {format(value)}
    </div>
  )
}

import { motion } from 'framer-motion'

export default function StatsSection() {
  const stats = [
    {
      target: 19000,
      label: 'creators',
      format: (v: number) => `${formatNumber(v)}+`,
    },
    {
      target: 4_200_000,
      label: 'total views',
      format: (v: number) => {
        const n = v
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
        return formatNumber(n)
      },
    },
    {
      target: 2490,
      label: 'videos made',
      format: (v: number) => `${formatNumber(v)}+`,
    },
    {
      target: 6.8,
      label: 'avg ctr',
      format: (v: number) => `${v.toFixed(1)}%`,
    },
  ]

  const tickerItems = [
    'Reddit',
    'Google Trends',
    'ElevenLabs',
    'Pexels',
    'Groq AI',
    'YouTube Shorts',
    'TikTok',
    'Instagram Reels',
  ]

  return (
    <section
      className="relative"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 0',
        background:
          'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.92) 15%, #0a0a0a 100%)',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <BorderGlow glowColor="#ffffff" borderRadius={16}>
                <div
                  className="gc gc-copper"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(10,10,10,0.85) 100%)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 48,
                      color: 'var(--accent)',
                      lineHeight: 1,
                      marginBottom: 10,
                    }}
                  >
                    <CountUp to={s.target} format={s.format} />
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--muted)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </div>

        {/* Marquee ticker */}
        <div style={{ marginTop: 44, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <style>{`
            @keyframes marqueeLeft {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>
          <div style={{ overflow: 'hidden', padding: '14px 0' }}>
            <div
              style={{
                display: 'flex',
                width: 'max-content',
                gap: 22,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--muted2)',
                animation: 'marqueeLeft 18s linear infinite',
                willChange: 'transform',
              }}
            >
              {[...tickerItems, ...tickerItems].map((t, idx) => (
                <span key={`${t}-${idx}`} style={{ whiteSpace: 'nowrap' }}>
                  {t}
                  {idx % 8 !== 7 ? '  ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

