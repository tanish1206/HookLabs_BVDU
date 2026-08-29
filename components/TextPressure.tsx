'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
}

export default function TextPressure({
  text = 'THE NEXT LAYER',
  fontFamily = 'Roboto Flex',
  fontUrl = 'https://fonts.gstatic.com/s/robotoflex/v30/bb6E45Fv4GHJLw73V7sc2A.woff2',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  stroke = false,
  scale = false,
  textColor = '#FFFFFF',
  strokeColor = '#FFFFFF',
  className = '',
  minFontSize = 24,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(minFontSize);
  const [lineHeight, setLineHeight] = useState(1);
  const requestRef = useRef<number | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Load font if URL provided
    if (fontUrl && typeof document !== 'undefined') {
      const fontName = fontFamily.replace(/['"]/g, '');
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      fontFace.load().then((loaded) => {
        (document.fonts as any).add(loaded);
      }).catch((err) => {
        console.warn('TextPressure font loading failed:', err);
      });
    }
  }, [fontFamily, fontUrl]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animationFrameId: number;

    const animate = () => {
      if (titleRef.current) {
        const spans = titleRef.current.querySelectorAll('.char');
        spans.forEach((span: Element) => {
          const rect = span.getBoundingClientRect();
          const charCenterX = rect.left + rect.width / 2;
          const charCenterY = rect.top + rect.height / 2;

          const dist = Math.hypot(mousePos.current.x - charCenterX, mousePos.current.y - charCenterY);
          const maxDist = 300;
          const normDist = Math.max(0, 1 - dist / maxDist);

          // Variable font attributes
          const wght = weight ? Math.round(100 + normDist * 800) : 400;
          const wdth = width ? Math.round(75 + normDist * 50) : 100;
          const ital = italic ? (normDist * 10).toFixed(1) : '0';

          (span as HTMLElement).style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital}`;
          if (alpha) {
            (span as HTMLElement).style.opacity = (0.4 + normDist * 0.6).toFixed(2);
          }
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weight, width, italic, alpha]);

  const chars = text.split('');

  return (
    <div
      ref={containerRef}
      className={`text-pressure-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <h2
        ref={titleRef}
        style={{
          fontFamily: `'${fontFamily}', sans-serif`,
          color: textColor,
          margin: 0,
          padding: 0,
          textAlign: 'center',
          lineHeight: 1.1,
          fontWeight: 400,
          letterSpacing: '-0.02em',
          wordBreak: 'break-word',
          WebkitTextStroke: stroke ? `1px ${strokeColor}` : 'none',
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            className="char"
            style={{
              display: 'inline-block',
              transition: 'font-variation-settings 0.1s ease-out, opacity 0.1s ease-out',
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            }}
          >
            {char}
          </span>
        ))}
      </h2>
    </div>
  );
}
