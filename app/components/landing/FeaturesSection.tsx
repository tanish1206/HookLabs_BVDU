'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function IconRadar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.4" opacity="0.8" />
      <path d="M12 12L18 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="8" r="1.6" fill="currentColor" />
    </svg>
  )
}
function IconSplit() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4V20" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2 3" />
      <path d="M12 7L6 12L12 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7L18 12L12 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconCaption() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 11H17M7 15H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function IconWave() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12C3.5 12 3.5 8 5 8C6.5 8 6.5 16 8 16C9.5 16 9.5 6 11 6C12.5 6 12.5 18 14 18C15.5 18 15.5 9 17 9C18.5 9 18.5 14 20 14C21 14 21.5 12 22 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconRocket() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 4C17.5 4.5 19.5 6.5 20 10C17 10 14 13 14 16C10.5 15.5 8.5 13.5 8 10C11 10 14 7 14 4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 16L5 19M9.5 17.5L6.5 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function FeaturesSection() {
  const [showToTop, setShowToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowToTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section style={{ position: 'relative', zIndex: 25, padding: '80px 24px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="gc gc-copper" style={{ gridColumn: 'span 2', minHeight: 220, padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Self-optimising feedback loop</div>
            <div style={{ color: 'var(--muted)', marginBottom: 16 }}>Every video teaches the algorithm what to make next</div>
            <svg width="100%" height="90" viewBox="0 0 600 90" fill="none" aria-hidden>
              <path d="M10 70 C110 62, 130 20, 220 28 C300 34, 340 72, 420 58 C485 46, 520 20, 590 26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="gc gc-blue" style={{ minHeight: 220, padding: 20, color: '#ffffff' }}>
            <IconRadar />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 14, color: 'var(--text)' }}>Live trend radar</div>
            <div style={{ color: 'var(--muted)', marginTop: 8 }}>Reddit, HN, Google Trends — refreshed hourly</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="gc gc-crimson" style={{ minHeight: 220, padding: 20, color: '#ffffff' }}>
            <IconSplit />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 14, color: 'var(--text)' }}>A/B hook testing</div>
            <div style={{ color: 'var(--muted)', marginTop: 8 }}>Three hook variants per script, ranked by CTR prediction</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="gc gc-green" style={{ minHeight: 220, padding: 20, color: '#ffffff' }}>
            <IconCaption />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 14, color: 'var(--text)' }}>Auto captions</div>
            <div style={{ color: 'var(--muted)', marginTop: 8 }}>Burned-in subtitles synced to the millisecond</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="gc gc-blue" style={{ minHeight: 220, padding: 20, color: '#ffffff' }}>
            <IconWave />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 14, color: 'var(--text)' }}>Neural voices</div>
            <div style={{ color: 'var(--muted)', marginTop: 8 }}>ElevenLabs TTS — 4 voices, adjustable pace</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.40 }}
            className="gc gc-green" style={{ gridColumn: 'span 2', minHeight: 220, padding: 20, color: '#ffffff' }}>
            <IconRocket />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginTop: 14, color: 'var(--text)' }}>One-click publish</div>
            <div style={{ color: 'var(--muted)', marginTop: 8, marginBottom: 14 }}>Direct to YouTube Shorts, TikTok, and Instagram Reels</div>
            <div style={{ display: 'flex', gap: 18, color: '#a7b0c0' }}>
              <svg width="46" height="22" viewBox="0 0 46 22" fill="none" aria-hidden><rect x="1" y="1" width="44" height="20" rx="5" stroke="currentColor" /><path d="M19 7L28 11L19 15V7Z" stroke="currentColor" /></svg>
              <svg width="46" height="22" viewBox="0 0 46 22" fill="none" aria-hidden><rect x="1" y="1" width="44" height="20" rx="5" stroke="currentColor" /><path d="M22 6V14C22 16 24 17 26 16.5" stroke="currentColor" /><circle cx="19" cy="14" r="2.5" stroke="currentColor" /></svg>
              <svg width="46" height="22" viewBox="0 0 46 22" fill="none" aria-hidden><rect x="1" y="1" width="44" height="20" rx="5" stroke="currentColor" /><circle cx="18" cy="11" r="4.5" stroke="currentColor" /><path d="M25 9.5C27.5 9 29.5 11.2 29 13.5" stroke="currentColor" /></svg>
            </div>
          </motion.div>
        </div>
      </div>

      <button
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          width: 40,
          height: 40,
          borderRadius: 10,
          border: '1px solid #ffffff',
          background: 'rgba(10,10,10,0.65)',
          color: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          opacity: showToTop ? 1 : 0,
          pointerEvents: showToTop ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, background 0.2s ease, color 0.2s ease',
          zIndex: 60,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ffffff'
          e.currentTarget.style.color = '#000000'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(10,10,10,0.65)'
          e.currentTarget.style.color = '#ffffff'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6.5 14.5L12 9L17.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  )
}

