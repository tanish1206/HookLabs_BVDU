'use client'
import { useEffect, useRef, useState } from 'react'
import { BorderGlow } from '@/app/components/reactbits/BorderGlow'

const PLANS = [
  {
    name: 'Starter',
    price: '$29',
    limit: '30 videos/mo',
    accent: '#ffffff',
    accentRgb: '255,255,255',
    features: [
      'Trend detection (3 sources)',
      'Script generation (1 variant)',
      '1 neural voice',
      '720p MP4 export',
      '10GB cloud storage',
    ],
    cta: 'Start Creating',
  },
  {
    name: 'Creator Pro',
    price: '$79',
    limit: '200 videos/mo',
    accent: '#4db8e8',
    accentRgb: '78,185,230',
    featured: true,
    features: [
      'Everything in Starter',
      'A/B hook testing (3 variants)',
      '4 neural voices',
      '1080p + Shorts export',
      'Analytics dashboard',
      'Priority render queue',
    ],
    cta: 'Go Pro',
  },
  {
    name: 'Agency',
    price: '$199',
    limit: 'Unlimited videos',
    accent: '#26c48a',
    accentRgb: '38,196,138',
    features: [
      'Everything in Creator Pro',
      'Team seats (5 users)',
      'White-label export',
      'API access',
      'Dedicated support',
    ],
    cta: 'Scale Up',
  },
] as const
type Plan = (typeof PLANS)[number]

export default function PricingSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ padding: '120px 0', position: 'relative', background: '#0a0a0a' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease',
          }}
        >
          <p
            style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '11px',
              letterSpacing: '0.15em',
              color: 'rgba(245,240,235,0.4)',
              margin: '0 0 8px',
            }}
          >
            PRICING
          </p>
          <h2
            style={{
              fontFamily: 'Syne,sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(28px,4vw,48px)',
              color: '#f5f0eb',
              margin: 0,
            }}
          >
            Pick your output tier.
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'stretch',
            padding: '0 24px',
            width: '100%',
          }}
        >
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              style={{
                flex: 1,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
                transition: `all 0.8s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.15}s`,
                willChange: 'transform, opacity',
              }}
            >
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PricingCard({ plan }: { plan: Plan }) {
  const isFeatured = 'featured' in plan && !!plan.featured
  return (
    <BorderGlow glowColor={plan.accent} borderRadius={20}>
      <div
        style={{
          background: isFeatured
            ? `linear-gradient(145deg, rgba(${plan.accentRgb},0.1) 0%, rgba(8,12,18,0.97) 100%)`
            : `linear-gradient(145deg, rgba(${plan.accentRgb},0.08) 0%, rgba(10,10,10,0.97) 100%)`,
          border: isFeatured
            ? `2px solid rgba(${plan.accentRgb},0.5)`
            : `1px solid rgba(${plan.accentRgb},0.25)`,
          borderRadius: '20px',
          padding: '32px 28px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backdropFilter: 'blur(20px)',
          boxShadow: isFeatured
            ? `0 0 80px rgba(${plan.accentRgb},0.2), inset 0 0 40px rgba(${plan.accentRgb},0.06)`
            : `0 0 40px rgba(${plan.accentRgb},0.08)`,
        }}
      >
        {isFeatured && (
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'DM Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: plan.accent,
              background: `rgba(${plan.accentRgb},0.15)`,
              border: `1px solid rgba(${plan.accentRgb},0.4)`,
              padding: '4px 16px',
              borderRadius: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            MOST POPULAR
          </div>
        )}

        <h3
          style={{
            fontFamily: 'Syne,sans-serif',
            fontWeight: 800,
            fontSize: '22px',
            color: '#f5f0eb',
            margin: '0 0 4px',
          }}
        >
          {plan.name}
        </h3>

        <div style={{ margin: '16px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span
            style={{
              fontFamily: 'Syne,sans-serif',
              fontWeight: 800,
              fontSize: '56px',
              color: plan.accent,
              lineHeight: 1,
            }}
          >
            {plan.price}
          </span>
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '16px', color: 'rgba(245,240,235,0.45)' }}>
            /mo
          </span>
        </div>

        <div
          style={{
            display: 'inline-block',
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: plan.accent,
            background: `rgba(${plan.accentRgb},0.12)`,
            border: `1px solid rgba(${plan.accentRgb},0.25)`,
            borderRadius: '8px',
            padding: '5px 12px',
            marginBottom: '24px',
          }}
        >
          {plan.limit}
        </div>

        <ul
          style={{
            listStyle: 'none',
            margin: '0 0 auto',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {plan.features.map((f, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'DM Sans,sans-serif',
                fontSize: '14px',
                color: 'rgba(245,240,235,0.75)',
                lineHeight: 1.5,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path
                  d="M3 8l3.5 3.5L13 4.5"
                  stroke={plan.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        <a
          href="/login"
          style={{
            display: 'block',
            marginTop: '28px',
            padding: '14px',
            textAlign: 'center',
            borderRadius: '12px',
            background: isFeatured ? plan.accent : 'transparent',
            border: isFeatured ? 'none' : `1px solid rgba(${plan.accentRgb},0.4)`,
            color: isFeatured ? '#fff' : plan.accent,
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          {plan.cta}
        </a>
      </div>
    </BorderGlow>
  )
}

