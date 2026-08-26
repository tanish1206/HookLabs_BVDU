'use client'
import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'

const CYCLING_WORDS = ['videos', 'Shorts', 'Reels', 'TikToks']

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const [scrollIndicator, setScrollIndicator] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % CYCLING_WORDS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function onScroll() {
      setScrollIndicator(window.scrollY < 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10,10,10,0.75) 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '760px',
          opacity: 'var(--hero-opacity, 1)' as any,
          transform: 'translateY(calc(var(--grid-parallax-y, 0px) * 0.5))',
          willChange: 'transform, opacity',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: '5px 14px',
            marginBottom: '28px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: '#fff',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#fff',
              animation: 'pulse-white 2s infinite',
            }}
          />
          LIVE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(36px, 6vw, 72px)',
            lineHeight: 1.1,
            color: '#ffffff',
            margin: '0 0 24px',
          }}
        >
          Turn trends into{' '}
          <span
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'bottom',
              height: '1.1em',
            }}
          >
            <span
              key={wordIndex}
              style={{
                display: 'block',
                color: '#ffffff',
                textShadow: '0 0 20px rgba(255,255,255,0.3)',
                animation: 'slideWord 0.4s ease both',
              }}
            >
              {CYCLING_WORDS[wordIndex]}
            </span>
          </span>
          .<br />
          Instantly.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '520px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          HookLabs AI monitors Reddit, HN, and Google Trends 24/7. Trend spotted → script →
          voiceover → video. While you sleep.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '48px',
          }}
        >
          <a
            href="/login?redirectTo=/pipeline"
            style={{
              background: '#ffffff',
              color: '#000000',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              padding: '14px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLElement).style.transform = 'scale(1.03)'
              ;(e.target as HTMLElement).style.boxShadow = '0 0 32px rgba(255,255,255,0.4)'
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLElement).style.transform = 'scale(1)'
              ;(e.target as HTMLElement).style.boxShadow = 'none'
            }}
          >
            ⚡ Start Generating
          </a>
          <a
            href="/login?redirectTo=/pipeline"
            style={{
              background: 'transparent',
              color: '#ffffff',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              padding: '14px 32px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLElement).style.background = 'transparent'
            }}
          >
            Make Video →
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.08em',
          }}
        >
          19,000+ creators · 4.2M views · avg 6.8% CTR
        </motion.p>
      </div>

      {scrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollIndicator ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            animation: 'bounce 2s ease-in-out infinite',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}

      <style>{`
        @keyframes pulse-white {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(255,255,255,0.4) }
          50% { opacity:0.6; box-shadow: 0 0 0 6px rgba(255,255,255,0) }
        }
        @keyframes slideWord {
          from { transform: translateY(100%); opacity:0 }
          to   { transform: translateY(0);    opacity:1 }
        }
        @keyframes bounce {
          0%,100% { transform: translateX(-50%) translateY(0) }
          50% { transform: translateX(-50%) translateY(8px) }
        }
      `}</style>
    </section>
  )
}

export default HeroSection

