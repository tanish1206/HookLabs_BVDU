import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { TTS_QUOTA } from '@/lib/quotaConfig'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const month = new Date().toISOString().slice(0, 7)  // 'YYYY-MM'
  
  // Use admin client to bypass RLS for global stats
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Global budget
  const { data: global } = await adminSupabase
    .from('tts_global_budget')
    .select('total_chars, budget_chars, is_exhausted')
    .eq('month', month)
    .single()

  // User usage
  const { data: userUsage } = await adminSupabase
    .from('tts_usage')
    .select('chars_used')
    .eq('user_id', user.id)
    .eq('month', month)

  const userTotal = userUsage?.reduce((s: number, r: any) => s + r.chars_used, 0) || 0

  return NextResponse.json({
    month,
    global: {
      used:        global?.total_chars   || 0,
      budget:      global?.budget_chars  || TTS_QUOTA.GLOBAL_MONTHLY_BUDGET,
      is_exhausted: global?.is_exhausted || false,
      pct:         Math.round(((global?.total_chars || 0) / (global?.budget_chars || TTS_QUOTA.GLOBAL_MONTHLY_BUDGET)) * 100),
    },
    user: {
      used:  userTotal,
      limit: TTS_QUOTA.USER_MONTHLY_LIMIT_FREE,
      pct:   Math.round((userTotal / TTS_QUOTA.USER_MONTHLY_LIMIT_FREE) * 100),
    },
  })
}
