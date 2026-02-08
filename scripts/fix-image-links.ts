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

/**
 * Extract potential mountain slug from image storage path
 * Examples:
 *   "mountain-images/donard/photo.webp" -> "donard"
 *   "mountain-images/slieve-donard/photo.webp" -> "slieve-donard"
 *   "backgrounds/bearnagh-bg.webp" -> "bearnagh"
 */
function extractMountainSlugFromPath(storagePath: string): string[] {
  const normalized = storagePath.toLowerCase();

  // Remove bucket name
  const withoutBucket = normalized.replace(/^(mountain-images|backgrounds|content-images)\//, '');

  // Get first directory or filename
  const parts = withoutBucket.split('/');
  const firstPart = parts[0];

  // Extract slug from filename if no directory
  const filename = parts[parts.length - 1].replace(/\.(webp|jpg|jpeg|png)$/, '');

  // Return possible slugs to try
  const possibilities = [
    firstPart,
    filename,
    filename.replace(/-bg$/, ''), // Remove -bg suffix
    filename.replace(/-background$/, ''), // Remove -background suffix
  ];

  // Add "slieve-" prefix versions for common abbreviations
  const withSlieve = possibilities.map(p => {
    if (!p.startsWith('slieve-') && p.length < 10) {
      return `slieve-${p}`;
    }
    return null;
  }).filter(Boolean) as string[];

  return [...new Set([...possibilities, ...withSlieve])];
}

/**
 * Find mountain by trying multiple slug variations
 */
async function findMountainBySlug(slugs: string[]): Promise<string | null> {
  for (const slug of slugs) {
    const { data, error } = await supabase
      .from('mountains')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return data.id;
    }
  }
  return null;
}

/**
 * Main function to link images to mountains
 */
async function fixImageLinks() {
  console.log('Starting image link fix...\n');

  // Get all images without mountain_id
  const { data: images, error: fetchError } = await supabase
    .from('images')
    .select('id, storage_path, title, mountain_id')
    .is('mountain_id', null);

  if (fetchError) {
    console.error('Error fetching images:', fetchError);
    return;
  }

  console.log(`Found ${images?.length || 0} images without mountain_id\n`);

  if (!images || images.length === 0) {
    console.log('All images are already linked!');
    return;
  }

  let linkedCount = 0;
  let notLinkedCount = 0;

  for (const image of images) {
    const slugs = extractMountainSlugFromPath(image.storage_path);
    console.log(`\nProcessing: ${image.storage_path}`);
    console.log(`  Trying slugs: ${slugs.join(', ')}`);

    const mountainId = await findMountainBySlug(slugs);

    if (mountainId) {
      // Update image with mountain_id
      const { error: updateError } = await supabase
        .from('images')
        .update({ mountain_id: mountainId })
        .eq('id', image.id);

      if (updateError) {
        console.log(`  ✗ Error updating: ${updateError.message}`);
        notLinkedCount++;
      } else {
        console.log(`  ✓ Linked to mountain (ID: ${mountainId})`);
        linkedCount++;
      }
    } else {
      console.log(`  ✗ Could not find matching mountain`);
      notLinkedCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n' + '='.repeat(50));
  console.log('Image link fix complete!');
  console.log(`Successfully linked: ${linkedCount}`);
  console.log(`Not linked: ${notLinkedCount}`);
  console.log('='.repeat(50));
}

// Run the fix
fixImageLinks()
  .then(() => {
    console.log('\nScript finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
