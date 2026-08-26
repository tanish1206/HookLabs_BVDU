# HookLabs AI — Antigravity Prompt
## Auth Gate + Working Claude API Integration
## Deployed site: https://hook-labs.vercel.app/

You are working on a live Next.js 14 (App Router) project deployed at
https://hook-labs.vercel.app/

The codebase is already deployed. Your job is to make three things happen:

1. Add compulsory Supabase Auth — users must sign in before accessing 
   the Pipeline, A/B Test, History, and Feedback Loop pages. 
   Landing page (/), Gallery (/gallery), and Features section 
   remain fully public.

2. Wire the Claude claude-sonnet-4-5 API key into the generate-script 
   API route so script generation actually works end-to-end.

3. Ensure all the moving pieces (auth middleware, protected routes, 
   API key injection, redirect flows) work together on the 
   live Vercel deployment.

════════════════════════════════════════════════════════════════
SECTION 1: ENVIRONMENT VARIABLES
Add these to Vercel → Project Settings → Environment Variables.
Scope all of them to Production + Preview + Development.
════════════════════════════════════════════════════════════════

ANTHROPIC_API_KEY=<the claude-sonnet-4-5 key Tanish has provided>
  ← This is a server-only variable. No NEXT_PUBLIC_ prefix.
  ← Used only in app/api/generate-script/route.ts
  ← Never expose this to the browser under any circumstance.

NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>
NEXT_PUBLIC_APP_URL=https://hook-labs.vercel.app

After adding env vars in Vercel dashboard, trigger a redeploy.

════════════════════════════════════════════════════════════════
SECTION 2: SUPABASE AUTH SETUP
Run these in Supabase Dashboard → Authentication → Settings
════════════════════════════════════════════════════════════════

Site URL:
  https://hook-labs.vercel.app

Redirect URLs (add all of these):
  https://hook-labs.vercel.app/auth/callback
  https://hook-labs.vercel.app/dashboard
  http://localhost:3000/auth/callback
  http://localhost:3000/dashboard

Enable these auth providers in Supabase Dashboard → Auth → Providers:
  ✓ Email (enabled by default) — Email + Password
  ✓ Google OAuth (optional but recommended for UX)
    → Add Google Client ID + Secret from Google Cloud Console
    → Callback URL: https://hook-labs.vercel.app/auth/callback

Disable "Confirm email" for now (makes testing faster):
  Supabase → Auth → Settings → Email → "Enable email confirmations" → OFF
  (Re-enable before public launch)

════════════════════════════════════════════════════════════════
SECTION 3: FILES TO CREATE / MODIFY
Work through these in exact order.
════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
3.1  INSTALL DEPENDENCIES
──────────────────────────────────────────────────────────────

Run in the project root:

  npm install @supabase/supabase-js @supabase/ssr

These are the only new dependencies needed.
Do not install @supabase/auth-helpers-nextjs — it is deprecated.
Use @supabase/ssr exclusively.

──────────────────────────────────────────────────────────────
3.2  lib/supabase/client.ts  (browser client)
──────────────────────────────────────────────────────────────

'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

──────────────────────────────────────────────────────────────
3.3  lib/supabase/server.ts  (server client for API routes + 
     Server Components)
──────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

──────────────────────────────────────────────────────────────
3.4  middleware.ts  (ROOT of project, same level as app/)
──────────────────────────────────────────────────────────────

This is the most critical file. It runs on every request and
enforces the auth gate.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that are ALWAYS public — no auth required
const PUBLIC_ROUTES = [
  '/',                    // landing page
  '/gallery',             // public gallery
  '/pricing',             // pricing page
  '/login',               // auth pages
  '/signup',
  '/auth/callback',       // OAuth callback
  '/auth/confirm',        // email confirmation
]

// Routes that start with these prefixes are also public
const PUBLIC_PREFIXES = [
  '/_next/',              // Next.js internals
  '/api/trends',          // public trends endpoint (no auth)
  '/api/gallery',         // public gallery endpoint
  '/api/webhook',         // webhook (has its own secret)
  '/favicon',
  '/images/',
  '/fonts/',
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — MUST be called before any auth checks
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Check if this is a public route
  const isPublicRoute = 
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))

  // If not public and not authenticated → redirect to /login
  if (!isPublicRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    // Preserve the intended destination so we can redirect after login
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access /login or /signup → 
  // redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes EXCEPT Next.js static files and image optimization
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

──────────────────────────────────────────────────────────────
3.5  app/auth/callback/route.ts  (OAuth + magic link handler)
──────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

──────────────────────────────────────────────────────────────
3.6  app/login/page.tsx  — Sign In page
──────────────────────────────────────────────────────────────

Build this page matching the HookLabs dark theme exactly:
  bg: #0A0A0F, accent: #7C5CFC, fonts: Syne + DM Sans

Layout: centered card, max-width 420px, on the dark grid background.

Content:
  - Logo mark (H in purple square) + "HookLabs AI" in Syne 700
  - Headline: "Sign in to start creating" (Syne 700, 28px)
  - Subtext: "Generate viral scripts, voiceovers and videos 
    automatically." (DM Sans, --muted)
  - [divider]
  - Google OAuth button (if enabled):
    Full-width, white bg, Google icon, "Continue with Google"
    onClick: supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  - [divider: "or continue with email"]
  - Email input (styled, dark surface)
  - Password input (with show/hide toggle)
  - "Sign in" primary button (full-width, accent purple)
    onClick: supabase.auth.signInWithPassword({ email, password })
    Handle errors: show inline error message below the button
  - "Don't have an account? Sign up →" link → /signup
  - "Forgot password?" link → /auth/reset-password

Error states to handle:
  - Invalid credentials: "Incorrect email or password."
  - Email not confirmed: "Please check your email to confirm 
    your account."
  - Generic: "Something went wrong. Please try again."

Success: router.push(redirectTo ?? '/dashboard')
  Read redirectTo from searchParams (set by middleware).

Loading state: button shows spinner, inputs disabled.

Full implementation using 'use client' + createClient() from 
lib/supabase/client.ts + useRouter from next/navigation.

──────────────────────────────────────────────────────────────
3.7  app/signup/page.tsx  — Sign Up page
──────────────────────────────────────────────────────────────

Same dark theme as login page.

Content:
  - Logo mark + "HookLabs AI"
  - Headline: "Create your account" (Syne 700, 28px)
  - Subtext: "Start with 3 free videos per month. No credit card."
  - Google OAuth button (same as login)
  - [divider]
  - Full name input
  - Email input
  - Password input (min 8 chars, show strength indicator)
  - Confirm password input
  - "Create account" primary button
    onClick: 
      1. Validate passwords match, length >= 8
      2. supabase.auth.signUp({ 
           email, 
           password,
           options: { 
             data: { full_name: name },
             emailRedirectTo: `${window.location.origin}/auth/callback`
           }
         })
      3. If confirmations are off → redirect to /dashboard
      4. If confirmations are on → show "Check your email!" message
  - "Already have an account? Sign in →" link → /login
  - Terms line: "By signing up you agree to our Terms and Privacy Policy"
    (DM Mono 10px, --muted2)

Error states:
  - Email already registered: "An account with this email already exists."
  - Password too weak: "Password must be at least 8 characters."
  - Passwords don't match: "Passwords do not match."

──────────────────────────────────────────────────────────────
3.8  app/auth/reset-password/page.tsx
──────────────────────────────────────────────────────────────

Simple page. Email input + "Send reset link" button.
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/update-password`
})
On success: show "Check your inbox." message.

──────────────────────────────────────────────────────────────
3.9  app/dashboard/page.tsx  — Protected main app page
──────────────────────────────────────────────────────────────

This is a Server Component. Get the user session server-side.

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  // Render the full pipeline UI (TrendSelector → ScriptPanel → 
  // VoiceoverPanel → VideoPreview) as a Client Component child
  return <DashboardClient user={user} />
}

DashboardClient ('use client') renders:
  - Left sidebar with nav (Pipeline, A/B Test, History, Feedback Loop)
  - User avatar + email + plan badge in sidebar bottom
  - Sign out button: supabase.auth.signOut() then router.push('/')
  - Main content area with the pipeline tabs from the existing codebase
  - The 4 stat cards (videos this month, avg hook score, etc.)

──────────────────────────────────────────────────────────────
3.10  app/api/generate-script/route.ts  ← THE CRITICAL ONE
──────────────────────────────────────────────────────────────

This is where the Claude claude-sonnet-4-5 key actually gets used.
Build it exactly like this:

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client with the server-side API key
// ANTHROPIC_API_KEY env var — set in Vercel, never in browser
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  // ── 1. Auth check ──────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'You must be signed in to generate scripts.' },
      { status: 401 }
    )
  }

  // ── 2. Parse request body ──────────────────────────────────
  let body: { trend: string; format: string; tone: string; duration: string }
  
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  const { trend, format, tone, duration } = body

  if (!trend || !format || !tone || !duration) {
    return NextResponse.json(
      { error: 'missing_fields', message: 'trend, format, tone, and duration are required.' },
      { status: 400 }
    )
  }

  // ── 3. Quota check ─────────────────────────────────────────
  // Check if user has remaining generations for their plan.
  // Free plan = 3/month, Pro = unlimited.
  // If you have the quota DB function set up:
  //
  // const { data: quota } = await supabase.rpc('check_generation_quota', {
  //   p_user_id: user.id
  // })
  // if (quota && !quota.allowed) {
  //   return NextResponse.json({
  //     error: 'quota_exceeded',
  //     message: `You've used all ${quota.limit} free generations this month.`,
  //     used: quota.used,
  //     limit: quota.limit,
  //     plan: quota.plan,
  //   }, { status: 402 })
  // }
  //
  // NOTE: If Supabase is not set up yet, comment out the quota 
  // check above and it will skip it. The API key will still work.

  // ── 4. Build the Claude prompt ─────────────────────────────
  const prompt = `You are a viral short-form video script writer for ${format}.

Topic: "${trend}"
Tone: ${tone}
Duration: ${duration}

Generate 3 hook variations (Hook A, Hook B, Hook C) for this topic.
Each variation starts with a powerful hook designed to stop scrolling 
in the first 2 seconds, followed by a tight script body, and a CTA.

Respond ONLY with valid JSON — no markdown, no backticks, no preamble:
{
  "hooks": [
    {
      "label": "Hook A",
      "style": "Question",
      "hook_line": "...",
      "body": "...",
      "cta": "...",
      "word_count": 80,
      "tone_tag": "punchy"
    },
    {
      "label": "Hook B",
      "style": "Shocking Stat",
      "hook_line": "...",
      "body": "...",
      "cta": "...",
      "word_count": 75,
      "tone_tag": "viral"
    },
    {
      "label": "Hook C",
      "style": "Contrarian",
      "hook_line": "...",
      "body": "...",
      "cta": "...",
      "word_count": 85,
      "tone_tag": "educational"
    }
  ],
  "topic": "${trend}",
  "hook_score": 87,
  "est_ctr": "7.2%",
  "retention": "68%",
  "viral_score": 82
}

Keep each script under 100 words total. Optimize for genuine virality.`

  // ── 5. Call Claude claude-sonnet-4-5 ──────────────────────────────────
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ],
    })

    // Extract text content
    const rawText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    // Strip any accidental markdown fences
    const cleanText = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Parse JSON
    let parsed
    try {
      parsed = JSON.parse(cleanText)
    } catch {
      console.error('[generate-script] JSON parse failed:', cleanText.slice(0, 200))
      return NextResponse.json(
        { error: 'parse_error', message: 'AI response was not valid JSON. Please try again.' },
        { status: 500 }
      )
    }

    // Validate shape
    if (!parsed.hooks || !Array.isArray(parsed.hooks) || parsed.hooks.length === 0) {
      return NextResponse.json(
        { error: 'invalid_response', message: 'AI returned an unexpected format. Please try again.' },
        { status: 500 }
      )
    }

    // ── 6. Increment quota (if Supabase is set up) ──────────
    // await supabase.rpc('increment_quota', {
    //   p_user_id: user.id,
    //   p_field: 'generations'
    // })

    // ── 7. Return the result ────────────────────────────────
    return NextResponse.json(parsed, { status: 200 })

  } catch (claudeError: any) {
    console.error('[generate-script] Claude API error:', claudeError)

    // Differentiate error types for better UX
    if (claudeError?.status === 401) {
      return NextResponse.json(
        { error: 'api_key_invalid', message: 'API key configuration error.' },
        { status: 500 }
      )
    }
    if (claudeError?.status === 429) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'AI service is busy. Please try again in a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'ai_error', message: 'Failed to generate script. Please try again.' },
      { status: 500 }
    )
  }
}

ALSO install the Anthropic SDK if not already installed:
  npm install @anthropic-ai/sdk

──────────────────────────────────────────────────────────────
3.11  UPDATE src/hooks/useScriptGeneration.js
──────────────────────────────────────────────────────────────

The existing hook calls the Anthropic API directly from the browser 
(using fetch to api.anthropic.com). Replace it with a call to 
your own API route instead.

FIND this section in useScriptGeneration.js:
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    ...

REPLACE the entire generate function body with:

  const generate = useCallback(async ({ trend, format, tone, duration }) => {
    if (!trend) return

    setState({ status: 'loading', scripts: [], metrics: null, error: null })

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend, format, tone, duration }),
      })

      if (response.status === 401) {
        setState({
          status: 'error',
          scripts: [],
          metrics: null,
          error: 'You must be signed in to generate scripts.',
        })
        return
      }

      if (response.status === 402) {
        const data = await response.json()
        setState({
          status: 'error',
          scripts: [],
          metrics: null,
          error: `quota_exceeded:${data.used}:${data.limit}:${data.plan}`,
        })
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || `Server error ${response.status}`)
      }

      const result = await response.json()

      setState({
        status: 'success',
        scripts: result.hooks || [],
        metrics: {
          hook_score:  result.hook_score,
          est_ctr:     result.est_ctr,
          retention:   result.retention,
          viral_score: result.viral_score,
        },
        error: null,
      })

    } catch (err) {
      setState({
        status: 'error',
        scripts: [],
        metrics: null,
        error: err.message,
      })
    }
  }, [])

──────────────────────────────────────────────────────────────
3.12  UPDATE app/layout.tsx  — Add auth session provider
──────────────────────────────────────────────────────────────

Wrap the app in a Supabase session context so client components 
can access the session without extra fetch calls.

Create components/providers/SupabaseProvider.tsx:

'use client'
import { createBrowserClient } from '@supabase/ssr'
import { createContext, useContext, useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'

const AuthContext = createContext<{
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}>({ user: null, session: null, loading: true, signOut: async () => {} })

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

Then in app/layout.tsx, wrap children:
  import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
  ...
  <body>
    <SupabaseProvider>
      {children}
    </SupabaseProvider>
  </body>

──────────────────────────────────────────────────────────────
3.13  UPDATE the landing page navbar ( app/(marketing)/layout.tsx 
      OR components/Header.jsx )
──────────────────────────────────────────────────────────────

The landing page nav currently has static "Sign in" and 
"Start free →" buttons. Make them functional:

'use client'
import { useAuth } from '@/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'

In the Header component:
  const { user, loading } = useAuth()
  const router = useRouter()

  Replace static buttons with:
  
  {loading ? (
    <div style={{ width: 140, height: 36 }} /> // skeleton placeholder
  ) : user ? (
    // User is logged in → show dashboard link
    <button onClick={() => router.push('/dashboard')}>
      Go to Dashboard →
    </button>
  ) : (
    // User is logged out → show auth buttons
    <>
      <button onClick={() => router.push('/login')}>Sign in</button>
      <button onClick={() => router.push('/signup')}>Start free →</button>
    </>
  )}

──────────────────────────────────────────────────────────────
3.14  UPDATE the Hero CTA buttons on the landing page
──────────────────────────────────────────────────────────────

The "Start generating free →" CTA should:
  - If user is logged in: router.push('/dashboard')
  - If user is logged out: router.push('/signup')

Same logic for "Watch 60s demo" — keep it as-is (static scroll 
to the how-it-works section or a modal).

──────────────────────────────────────────────────────────────
3.15  Protected route components  (optional but clean)
──────────────────────────────────────────────────────────────

Create components/auth/RequireAuth.tsx:
A wrapper component that checks auth client-side and shows a 
"redirecting..." state while the middleware redirect happens.
Use this on any page that should show a loading state instead 
of a flash of content.

'use client'
import { useAuth } from '@/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8B89A8',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 14,
      }}>
        Loading...
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}

════════════════════════════════════════════════════════════════
SECTION 4: ROUTE STRUCTURE AFTER CHANGES
════════════════════════════════════════════════════════════════

PUBLIC (no auth needed):
  /                     → Landing page (full, with hero/features/pricing)
  /gallery              → Public video gallery
  /pricing              → Pricing page
  /login                → Sign in page
  /signup               → Sign up page
  /auth/callback        → OAuth + magic link handler
  /auth/reset-password  → Password reset
  /api/trends           → Public trends API (feeds TrendSelector on landing)
  /api/gallery          → Public gallery API

PROTECTED (auth required, middleware redirects to /login):
  /dashboard            → Main app (pipeline tabs: Pipeline/A-B Test/History/Feedback)
  /api/generate-script  → Claude script generation (401 if no session)
  /api/save-video       → Save generated video (401 if no session)
  /api/feedback         → Feedback loop (401 if no session)
  /api/feedback/analyze → AI improvement recommendations (401 if no session)

════════════════════════════════════════════════════════════════
SECTION 5: TESTING CHECKLIST
Run through all of these after deploying.
════════════════════════════════════════════════════════════════

AUTH FLOW:
  □ Visit https://hook-labs.vercel.app/ — loads without redirect
  □ Visit https://hook-labs.vercel.app/gallery — loads without redirect
  □ Visit https://hook-labs.vercel.app/dashboard — redirects to /login
  □ Visit https://hook-labs.vercel.app/dashboard — redirectTo param preserved
  □ Sign up with email → lands on /dashboard
  □ Sign out → redirected to /
  □ Sign in again → redirected to /dashboard
  □ Visit /login while logged in → redirected to /dashboard
  □ Visit /signup while logged in → redirected to /dashboard

SCRIPT GENERATION:
  □ Log in
  □ Go to /dashboard → Pipeline tab is visible
  □ Select a trend (or type custom)
  □ Click "Generate Script"
  □ Request goes to /api/generate-script (check Network tab)
  □ Response comes back with hooks array (not an error)
  □ Hook A, Hook B, Hook C appear in the ScriptPanel
  □ Selecting a hook and clicking Continue → moves to Voiceover step
  □ Check Vercel logs for any errors in the generate-script function

API KEY VERIFICATION:
  □ In Vercel → Project → Functions → generate-script logs
    should show successful Claude API calls
  □ No "ANTHROPIC_API_KEY is missing" errors in logs
  □ Response has valid hooks with hook_line, body, cta fields

PROTECTED API ROUTES:
  □ curl -X POST https://hook-labs.vercel.app/api/generate-script
    -H "Content-Type: application/json" 
    -d '{"trend":"AI","format":"YouTube Short","tone":"Punchy","duration":"30s"}'
    → Should return 401 Unauthorized (no session cookie)

════════════════════════════════════════════════════════════════
SECTION 6: COMMON ISSUES + FIXES
════════════════════════════════════════════════════════════════

ISSUE: "NEXT_PUBLIC_SUPABASE_URL is not defined"
  FIX: Ensure env vars are set in Vercel AND the project has 
       been redeployed after adding them. Vercel requires a 
       new deployment to pick up new env vars.

ISSUE: Auth redirect loops (keeps bouncing between /login and /dashboard)
  FIX: Check that the middleware matcher regex correctly excludes 
       _next/static files. The matcher in section 3.4 is correct.
       Also verify the Supabase site URL and redirect URLs are 
       set correctly in the Supabase dashboard.

ISSUE: "cookies() should be awaited" error in Next.js 15
  FIX: The server.ts uses `await cookies()` — make sure this is 
       in place. Next.js 15 made cookies() async.

ISSUE: Claude API returns 401
  FIX: Verify ANTHROPIC_API_KEY is set in Vercel environment 
       variables (not NEXT_PUBLIC_ANTHROPIC_API_KEY). 
       The key should NOT have the NEXT_PUBLIC_ prefix.
       After adding it in Vercel, redeploy.

ISSUE: Google OAuth redirect_uri_mismatch
  FIX: In Supabase Dashboard → Auth → Providers → Google,
       copy the callback URL shown there and add it to 
       your Google Cloud Console → Credentials → OAuth 2.0 
       → Authorized redirect URIs.

ISSUE: Script generation works locally but 500s on Vercel
  FIX: Check Vercel Function logs. The most common cause is 
       a missing env var (ANTHROPIC_API_KEY not set in Vercel).
       Also verify `npm install @anthropic-ai/sdk` was run 
       and the package is in package.json dependencies.

ISSUE: Middleware runs on API routes and breaks them
  FIX: Ensure PUBLIC_PREFIXES in middleware.ts includes 
       '/api/trends' and '/api/gallery'. Other /api/* routes 
       should require auth — the 401 response from the route 
       handler itself is the correct behavior, not a redirect.

════════════════════════════════════════════════════════════════
SECTION 7: VERCEL DEPLOYMENT STEPS
════════════════════════════════════════════════════════════════

After making all code changes:

1. Push to main branch (Vercel auto-deploys)
   OR manually trigger: Vercel Dashboard → Deployments → Redeploy

2. In Vercel → Project → Settings → Environment Variables, 
   confirm these are all set:
   ✓ ANTHROPIC_API_KEY
   ✓ NEXT_PUBLIC_SUPABASE_URL
   ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
   ✓ SUPABASE_SERVICE_ROLE_KEY
   ✓ NEXT_PUBLIC_APP_URL = https://hook-labs.vercel.app

3. After adding env vars, trigger a fresh deployment 
   (env vars only take effect on new deployments).

4. Check the Vercel Function logs after your first 
   generate-script call to confirm Claude is responding.

════════════════════════════════════════════════════════════════
SECTION 8: WHAT STAYS EXACTLY THE SAME
(Do not touch these — they already work)
════════════════════════════════════════════════════════════════

- The entire landing page UI and animations
- All React components in src/components/
- The PipelineBar, TrendSelector, ScriptPanel, VoiceoverPanel, 
  VideoPreview, AbTestPanel, FeedbackDashboard, VideoHistoryPanel
- All CSS variables and the dark theme
- The Gallery page layout
- The Pricing page layout
- src/utils/helpers.js and src/utils/storage.js logic
- The Python trends ingest script (runs separately)
- The Supabase migrations (already run)

The ONLY things changing are:
  1. middleware.ts (new file — auth gate)
  2. lib/supabase/ client files (new files)
  3. app/login/page.tsx (new file)
  4. app/signup/page.tsx (new file)
  5. app/auth/callback/route.ts (new file)
  6. app/api/generate-script/route.ts (modified — adds Claude key)
  7. src/hooks/useScriptGeneration.js (modified — calls /api/generate-script)
  8. app/layout.tsx (modified — adds SupabaseProvider)
  9. components/Header.jsx (modified — auth-aware buttons)
  10. package.json (adds @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk)

════════════════════════════════════════════════════════════════
END OF PROMPT
Paste the full codebase from https://hook-labs.vercel.app/ 
below this line when giving to Antigravity.
════════════════════════════════════════════════════════════════
