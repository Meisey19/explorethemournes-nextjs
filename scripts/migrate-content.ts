import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
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

interface MountainData {
  slug: string;
  name: string;
  gaelic_name: string | null;
  meaning: string | null;
  height: number | null;
  terrain: string | null;
  views: string | null;
  description: string | null;
  region: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
}

interface StartingPointData {
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  difficulty: string | null;
  display_order: number;
}

/**
 * Extract coordinates from Google Maps URL
 * Example: https://maps.google.com/maps?ll=54.219725,-5.882986
 */
function extractCoordinatesFromUrl(url: string): { lat: number; lng: number } | null {
  try {
    const llMatch = url.match(/ll=([0-9.-]+),([0-9.-]+)/);
    if (llMatch) {
      return {
        lat: parseFloat(llMatch[1]),
        lng: parseFloat(llMatch[2])
      };
    }
  } catch (error) {
    console.error('Error extracting coordinates:', error);
  }
  return null;
}

/**
 * Extract height from text like "Height: 850m" or "850 metres"
 */
function extractHeight(text: string): number | null {
  const heightMatch = text.match(/(\d+)\s*m(?:etres)?/i);
  return heightMatch ? parseInt(heightMatch[1], 10) : null;
}

/**
 * Clean text by removing extra whitespace and newlines
 */
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Parse a single mountain HTML file
 */
function parseMountainHtml(filePath: string): { mountain: MountainData; startingPoints: StartingPointData[] } | null {
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);

    // Extract slug from filename (e.g., "slieve-donard.html" -> "slieve-donard")
    const slug = path.basename(filePath, '.html');

    // Extract mountain name from title tag
    const title = $('title').text().trim();
    const name = title.replace(/\s*-\s*ExploreTheMournes\s*-\s*Mourne Mountains/, '').trim();

    // Extract Gaelic name and meaning
    // Pattern: "Sliabh Dhónairt: Mountain of (St.) Domhangart"
    const gaelicLine = $('h2').first().text().trim();
    let gaelic_name: string | null = null;
    let meaning: string | null = null;

    if (gaelicLine.includes(':')) {
      const parts = gaelicLine.split(':');
      gaelic_name = parts[0].trim();
      meaning = parts.slice(1).join(':').trim();
    }

    // Extract content from Profile section (first accordion section)
    const profileSection = $('#readmore > div').eq(0);
    let height: number | null = null;
    let terrain: string | null = null;
    let views: string | null = null;
    let region: string | null = null;

    profileSection.find('p').each((_, elem) => {
      const text = $(elem).text();

      if (text.includes('Height:')) {
        height = extractHeight(text);
      }

      if (text.includes('Terrain:')) {
        terrain = cleanText(text.replace(/Terrain:\s*/i, ''));
      }

      if (text.includes('Views:')) {
        views = cleanText(text.replace(/Views:\s*/i, ''));
      }

      if (text.includes('Region:') || text.includes('Location:')) {
        region = cleanText(text.replace(/(?:Region|Location):\s*/i, ''));
      }
    });

    // Extract meta description for SEO
    const metaDescription = $('meta[name="description"]').attr('content') || null;

    // Extract starting points from "Where can I start from?" section
    const startingPoints: StartingPointData[] = [];
    const startingPointsSection = $('#readmore > div').eq(2); // Usually the 3rd accordion section

    startingPointsSection.find('a[href*="maps.google"]').each((index, elem) => {
      const link = $(elem);
      const googleMapsUrl = link.attr('href') || '';
      const pointName = link.text().trim() || `Starting Point ${index + 1}`;

      // Extract coordinates from URL
      const coords = extractCoordinatesFromUrl(googleMapsUrl);

      // Get surrounding text for description
      const parent = link.parent();
      const description = cleanText(parent.text().replace(pointName, ''));

      startingPoints.push({
        name: pointName,
        description: description || null,
        latitude: coords?.lat || null,
        longitude: coords?.lng || null,
        google_maps_url: googleMapsUrl,
        difficulty: null, // Can be manually added later
        display_order: index + 1
      });
    });

    // Create mountain object
    const mountain: MountainData = {
      slug,
      name,
      gaelic_name,
      meaning,
      height,
      terrain,
      views,
      description: metaDescription,
      region,
      seo_title: title,
      seo_description: metaDescription,
      published: true
    };

    return { mountain, startingPoints };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all mountain HTML files from the old site
 */
function getMountainFiles(): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(OLD_SITE_PATH);

    for (const entry of entries) {
      const fullPath = path.join(OLD_SITE_PATH, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isFile() && entry.endsWith('.html')) {
        // Skip non-mountain pages
        const skipFiles = [
          'index.html',
          'contact.html',
          'tips.html',
          'weather.html',
          'introduction.html',
          'maps.html',
          'fell-running.html',
          'hikingclubs.html',
          'mournes-triathlons.html',
          'mountaincode.html',
          'game-of-thrones.html',
          'mourne-wall.html',
          'silent-valley.html'
        ];

        if (!skipFiles.includes(entry)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }

  return files;
}

/**
 * Insert mountain data into Supabase
 */
async function insertMountain(mountain: MountainData, startingPoints: StartingPointData[]) {
  try {
    // Insert mountain
    const { data: mountainData, error: mountainError } = await supabase
      .from('mountains')
      .insert(mountain)
      .select()
      .single();

    if (mountainError) {
      console.error(`Error inserting mountain ${mountain.name}:`, mountainError);
      return;
    }

    console.log(`✓ Inserted mountain: ${mountain.name}`);

    // Insert starting points
    if (startingPoints.length > 0) {
      const pointsWithMountainId = startingPoints.map(point => ({
        ...point,
        mountain_id: mountainData.id
      }));

      const { error: pointsError } = await supabase
        .from('starting_points')
        .insert(pointsWithMountainId);

      if (pointsError) {
        console.error(`Error inserting starting points for ${mountain.name}:`, pointsError);
      } else {
        console.log(`  ✓ Inserted ${startingPoints.length} starting point(s)`);
      }
    }
  } catch (error) {
    console.error(`Error inserting ${mountain.name}:`, error);
  }
}

/**
 * Main migration function
 */
async function migrateContent() {
  console.log('Starting content migration...\n');

  // Check if old site exists
  if (!fs.existsSync(OLD_SITE_PATH)) {
    console.error(`Error: Old site path not found: ${OLD_SITE_PATH}`);
    console.log('Please update OLD_SITE_PATH in the script to point to your legacy site.');
    return;
  }

  // Get all mountain files
  const mountainFiles = getMountainFiles();
  console.log(`Found ${mountainFiles.length} mountain HTML files\n`);

  if (mountainFiles.length === 0) {
    console.log('No mountain files found. Please check the OLD_SITE_PATH.');
    return;
  }

  // Parse and insert each mountain
  let successCount = 0;
  let failCount = 0;

  for (const filePath of mountainFiles) {
    const fileName = path.basename(filePath);
    console.log(`\nProcessing: ${fileName}`);

    const parsed = parseMountainHtml(filePath);

    if (parsed) {
      await insertMountain(parsed.mountain, parsed.startingPoints);
      successCount++;
    } else {
      console.log(`✗ Failed to parse ${fileName}`);
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Migration complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('='.repeat(50));
}

// Run migration
migrateContent()
  .then(() => {
    console.log('\nMigration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
