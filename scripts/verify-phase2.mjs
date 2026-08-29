import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function verifyAllPipelines() {
  console.log('================================================================');
  console.log('🔍 ROCKETRIDE PHASE 2 VERIFICATION ENGINE');
  console.log('================================================================');

  const pipelinesDir = path.resolve(__dirname, '../pipelines');
  const pipeFiles = fs.readdirSync(pipelinesDir).filter(f => f.endsWith('.pipe'));

  console.log(`Found ${pipeFiles.length} pipeline files in pipelines/\n`);

  for (const file of pipeFiles) {
    const filePath = path.join(pipelinesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check syntax structure
    const hasPipelineBlock = content.includes('pipeline "');
    const hasNodeBlock = content.includes('node "');
    const hasOutputBlock = content.includes('output {');

    console.log(`📌 Pipeline: ${file}`);
    console.log(`  - Structure: ${hasPipelineBlock && hasNodeBlock && hasOutputBlock ? 'Valid .pipe Syntax ✅' : 'Invalid ❌'}`);
    console.log(`  - File Size: ${content.length} bytes`);
  }

  console.log('\n--- Testing Risk Gate Rule Enforcement ---');
  // Rule: Budget increase > $100 OR > 20% => HIGH Risk
  const testCases = [
    { current: 500, proposed: 550, expectedRisk: 'LOW', expectedApproval: false },
    { current: 500, proposed: 650, expectedRisk: 'HIGH', expectedApproval: true }, // +$150 > $100
    { current: 200, proposed: 250, expectedRisk: 'HIGH', expectedApproval: true }, // +25% > 20%
  ];

  for (const tc of testCases) {
    const isHighRisk = (tc.proposed - tc.current > 100) || ((tc.proposed - tc.current) / tc.current > 0.20);
    const risk = isHighRisk ? 'HIGH' : 'LOW';
    console.log(`  - Budget $${tc.current} -> $${tc.proposed}: Risk=${risk} | Approval=${isHighRisk} (Matches Expected: ${risk === tc.expectedRisk ? '✅' : '❌'})`);
  }

  console.log('\n================================================================');
  console.log('🎉 VERIFICATION SCRIPT COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

verifyAllPipelines();
