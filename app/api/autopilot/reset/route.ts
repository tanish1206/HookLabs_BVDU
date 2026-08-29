import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client unavailable' }, { status: 500 });
    }

    console.log('--- RESETTING GOLDEN DEMO ENVIRONMENT ---');

    // 1. Delete approval requests for Summer Sale
    await supabase.from('approval_requests').delete().filter('reasoning', 'ilike', '%Summer Sale%');
    await supabase.from('approval_requests').delete().filter('reasoning', 'ilike', '%Founder UGC%');

    // 2. Reset Summer Sale Campaign Budget back to 50,000
    await supabase
      .from('campaigns')
      .update({
        daily_budget: 50000.00,
        status: 'active',
        current_roas: 4.41,
      })
      .eq('name', 'Summer Sale');

    // 3. Clear demo telemetry entries
    await supabase.from('pipeline_runs').delete().eq('pipeline_name', 'golden_demo');

    return NextResponse.json({
      success: true,
      message: 'Golden demo environment reset successfully. Ready for repeat execution!',
      reset_state: {
        campaign_name: 'Summer Sale',
        daily_budget: 50000.00,
        status: 'active',
        pending_approvals: 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
