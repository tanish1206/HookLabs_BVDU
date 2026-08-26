import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/Hooklabs/HookLabs_/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Creating 'videos-bucket' bucket...");
  const { data: createData, error: createErr } = await supabase.storage.createBucket('videos-bucket', {
    public: true,
    fileSizeLimit: 104857600, // 100MB
  });
  
  if (createErr) {
    console.error("Failed to create bucket:", createErr);
  } else {
    console.log("Bucket created successfully:", createData);
  }
}

main();
