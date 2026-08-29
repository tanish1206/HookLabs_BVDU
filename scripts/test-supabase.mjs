import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- SUPABASE INTEGRATION DIAGNOSTIC ---');
console.log('Supabase URL configured:', !!supabaseUrl, supabaseUrl ? `(${supabaseUrl})` : '');
console.log('Anon Key configured:', !!supabaseAnonKey);
console.log('Service Key configured:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\nTesting database query on trends_cache table...');
    const { data: trendsData, error: trendsErr } = await supabase.from('trends_cache').select('count').limit(1);
    
    if (trendsErr) {
      console.log('⚠️ Notice on trends_cache:', trendsErr.message);
    } else {
      console.log('✅ Connected to Database successfully! trends_cache accessible.');
    }

    console.log('Testing campaigns table (PS #10)...');
    const { data: campaignData, error: campaignErr } = await supabase.from('campaigns').select('count').limit(1);
    
    if (campaignErr) {
      console.log('⚠️ Notice on campaigns table:', campaignErr.message, '(Need to execute master SQL schema if table missing)');
    } else {
      console.log('✅ campaigns table is active and accessible!');
    }

    console.log('\nTesting Supabase Storage Bucket access...');
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (bucketErr) {
      console.log('⚠️ Storage bucket warning:', bucketErr.message);
    } else {
      console.log('✅ Storage Buckets accessible:', buckets.map(b => b.name).join(', ') || 'No buckets yet');
    }

  } catch (err) {
    console.error('❌ Connection test error:', err);
  }
}

testConnection();
