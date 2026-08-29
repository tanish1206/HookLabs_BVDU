import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase URL or Service Role Key missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initBuckets() {
  console.log('--- INITIALIZING SUPABASE STORAGE BUCKETS ---');
  
  const bucketsToCreate = ['videos', 'creatives', 'assets'];

  for (const bucketName of bucketsToCreate) {
    try {
      const { data: existingBucket } = await supabase.storage.getBucket(bucketName);
      
      if (existingBucket) {
        console.log(`✅ Bucket "${bucketName}" already exists.`);
      } else {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['video/mp4', 'image/png', 'image/jpeg', 'audio/mpeg', 'audio/wav'],
        });

        if (error) {
          console.error(`⚠️ Failed to create bucket "${bucketName}":`, error.message);
        } else {
          console.log(`🎉 Bucket "${bucketName}" created successfully!`);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing bucket "${bucketName}":`, err.message);
    }
  }
}

initBuckets();
