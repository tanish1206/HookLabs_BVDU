'use client'
import { useState, useEffect } from 'react'

export function useScrollProgress(startVh: number, endVh: number) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY
      const vh = window.innerHeight
      const startPx = (startVh * vh) / 100
      const endPx = (endVh * vh) / 100
      const denom = endPx - startPx

      const clamped = denom === 0
        ? 0
        : Math.max(
            0,
            Math.min(1, (scrollY - startPx) / denom)
          )
      setProgress(clamped)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [startVh, endVh])

  return progress
}

