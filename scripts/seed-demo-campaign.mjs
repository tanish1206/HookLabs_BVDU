import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function seedDemoCampaign() {
  console.log('--- SEEDING "SUMMER SALE" DEMO CAMPAIGN DATASET ---');

  // 1. Seed Campaign
  const { data: campaign, error: cErr } = await supabase.from('campaigns').upsert({
    id: 'e3eebc99-9c0b-4ef8-bb6d-6bb9bd380999',
    name: 'Summer Sale',
    platform: 'meta',
    status: 'active',
    daily_budget: 50000.00,
    total_spend: 42000.00,
    target_roas: 3.50,
    current_roas: 4.41,
  }).select().single();

  if (cErr) {
    console.error('❌ Error seeding campaign:', cErr.message);
    return;
  }

  console.log('✅ Campaign "Summer Sale" seeded successfully! ID:', campaign.id);

  // 2. Seed Metrics
  await supabase.from('campaign_metrics').insert({
    campaign_id: campaign.id,
    impressions: 145000,
    clicks: 4930,
    spend: 42000.00,
    conversions: 185,
    revenue: 185570.00,
    ctr: 3.40,
    cpc: 8.51,
    roas: 4.41,
  });

  // 3. Clear existing demo approval requests & reset memory for clean run
  await supabase.from('approval_requests').delete().eq('campaign_id', campaign.id);

  console.log('✅ "Summer Sale" demo environment prepared and ready for Golden Demo Loop!\n');
}

seedDemoCampaign();
