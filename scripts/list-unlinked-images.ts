import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUnlinkedImages() {
  console.log('Fetching unlinked images...\n');

  const { data: images, error } = await supabase
    .from('images')
    .select('id, storage_path, title')
    .is('mountain_id', null)
    .order('storage_path');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${images?.length || 0} unlinked images:\n`);

  if (images && images.length > 0) {
    // Group by bucket/directory
    const grouped: Record<string, string[]> = {};

    images.forEach(img => {
      const parts = img.storage_path.split('/');
      const bucket = parts[0];
      const dir = parts.length > 2 ? parts[1] : 'root';
      const key = `${bucket}/${dir}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(img.storage_path);
    });

    // Display grouped results
    Object.keys(grouped).sort().forEach(key => {
      console.log(`\n${key}/ (${grouped[key].length} images):`);
      grouped[key].slice(0, 5).forEach(path => {
        console.log(`  - ${path}`);
      });
      if (grouped[key].length > 5) {
        console.log(`  ... and ${grouped[key].length - 5} more`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    Object.keys(grouped).sort().forEach(key => {
      console.log(`  ${key}: ${grouped[key].length} images`);
    });
  }
}

listUnlinkedImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
