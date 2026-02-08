import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing environment variables!');
  console.error('Make sure .env.local exists with:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to the old site
const OLD_SITE_PATH = 'c:\\inetpub\\explorethemournes';
const IMAGES_PATH = path.join(OLD_SITE_PATH, 'images');

interface ImageMetadata {
  original_filename: string;
  storage_path: string;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
}

/**
 * Check if file is an image
 */
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

/**
 * Skip system/temporary files
 */
function shouldSkipFile(filename: string): boolean {
  const skipFiles = ['Thumbs.db', '.DS_Store', 'desktop.ini'];
  return skipFiles.includes(filename);
}

/**
 * Get all image files from directory recursively
 */
function getImageFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      if (shouldSkipFile(entry)) continue;

      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively get files from subdirectories
        files.push(...getImageFiles(fullPath, baseDir));
      } else if (stat.isFile() && isImageFile(entry)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

/**
 * Determine bucket based on image path
 */
function getBucketForImage(filePath: string): string {
  const relativePath = path.relative(OLD_SITE_PATH, filePath).toLowerCase();

  if (relativePath.includes('backgrounds') || relativePath.includes('background')) {
    return 'backgrounds';
  }

  if (relativePath.includes('mountains') || relativePath.includes('mountain')) {
    return 'mountain-images';
  }

  return 'content-images';
}

/**
 * Generate storage path maintaining directory structure
 */
function generateStoragePath(filePath: string, bucket: string): string {
  const relativePath = path.relative(IMAGES_PATH, filePath);
  const dir = path.dirname(relativePath);
  const filename = path.basename(filePath, path.extname(filePath));
  const ext = '.webp'; // Convert all to WebP

  // Normalize path for storage (use forward slashes)
  let storagePath = path.join(dir, filename + ext).replace(/\\/g, '/');

  // Remove leading './' or '.\'
  storagePath = storagePath.replace(/^\.\//, '');

  return storagePath;
}

/**
 * Optimize and convert image to WebP
 */
async function optimizeImage(filePath: string, maxWidth: number = 1600): Promise<Buffer> {
  try {
    return await sharp(filePath)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch (error) {
    console.error(`Error optimizing image ${filePath}:`, error);
    throw error;
  }
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImage(
  filePath: string,
  bucket: string,
  storagePath: string,
  buffer: Buffer
): Promise<ImageMetadata | null> {
  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${storagePath}:`, error);
      return null;
    }

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    return {
      original_filename: path.basename(filePath),
      storage_path: `${bucket}/${storagePath}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
      file_size: buffer.length,
      mime_type: 'image/webp'
    };
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
}

/**
 * Insert image metadata into database
 */
async function insertImageMetadata(
  metadata: ImageMetadata,
  title: string | null = null,
  caption: string | null = null
) {
  try {
    const { error } = await supabase
      .from('images')
      .insert({
        storage_path: metadata.storage_path,
        title: title || metadata.original_filename,
        caption: caption,
        width: metadata.width,
        height: metadata.height,
        alt_text: title || metadata.original_filename
      });

    if (error) {
      console.error(`Error inserting image metadata:`, error);
    }
  } catch (error) {
    console.error(`Error inserting image metadata:`, error);
  }
}

/**
 * Process a single image file
 */
async function processImage(filePath: string): Promise<boolean> {
  try {
    const bucket = getBucketForImage(filePath);
    const storagePath = generateStoragePath(filePath, bucket);

    console.log(`  Processing: ${path.basename(filePath)}`);
    console.log(`  → Bucket: ${bucket}`);
    console.log(`  → Path: ${storagePath}`);

    // Optimize image
    const buffer = await optimizeImage(filePath);

    // Upload to storage
    const metadata = await uploadImage(filePath, bucket, storagePath, buffer);

    if (!metadata) {
      return false;
    }

    // Insert metadata into database
    await insertImageMetadata(metadata);

    console.log(`  ✓ Uploaded (${(buffer.length / 1024).toFixed(1)}KB)`);

    return true;
  } catch (error) {
    console.error(`  ✗ Failed to process ${filePath}:`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrateImages() {
  console.log('Starting image migration...\n');

  // Check if images path exists
  if (!fs.existsSync(IMAGES_PATH)) {
    console.error(`Error: Images path not found: ${IMAGES_PATH}`);
    console.log('Please update IMAGES_PATH in the script to point to your images directory.');
    return;
  }

  // Get all image files
  const imageFiles = getImageFiles(IMAGES_PATH);
  console.log(`Found ${imageFiles.length} image files\n`);

  if (imageFiles.length === 0) {
    console.log('No image files found. Please check the IMAGES_PATH.');
    return;
  }

  // Process each image
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i];
    console.log(`\n[${i + 1}/${imageFiles.length}] ${path.relative(IMAGES_PATH, filePath)}`);

    try {
      const success = await processImage(filePath);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.error(`Error processing image:`, error);
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Image migration complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log('='.repeat(50));
}

// Run migration
migrateImages()
  .then(() => {
    console.log('\nImage migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Image migration failed:', error);
    process.exit(1);
  });
