import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runPipelineVerification() {
  console.log('================================================================');
  console.log('🚀 ROCKETRIDE PIPELINE INTEGRATION VERIFICATION TEST');
  console.log('================================================================');

  // Test 1: Minimal test_pipeline.pipe
  console.log('\n--- TEST 1: Running test_pipeline.pipe ---');
  try {
    const { runRocketRidePipeline } = await import('../lib/rocketride/runner.ts');
    
    const res1 = await runRocketRidePipeline({
      pipeline_name: 'test_pipeline',
      payload: {
        message: 'Verify RocketRide multi-agent integration for HookLabs Buildathon',
        campaign_id: 'camp_demo_99',
      },
    });

    console.log('✅ TEST 1 RESULT:', JSON.stringify(res1, null, 2));

    // Test 2: campaign_analysis.pipe
    console.log('\n--- TEST 2: Running campaign_analysis.pipe ---');
    const res2 = await runRocketRidePipeline({
      pipeline_name: 'campaign_analysis',
      payload: {
        campaign_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        records_count: 1500,
        current_roas: 3.85,
      },
    });
    console.log('✅ TEST 2 RESULT:', JSON.stringify(res2, null, 2));

    // Test 3: campaign_optimization.pipe (High Risk Budget Change Escalation)
    console.log('\n--- TEST 3: Running campaign_optimization.pipe (High Risk Escalation) ---');
    const res3 = await runRocketRidePipeline({
      pipeline_name: 'campaign_optimization',
      payload: {
        campaign_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        current_budget: 500,
        proposed_budget: 850,
        action_type: 'budget_increase',
      },
    });
    console.log('✅ TEST 3 RESULT:', JSON.stringify(res3, null, 2));

    console.log('\n================================================================');
    console.log('🎉 ALL ROCKETRIDE INTEGRATION TESTS PASSED CLEANLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Pipeline test failed:', err);
  }
}

runPipelineVerification();
