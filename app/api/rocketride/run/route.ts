import { NextRequest, NextResponse } from 'next/server';
import { runRocketRidePipeline } from '@/lib/rocketride/runner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pipeline_name, payload, options } = body;

    if (!pipeline_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: pipeline_name' },
        { status: 400 }
      );
    }

    const result = await runRocketRidePipeline({
      pipeline_name,
      payload: payload || {},
      options: options || {},
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[API /api/rocketride/run] Handler Exception:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal server error executing RocketRide pipeline',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'HookLabs RocketRide Execution Engine Bridge',
    available_pipelines: [
      'test_pipeline',
      'campaign_analysis',
      'creative_intelligence',
      'creative_generation',
      'creative_evaluation',
      'campaign_optimization',
      'attribution_report',
    ],
    timestamp: new Date().toISOString(),
  });
}
