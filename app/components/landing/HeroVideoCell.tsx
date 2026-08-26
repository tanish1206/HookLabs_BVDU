'use client'
import { useEffect, useRef, useState } from 'react'

interface HeroVideoCellProps {
  videoUrl:     string    // Pexels CDN URL
  lines:        string[]  // subtitle lines, max 3
  accentColor:  string    // hex color for subtitle bg
  category:     string
}

const FALLBACK_GRADIENTS: Record<string, string> = {
  'AI & Tech':  'linear-gradient(135deg, #0a1628 0%, #1c2d4a 100%)',
  'Crypto':     'linear-gradient(135deg, #100c02 0%, #241a04 100%)',
  'Creators':   'linear-gradient(135deg, #120808 0%, #1e1010 100%)',
  'Science':    'linear-gradient(135deg, #060f0c 0%, #0c1c16 100%)',
  'Space':      'linear-gradient(135deg, #080810 0%, #0e0e20 100%)',
}

export function HeroVideoCell({ 
  videoUrl, lines, accentColor, category 
}: HeroVideoCellProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded]   = useState(false)
  const [lineIdx, setLineIdx] = useState(0)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Cycle subtitle lines every 1.8 seconds
  useEffect(() => {
    if (lines.length <= 1) return
    const interval = setInterval(() => {
      setLineIdx(i => (i + 1) % lines.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [lines.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          if (videoRef.current) videoRef.current.play().catch(() => {})
        } else {
          if (videoRef.current) videoRef.current.pause()
        }
      },
      { threshold: 0.1 }
    )
    if (videoRef.current) observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{
      position:  'relative',
      width:     '100%',
      height:    '100%',
      borderRadius: 'inherit',
      overflow:  'hidden',
      background: hasError ? FALLBACK_GRADIENTS[category] || '#111' : '#0a0a0f',
    }}>
      {/* Pexels video — muted, looping, autoplay */}
      {!hasError && (
        <video
          ref={videoRef}
          src={shouldLoad ? videoUrl : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          crossOrigin="anonymous"
          onCanPlay={() => setLoaded(true)}
          onError={() => {
            setLoaded(false)
            setHasError(true)
          }}
          style={{
            position:   'absolute',
            inset:       0,
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            objectPosition: 'center',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      )}

      {/* Dark gradient overlay for subtitle readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Subtitle overlay */}
      <div style={{
        position:   'absolute',
        bottom:     '14%',
        left:       '50%',
        transform:  'translateX(-50%)',
        width:      '88%',
        textAlign:  'center',
        zIndex:     10,
        display:    'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap:        4,
      }}>
        {lines.map((line, i) => (
          <span
            key={line}
            style={{
              display:         'inline-block',
              background:      i === lineIdx
                               ? accentColor
                               : `${accentColor}55`,
              color:           '#ffffff',
              fontFamily:      'Syne, sans-serif',
              fontWeight:      800,
              // Scale font size to cell size via clamp
              fontSize:        'clamp(8px, 1.8vw, 16px)',
              letterSpacing:   '0.04em',
              padding:         '3px 8px',
              borderRadius:    5,
              lineHeight:      1.3,
              transition:      'background 0.3s ease, transform 0.3s ease',
              transform:       i === lineIdx ? 'scale(1.05)' : 'scale(1)',
              marginBottom:    2,
            }}
          >
            {line}
          </span>
        ))}
      </div>

      {/* Category badge — top left */}
      <div style={{
        position:   'absolute',
        top:        10,
        left:       10,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        border:     `1px solid ${accentColor}44`,
        borderRadius: 20,
        padding:    '2px 8px',
        fontFamily: 'DM Mono, monospace',
        fontSize:   9,
        color:      accentColor,
        letterSpacing: '0.5px',
        zIndex:     10,
      }}>
        {category.toUpperCase()}
      </div>

      {/* Skeleton shimmer while loading */}
      {!loaded && !hasError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      )}
    </div>
  )
}
