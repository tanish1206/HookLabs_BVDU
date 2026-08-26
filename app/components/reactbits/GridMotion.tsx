'use client'
import { useEffect, useRef, type FC, type ReactNode } from 'react'
import { gsap } from 'gsap'

export interface GridMotionProps {
  items?: (string | ReactNode)[]
  gradientColor?: string
}

const GridMotion: FC<GridMotionProps> = ({ items = [], gradientColor = 'black' }) => {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollYRef = useRef<number>(typeof window !== 'undefined' ? window.scrollY : 0)

  const totalItems = 28
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`)

  const paddedItems: (string | ReactNode)[] =
    items.length > 0
      ? Array.from({ length: totalItems }, (_, i) => items[i % items.length])
      : defaultItems

  useEffect(() => {
    gsap.ticker.lagSmoothing(0)

    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }

    const updateMotion = () => {
      const baseDuration = 0.5
      const inertiaFactors = [0.2, 0.4, 0.3, 0.1]

      rowRefs.current.forEach((row, index) => {
        if (!row) return

        const direction = index % 2 === 0 ? 1 : -1
        // Move horizontally based on scroll depth. 0.8 multiplier for parallax effect speed.
        const x = scrollYRef.current * 0.8 * direction

        gsap.to(row, {
          x,
          duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
          ease: 'power3.out',
          overwrite: 'auto',
        })
      })
    }

    const removeAnimationLoop = gsap.ticker.add(updateMotion)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Also trigger update on load in case the page is refreshed half-way down
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      removeAnimationLoop()
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Vignette / radial wash for depth */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${gradientColor} 0%, rgba(10,10,10,0) 70%)`,
          zIndex: 1,
        }}
      />

      <section className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
        <div className="gap-4 flex-none relative w-[150vw] h-[150vh] grid grid-rows-4 grid-cols-1 rotate-[-15deg] origin-center">
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 grid-cols-7"
              style={{ willChange: 'transform, filter' }}
              ref={(el) => {
                rowRefs.current[rowIndex] = el
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const cellIndex = rowIndex * 7 + itemIndex
                const content = paddedItems[cellIndex]

                return (
                  <div key={itemIndex} className="relative w-full h-full">
                    <div
                      className="hero-grid-cell-float w-full h-full"
                      style={{ ['--cell-index' as any]: cellIndex } as React.CSSProperties}
                    >
                      <div className="relative w-full h-full overflow-hidden rounded-[10px] bg-[#111] flex items-center justify-center text-white text-[1.5rem]">
                        {typeof content === 'string' && content.startsWith('http') ? (
                          <div
                            className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                            style={{ backgroundImage: `url(${content})` }}
                          />
                        ) : (
                          <div 
                            className="w-full h-full absolute inset-0 p-6 flex items-center justify-center text-center font-display font-bold text-white/50 tracking-wider"
                            style={{
                              background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(5,5,5,0.9) 100%)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              backdropFilter: 'blur(10px)',
                              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)',
                              textTransform: 'uppercase',
                              lineHeight: 1.2
                            }}
                          >
                            <span style={{ 
                              background: 'linear-gradient(180deg, #fff 0%, #888 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                            }}>
                              {content}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default GridMotion
export { GridMotion }

