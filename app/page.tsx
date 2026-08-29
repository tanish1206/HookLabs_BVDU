'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import TextPressure from '@/components/TextPressure';
import {
  Play,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  Sparkles,
  Layers,
  Zap,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  BarChart3,
} from 'lucide-react';

export default function CinematicLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      setScrolled(currentScroll > 50);

      // Calculate step for autopilot story
      const storySection = document.getElementById('autopilot-story');
      if (storySection) {
        const rect = storySection.getBoundingClientRect();
        const height = rect.height;
        const progress = Math.max(0, Math.min(1, -rect.top / (height - window.innerHeight)));
        const step = Math.min(5, Math.floor(progress * 6));
        setActiveStep(step);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero Parallax Transforms
  const heroScale = 1 + Math.min(0.08, (scrollY / 1000) * 0.08);
  const heroOpacity = Math.max(0, 1 - scrollY / 700);
  const heroY = -Math.min(100, (scrollY / 700) * 100);

  return (
    <div style={{ background: '#050505', color: '#ffffff', fontFamily: 'var(--font-body, sans-serif)', overflowX: 'hidden' }}>
      
      {/* ── TOP NAVIGATION ────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: scrolled ? '16px 32px' : '24px 48px',
          background: scrolled ? 'rgba(5,5,5,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff' }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #7c5cfc, #6366f1)',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,92,252,0.5)',
          }} />
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-display, sans-serif)' }}>
            HOOKLABS
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-only">
          <a href="#problem" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>
            Problem
          </a>
          <a href="#intelligence" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>
            Intelligence
          </a>
          <a href="#autopilot" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>
            Autopilot
          </a>
          <a href="#human-control" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>
            Human Control
          </a>
          <a href="#rocketride" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>
            Engine
          </a>
        </nav>

        {/* Get Started Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/login?redirectTo=/dashboard"
            style={{
              background: '#ffffff',
              color: '#000000',
              padding: '10px 24px',
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(255,255,255,0.2)',
            }}
          >
            Get Started →
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            className="mobile-only"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#050505',
          zIndex: 99,
          padding: '100px 32px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 24, fontWeight: 700 }}>
            <a href="#problem" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>Problem</a>
            <a href="#intelligence" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>Intelligence Layer</a>
            <a href="#autopilot" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>Ad Spend Autopilot</a>
            <a href="#human-control" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>Human Control</a>
            <a href="#rocketride" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>RocketRide Engine</a>
          </div>

          <Link
            href="/login?redirectTo=/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: '#ffffff',
              color: '#000000',
              padding: '16px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 800,
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            Enter HookLabs Dashboard
          </Link>
        </div>
      )}

      {/* ── 1. CINEMATIC HERO VIEWPORT ────────────────────────────── */}
      <section style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
      }}>
        {/* Full-Bleed CloudFront Portal Video */}
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${heroScale})`,
          opacity: heroOpacity,
          transition: 'transform 0.1s linear, opacity 0.1s linear',
          willChange: 'transform, opacity',
        }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.65) contrast(1.1)',
            }}
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4"
              type="video/mp4"
            />
          </video>
          {/* Radial Dark Vignette Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.95) 80%, #050505 100%)',
          }} />
        </div>

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: 900,
          padding: '0 24px',
          transform: `translateY(${heroY}px)`,
          opacity: heroOpacity,
          transition: 'transform 0.1s linear, opacity 0.1s linear',
        }}>
          {/* Top System Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20,
            padding: '6px 16px',
            marginBottom: 32,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#a78bfa',
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} className="animate-pulse" />
            THE NEXT LAYER OF INTELLIGENCE
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(44px, 7vw, 84px)',
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            margin: '0 0 24px 0',
            fontFamily: 'var(--font-display, sans-serif)',
          }}>
            THE NEXT LAYER<br />OF INTELLIGENCE
          </h1>

          {/* Supporting Copy */}
          <p style={{
            fontSize: 'clamp(16px, 2vw, 22px)',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 680,
            margin: '0 auto 40px',
            lineHeight: 1.6,
            fontWeight: 300,
          }}>
            A unified intelligence system that helps teams analyze, create, optimize, and scale campaigns.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
            <Link
              href="/login?redirectTo=/dashboard"
              style={{
                background: '#ffffff',
                color: '#000000',
                padding: '16px 36px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(255,255,255,0.3)',
                transition: 'transform 0.2s',
              }}
            >
              Get Started
            </Link>

            <a
              href="#autopilot"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '16px 36px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
              }}
            >
              View Architecture
            </a>
          </div>

          {/* Partner & Integration Logos */}
          <div style={{ opacity: 0.6, fontSize: 12, letterSpacing: '0.1em', fontFamily: 'var(--font-mono, monospace)', color: 'rgba(255,255,255,0.5)' }}>
            POWERED BY ROCKETRIDE MULTI-AGENT PIPELINES · META · GOOGLE ADS · TIKTOK · SUPABASE
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', opacity: heroOpacity }}>
          <ChevronDown size={28} className="animate-bounce" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </div>
      </section>

      {/* ── 2. SECTION 2 — THE PROBLEM ────────────────────────────── */}
      <section id="problem" style={{ padding: '160px 24px', background: '#050505', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#f87171', fontFamily: 'var(--font-mono, monospace)' }}>
            THE PROBLEM
          </span>

          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, margin: '24px 0 32px 0', lineHeight: 1.15 }}>
            Advertising systems generate enormous amounts of data.
          </h2>

          <p style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontWeight: 300 }}>
            But most marketing teams still spend their days watching dashboards, searching for underperforming ads, manually writing copy, testing variations, and guessing where to move budget.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48, flexWrap: 'wrap' }}>
            {['Watch Dashboards', 'Find Anomalies', 'Write Creatives', 'Test Variations', 'Move Budgets', 'Repeat'].map((item, idx) => (
              <span key={item} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 20px',
                borderRadius: 20,
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'var(--font-mono, monospace)',
              }}>
                0{idx + 1}. {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SECTION 3 — THE INTELLIGENCE LAYER (TEXTPRESSURE) ─────── */}
      <section id="intelligence" style={{ padding: '140px 24px', background: '#08080c', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#a78bfa', fontFamily: 'var(--font-mono, monospace)', display: 'block', marginBottom: 16 }}>
            THE INTELLIGENCE LAYER
          </span>

          {/* TextPressure Component */}
          <div style={{ margin: '32px 0 48px' }}>
            <TextPressure
              text="THE SYSTEM LEARNS WHAT WORKS."
              textColor="#FFFFFF"
              width={true}
              weight={true}
              italic={true}
            />
          </div>

          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', maxWidth: 720, margin: '0 auto 64px', lineHeight: 1.6 }}>
            HookLabs connects campaign performance, creative intelligence, generation, evaluation, and optimization into one continuous loop.
          </p>

          {/* Interactive Intelligence Loop Diagram */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 12,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 24,
          }}>
            {[
              { label: 'ANALYZE', icon: BarChart3, color: '#60a5fa' },
              { label: 'REMEMBER', icon: Brain, color: '#a78bfa' },
              { label: 'CREATE', icon: Sparkles, color: '#f472b6' },
              { label: 'EVALUATE', icon: CheckCircle2, color: '#34d399' },
              { label: 'OPTIMIZE', icon: TrendingUp, color: '#fbbf24' },
              { label: 'LEARN', icon: RotateCcw, color: '#38bdf8' },
            ].map((node) => (
              <div key={node.label} style={{ textAlign: 'center', padding: 16 }}>
                <node.icon size={28} style={{ color: node.color, marginBottom: 12 }} />
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'var(--font-mono, monospace)' }}>
                  {node.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. SECTION 4 — MEET THE AD SPEND AUTOPILOT ──────────────── */}
      <section id="autopilot" style={{ padding: '160px 24px', background: '#050505', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#7c5cfc', fontFamily: 'var(--font-mono, monospace)' }}>
              AUTONOMOUS CREATIVE ENGINE
            </span>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, margin: '16px 0' }}>
              MEET THE AD SPEND AUTOPILOT.
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 650, margin: '0 auto' }}>
              HookLabs continuously analyzes campaign performance, identifies what is changing, and determines what should happen next.
            </p>
          </div>

          {/* Autopilot Story Steps */}
          <div id="autopilot-story" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            {/* Story Text List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {[
                { step: '01', title: 'ANALYZE', desc: 'Campaign performance metrics are ingested across Meta, Google, and TikTok.' },
                { step: '02', title: 'IDENTIFY', desc: 'RocketRide Performance Agent flags underperforming creatives in real time.' },
                { step: '03', title: 'LEARN', desc: 'Creative Memory retrieves historical winning hooks and format patterns.' },
                { step: '04', title: 'CREATE', desc: 'Copywriter & Strategy agents synthesize new multi-variant concepts.' },
                { step: '05', title: 'EVALUATE', desc: 'Critic and Brand Safety agents score retention and compliance.' },
                { step: '06', title: 'OPTIMIZE', desc: 'Autonomous system evaluates spend changes and enforces risk thresholds.' },
              ].map((s, i) => (
                <div
                  key={s.step}
                  style={{
                    padding: 24,
                    borderRadius: 12,
                    background: activeStep === i ? 'rgba(124,92,252,0.12)' : 'transparent',
                    borderLeft: `4px solid ${activeStep === i ? '#7c5cfc' : 'rgba(255,255,255,0.1)'}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono, monospace)', color: activeStep === i ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                    STEP {s.step}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 8px 0' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Product UI Preview Component */}
            <div style={{
              background: '#0d0d12',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding: 32,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              position: 'sticky',
              top: 120,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono, monospace)', color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>
                    AUTOPILOT EXECUTION MONITOR
                  </span>
                </div>
                <span style={{ background: 'rgba(124,92,252,0.2)', color: '#a78bfa', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                  LIVE PREVIEW
                </span>
              </div>

              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 20 }}>
                Campaign: <strong>Summer Sale (Meta Ads)</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>CURRENT ROAS</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399' }}>4.41x</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>DAILY BUDGET</div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>$50,000</div>
                </div>
              </div>

              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', padding: 16, borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#f87171', fontWeight: 800, marginBottom: 4 }}>UNDERPERFORMER DETECTED</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Static Product Catalog Image (ROAS 0.95x)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. SECTION 5 — CREATIVE INTELLIGENCE ──────────────────── */}
      <section style={{ padding: '140px 24px', background: '#08080c', position: 'relative' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#a78bfa', fontFamily: 'var(--font-mono, monospace)' }}>
            COMPOUNDING MEMORY MATRIX
          </span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, margin: '16px 0 48px 0' }}>
            CREATIVITY THAT REMEMBERS.
          </h2>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(124,92,252,0.3)',
            borderRadius: 20,
            padding: 36,
            textAlign: 'left',
            maxWidth: 700,
            margin: '0 auto 40px',
            boxShadow: '0 10px 40px rgba(124,92,252,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: '#a78bfa', fontWeight: 700 }}>
                WINNING CREATIVE PATTERN
              </span>
              <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>
                Used in next recommendation ✓
              </span>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.3 }}>
              "Stop spending $5k/mo on video editors when AI writes & renders hooks in 30s"
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.7)', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div>Audience: <strong>Founders</strong></div>
              <div>Platform: <strong>Meta</strong></div>
              <div>Format: <strong>Problem-Solution</strong></div>
              <div>CTR Lift: <strong style={{ color: '#34d399' }}>+2.8x</strong></div>
            </div>
          </div>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto' }}>
            HookLabs doesn't treat every campaign as a blank slate. What works becomes intelligence for what comes next.
          </p>
        </div>
      </section>

      {/* ── 6. SECTION 6 — MULTI-AGENT INTELLIGENCE ──────────────── */}
      <section style={{ padding: '140px 24px', background: '#050505', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)' }}>
            SPECIALIST AI AGENTS
          </span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, margin: '16px 0 64px 0' }}>
            ONE SYSTEM. MANY SPECIALISTS.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
            {[
              'PERFORMANCE', 'AUDIENCE', 'STRATEGY', 'COPYWRITER', 'CRITIC', 'BRAND SAFETY', 'DECISION'
            ].map((agent, i) => (
              <div key={agent} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: 16,
                fontSize: 11,
                fontWeight: 800,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#38bdf8',
              }}>
                <Cpu size={20} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                {agent}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. SECTION 7 — HUMAN CONTROL HERO MOMENT ──────────────── */}
      <section id="human-control" style={{ padding: '160px 24px', background: 'linear-gradient(180deg, #050505 0%, #0d0814 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#f87171', fontFamily: 'var(--font-mono, monospace)' }}>
            HUMAN RISK GATE
          </span>

          <h2 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 900, margin: '16px 0 24px 0', lineHeight: 1.05 }}>
            AUTONOMOUS.<br />UNTIL IT MATTERS.
          </h2>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 48px' }}>
            Any proposed budget increase exceeding $100 or 20% delta automatically triggers a Human Approval Gate before spend is changed.
          </p>

          {/* Hero Risk Gate Card */}
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '2px solid #f87171',
            borderRadius: 20,
            padding: 40,
            boxShadow: '0 0 50px rgba(248,113,113,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#f87171', fontWeight: 800, fontSize: 14, marginBottom: 16 }}>
              <ShieldAlert size={24} /> HIGH RISK ACTION — HUMAN APPROVAL REQUIRED
            </div>

            <div style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, margin: '0 0 16px 0' }}>
              $50,000 → $65,000 <span style={{ color: '#34d399', fontSize: '0.7em' }}>(+30%)</span>
            </div>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto 24px' }}>
              RocketRide Optimization Agent detected high-performing Founder UGC hook. Budget change exceeds safety threshold.
            </p>

            <Link
              href="/login?redirectTo=/approval"
              style={{
                background: '#f87171',
                color: '#000000',
                padding: '14px 32px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              [ APPROVE ACTION ]
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. SECTION 8 — CLOSED LOOP LEARNING ───────────────────── */}
      <section style={{ padding: '140px 24px', background: '#050505', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#34d399', fontFamily: 'var(--font-mono, monospace)' }}>
            CLOSED-LOOP LEARNING
          </span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, margin: '16px 0 32px 0' }}>
            EVERY RESULT BECOMES MEMORY.
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, fontSize: 36, fontWeight: 900, margin: '0 0 24px 0' }}>
            <span>4.41x</span>
            <ArrowRight size={32} style={{ color: '#34d399' }} />
            <span style={{ color: '#34d399' }}>4.82x ROAS</span>
          </div>

          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 12 }}>
            DEMO SIMULATION
          </span>
        </div>
      </section>

      {/* ── 9. SECTION 9 — ROCKETRIDE ORCHESTRATION ENGINE ─────────── */}
      <section id="rocketride" style={{ padding: '140px 24px', background: '#08080c', textAlign: 'center' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#a78bfa', fontFamily: 'var(--font-mono, monospace)' }}>
            ROCKETRIDE ORCHESTRATION ENGINE
          </span>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, margin: '16px 0 24px 0' }}>
            THE ENGINE BEHIND THE AUTOPILOT.
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 650, margin: '0 auto 48px' }}>
            RocketRide orchestrates the multi-agent workflows (.pipe files) that power HookLabs' autonomous decision loop.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>
            {['campaign_analysis.pipe', 'creative_intelligence.pipe', 'creative_generation.pipe', 'creative_evaluation.pipe', 'campaign_optimization.pipe'].map((p) => (
              <span key={p} style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', color: '#a78bfa', padding: '8px 16px', borderRadius: 8 }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CTA VIEWPORT ────────────────────────────────── */}
      <section style={{ padding: '160px 24px', background: '#000000', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 32px 0', fontFamily: 'var(--font-display, sans-serif)' }}>
            BUILD THE NEXT<br />CAMPAIGN THAT THINKS.
          </h2>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/login?redirectTo=/dashboard"
              style={{
                background: '#ffffff',
                color: '#000000',
                padding: '18px 44px',
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 30px rgba(255,255,255,0.3)',
              }}
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 48px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono, monospace)' }}>
        © 2026 HookLabs AI Inc. All rights reserved. RocketRide Buildathon Hackathon Edition.
      </footer>

      {/* Global Responsive Styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
