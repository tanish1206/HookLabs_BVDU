import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CURATED_BY_CATEGORY: Record<string, string[]> = {
  ai: [
    '3129977', // futuristic technology abstract
    '3141208', // data visualization neon
    '4065975', // robot hands typing
    '3153198', // holographic interface
    '4254169', // circuit board close-up
  ],
  crypto: [
    '3785927', // bitcoin gold coins
    '4034855', // trading charts glow
    '3782037', // financial data screens
  ],
  tech: [
    '1851190', // laptop coding neon
    '3754435', // smartphone in hand
    '4488249', // server room lights
  ],
  science: [
    '3573563', // laboratory microscope
    '4145353', // space galaxy
    '5319965', // DNA helix animation
  ],
  finance: [
    '3943975', // stock market charts
    '4547545', // city financial district
    '3752931', // business professional
  ],
  lifestyle: [
    '856110',  // city timelapse vertical
    '4809009', // morning routine aesthetic
    '4124348', // coffee shop atmosphere
  ],
  default: ['1851190', '856110', '3129977', '4065975', '3141208'],
}

const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  ai:        'artificial intelligence technology',
  crypto:    'cryptocurrency bitcoin finance',
  tech:      'technology digital innovation',
  science:   'science laboratory research',
  finance:   'business finance economy',
  lifestyle: 'lifestyle modern city',
  news:      'breaking news media journalism',
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')?.toLowerCase() || 'default'

  const ids = CURATED_BY_CATEGORY[category] || CURATED_BY_CATEGORY.default
  const searchTerm = CATEGORY_SEARCH_TERMS[category] || CATEGORY_SEARCH_TERMS.ai

  return NextResponse.json({ ids, search_term: searchTerm, category })
}
