'use client'
import { useRef, useEffect } from 'react'

interface BorderGlowProps {
  children: React.ReactNode
  glowColor?: string
  borderRadius?: number
  glowSize?: number
  className?: string
  style?: React.CSSProperties
}

export function BorderGlow({
  children,
  glowColor = '#ffffff',
  borderRadius = 16,
  glowSize = 60,
  className,
  style,
}: BorderGlowProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function onMouse(e: MouseEvent) {
      const target = ref.current
      if (!target) return
      const rect = target.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      target.style.setProperty('--glow-x', `${x}px`)
      target.style.setProperty('--glow-y', `${y}px`)
      target.style.setProperty('--glow-opacity', '1')
    }
    function onLeave() {
      const target = ref.current
      if (!target) return
      target.style.setProperty('--glow-opacity', '0')
    }

    el.addEventListener('mousemove', onMouse)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMouse)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        borderRadius: `${borderRadius}px`,
        isolation: 'isolate',
        ...style,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: `${borderRadius + 1}px`,
          padding: '1px',
          background: `radial-gradient(${glowSize * 2}px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${glowColor}, transparent 70%)`,
          opacity: 'var(--glow-opacity, 0)' as any,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  )
}

