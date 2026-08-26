'use client'
import { useEffect, useRef } from 'react'
import { GridMotion } from '@/app/components/reactbits/GridMotion'

const HERO_ITEMS = [
  "AI WROTE 30% OF GITHUB'S CODE LAST QUARTER",
  'BITCOIN HIT $120K. YOUR BANK EARNS YOU 0.5%',
  'STOP TRYING TO GO VIRAL. DO THIS INSTEAD',
  'MIT CONFIRMED: 4-DAY WEEK = 23% MORE OUTPUT',
  "CHINA'S AI BEAT GPT-4 ON 8 BENCHMARKS. FREE.",
  '90% OF CREATORS QUIT IN MONTH 3. THIS IS WHY',
  'SPACEX MADE ROCKET LANDING LOOK BORING',
  "AI WROTE 30% OF GITHUB'S CODE LAST QUARTER",
  'BITCOIN HIT $120K. YOUR BANK EARNS YOU 0.5%',
  'STOP TRYING TO GO VIRAL. DO THIS INSTEAD',
  'MIT CONFIRMED: 4-DAY WEEK = 23% MORE OUTPUT',
  'SPACEX MADE ROCKET LANDING LOOK BORING',
  '90% OF CREATORS QUIT IN MONTH 3. THIS IS WHY',
  "CHINA'S AI BEAT GPT-4 ON 8 BENCHMARKS. FREE.",
]

export function GridBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.style.setProperty('--hero-opacity', '1')
    document.documentElement.style.setProperty('--grid-parallax-y', '0px')
    document.documentElement.style.setProperty('--grid-opacity', '1')

    function onScroll() {
      const scrollY = window.scrollY
      const vh = window.innerHeight

      const pct = Math.min(1, scrollY / vh)
      document.documentElement.style.setProperty('--grid-parallax-y', `${pct * 80}px`)

      const heroOpacity = Math.max(0, 1 - pct * 2)
      document.documentElement.style.setProperty('--hero-opacity', String(heroOpacity))

      const fadeStart = vh * 0.8
      const fadeEnd = vh * 1.5
      const gridOpacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart))
      document.documentElement.style.setProperty('--grid-opacity', String(gridOpacity))

      const videoPause = scrollY > vh * 2
      document.documentElement.style.setProperty('--grid-video-state', videoPause ? 'paused' : 'running')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mouse parallax is removed in favor of pure scroll-driven motion

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 'var(--grid-opacity, 1)' as any,
        transition: 'opacity 0.3s linear',
      }}
    >
      <div
        ref={gridRef}
        style={{
          width: '100%',
          height: '110vh',
          transform: 'translateY(var(--grid-parallax-y, 0px))',
          transition: 'transform 0.1s linear',
          willChange: 'transform',
        }}
      >
        <GridMotion items={HERO_ITEMS} gradientColor="rgba(10,10,10,0.72)" />
      </div>
    </div>
  )
}

export default GridBackground

