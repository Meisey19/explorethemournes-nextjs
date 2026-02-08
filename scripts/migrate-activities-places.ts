import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to old site
const OLD_SITE_PATH = 'c:\\inetpub\\explorethemournes';

// Activity pages to migrate
const ACTIVITY_FILES = [
  'fell-running.html',
  'hikingclubs.html',
  'mournes-triathlons.html',
  'mountaincode.html',
  'tips.html',
  'introduction.html',
  'weather.html',
];

// Place pages to migrate
const PLACE_FILES = [
  'game-of-thrones.html',
  'mourne-wall.html',
  'silent-valley.html',
  'spelga-dam.html',
  'lough-shannagh.html',
  'devils-coachroad.html',
  'windy-gap.html',
];

interface AccordionSection {
  title: string;
  content: string;
}

function extractTitle(html: string, $: cheerio.CheerioAPI): string {
  // Try h2 first
  const h2 = $('h2').first().text().trim();
  if (h2) return h2;

  // Fallback to title tag
  const title = $('title').text().trim();
  return title.replace('The Mourne Mountains', '').replace(/^[\s\-]+|[\s\-]+$/g, '');
}

function extractSubtitle($: cheerio.CheerioAPI): string | null {
  // Look for subtitle text after h2
  const h2 = $('h2').first();
  const nextText = h2.next().text().trim();
  if (nextText && nextText.length < 100) {
    return nextText;
  }
  return null;
}

function extractBackgroundImage($: cheerio.CheerioAPI): string | null {
  const img = $('#supersize img').attr('src');
  if (img) {
    return img.replace(/^images\//, '');
  }
  return null;
}

function extractAccordionSections($: cheerio.CheerioAPI): AccordionSection[] {
  const sections: AccordionSection[] = [];

  $('#readmore > a').each((i, elem) => {
    const title = $(elem).text().trim();
    const contentDiv = $(elem).next('div');

    // Get HTML content and clean it up
    let content = contentDiv.html() || '';
    content = content.trim();

    // Convert relative image paths to storage paths
    content = content.replace(/src="images\//g, 'src="');

    // Clean up extra whitespace
    content = content.replace(/\s+/g, ' ').trim();

    if (title && content) {
      sections.push({ title, content });
    }
  });

  return sections;
}

function extractGalleryImages($: cheerio.CheerioAPI): string[] {
  const images: string[] = [];

  $('a[rel^="prettyPhoto[gallery"]').each((i, elem) => {
    const href = $(elem).attr('href');
    if (href && href.startsWith('images/')) {
      images.push(href.replace(/^images\//, ''));
    }
  });

  return images;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function migrateActivities() {
  console.log('\n========================================');
  console.log('Migrating Activities');
  console.log('========================================\n');

  let successCount = 0;
  let skipCount = 0;

  for (const filename of ACTIVITY_FILES) {
    const filePath = path.join(OLD_SITE_PATH, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filename}`);
      skipCount++;
      continue;
    }

    try {
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);

      const title = extractTitle(html, $);
      const slug = slugify(filename.replace('.html', ''));
      const subtitle = extractSubtitle($);
      const backgroundImage = extractBackgroundImage($);
      const sections = extractAccordionSections($);
      const galleryImages = extractGalleryImages($);

      // Combine sections into content blocks
      const contentBlocks = sections.map(section => ({
        type: 'section',
        title: section.title,
        content: section.content,
      }));

      // Store everything in content JSONB
      const fullContent = {
        subtitle,
        sections: contentBlocks,
        gallery_images: galleryImages,
        background_image_path: backgroundImage, // Store path for now, will link to images table later
      };

      const activity = {
        slug,
        title,
        content: fullContent,
        published: true,
        seo_title: title,
        seo_description: subtitle || title,
      };

      // Insert or update
      const { error } = await supabase
        .from('activities')
        .upsert(activity, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Error inserting ${title}:`, error.message);
      } else {
        console.log(`✅ Migrated: ${title}`);
        successCount++;
      }

    } catch (error: any) {
      console.error(`❌ Error processing ${filename}:`, error.message);
    }
  }

  console.log(`\n✨ Activities migrated: ${successCount}/${ACTIVITY_FILES.length}`);
  if (skipCount > 0) {
    console.log(`⚠️  Files skipped: ${skipCount}`);
  }
}

async function migratePlaces() {
  console.log('\n========================================');
  console.log('Migrating Places of Interest');
  console.log('========================================\n');

  let successCount = 0;
  let skipCount = 0;

  for (const filename of PLACE_FILES) {
    const filePath = path.join(OLD_SITE_PATH, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filename}`);
      skipCount++;
      continue;
    }

    try {
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);

      const title = extractTitle(html, $);
      const slug = slugify(filename.replace('.html', ''));
      const subtitle = extractSubtitle($);
      const backgroundImage = extractBackgroundImage($);
      const sections = extractAccordionSections($);
      const galleryImages = extractGalleryImages($);

      // Combine sections into content blocks
      const contentBlocks = sections.map(section => ({
        type: 'section',
        title: section.title,
        content: section.content,
      }));

      // Store everything in content JSONB
      const fullContent = {
        subtitle,
        sections: contentBlocks,
        gallery_images: galleryImages,
        background_image_path: backgroundImage, // Store path for now, will link to images table later
      };

      const place = {
        slug,
        title,
        content: fullContent,
        published: true,
        seo_title: title,
        seo_description: subtitle || title,
        // Coordinates would need to be added manually later
        latitude: null,
        longitude: null,
      };

      // Insert or update
      const { error } = await supabase
        .from('places')
        .upsert(place, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Error inserting ${title}:`, error.message);
      } else {
        console.log(`✅ Migrated: ${title}`);
        successCount++;
      }

    } catch (error: any) {
      console.error(`❌ Error processing ${filename}:`, error.message);
    }
  }

  console.log(`\n✨ Places migrated: ${successCount}/${PLACE_FILES.length}`);
  if (skipCount > 0) {
    console.log(`⚠️  Files skipped: ${skipCount}`);
  }
}

async function main() {
  console.log('🚀 Starting Activities & Places Migration...\n');

  await migrateActivities();
  await migratePlaces();

  console.log('\n✅ Migration complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
