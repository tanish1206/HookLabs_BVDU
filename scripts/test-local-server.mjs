import fetch from 'node-fetch';

async function testLocalEndpoints() {
  console.log('================================================================');
  console.log('🌐 TESTING HOOKLABS LOCAL DEV SERVER (http://localhost:3000)');
  console.log('================================================================');

  const baseUrl = 'http://localhost:3000';

  // Wait 3 seconds for server startup
  await new Promise(r => setTimeout(r, 3000));

  const endpoints = [
    { url: '/api/rocketride/run', method: 'GET', name: 'RocketRide Status Endpoint' },
    { url: '/api/campaigns', method: 'GET', name: 'Campaign Registry Endpoint' },
    { url: '/api/intelligence', method: 'GET', name: 'Creative Memory Matrix Endpoint' },
    { url: '/api/approval', method: 'GET', name: 'Approval Center Queue Endpoint' },
    { url: '/api/attribution', method: 'GET', name: 'Attribution Report Endpoint' },
  ];

  for (const ep of endpoints) {
    try {
      console.log(`\nTesting ${ep.name} [${ep.method} ${ep.url}]...`);
      const res = await fetch(`${baseUrl}${ep.url}`, { method: ep.method });
      console.log(`Response Status: ${res.status} ${res.statusText}`);
      const json = await res.json();
      console.log('Response Payload:', JSON.stringify(json, null, 2));
    } catch (err) {
      console.error(`❌ Error testing ${ep.url}:`, err.message);
    }
  }

  // Test POST execution on RocketRide API
  console.log('\n--- Testing POST /api/rocketride/run (Pipeline Trigger) ---');
  try {
    const postRes = await fetch(`${baseUrl}/api/rocketride/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pipeline_name: 'campaign_analysis',
        payload: {
          campaign_id: 'camp_local_test_001',
          records_count: 500,
          current_roas: 3.85
        }
      })
    });
    console.log(`Response Status: ${postRes.status} ${postRes.statusText}`);
    const postJson = await postRes.json();
    console.log('Pipeline Execution Output:', JSON.stringify(postJson, null, 2));
  } catch (err) {
    console.error('❌ Error testing POST /api/rocketride/run:', err.message);
  }

  console.log('\n================================================================');
  console.log('🎉 LOCAL SERVER ENDPOINT VERIFICATION COMPLETED!');
  console.log('================================================================');
}

testLocalEndpoints();
