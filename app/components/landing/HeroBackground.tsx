'use client'
import GridMotion from '@/app/components/GridMotion'
import { HeroVideoCell } from './HeroVideoCell'
import { HERO_VIDEOS } from '@/lib/heroVideos'

interface HeroBackgroundProps {
  videoUrls: Record<string, string>  // pexelsId → url map
}

export function HeroBackground({ videoUrls }: HeroBackgroundProps) {
  const items = HERO_VIDEOS.map(v => (
    <HeroVideoCell
      key={v.id}
      videoUrl={videoUrls[v.pexelsId] || ''}
      lines={v.lines}
      accentColor={v.accentColor}
      category={v.category}
    />
  ))

  return (
    <div style={{
      position:  'absolute',
      inset:      0,
      zIndex:     0,
      overflow:  'hidden',
    }}>
      <GridMotion
        items={items}
        gradientColor="rgba(10, 10, 15, 0.85)"
      />
      
      {/* Extra vignette to fade edges into page bg */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(10,10,10,0.9) 100%),
          linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, transparent 30%, transparent 70%, rgba(10,10,10,0.95) 100%)
        `,
        pointerEvents: 'none',
        zIndex: 2,
      }} />
    </div>
  )
}
