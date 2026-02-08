# Content Migration Guide

This guide will help you migrate all content and images from the legacy ExploreTheMournes site to the new Next.js + Supabase application.

## Prerequisites

✅ Supabase project created
✅ Database schema applied (supabase-schema.sql)
✅ Environment variables configured (.env.local)
✅ Legacy site accessible at `c:\inetpub\explorethemournes`

## Migration Steps

### Step 1: Install Dependencies

First, install the new dependencies needed for the migration scripts:

```bash
cd C:\Users\miche\explorethemournes-nextjs
npm install
```

This will install:
- `tsx` - TypeScript execution engine
- `@types/cheerio` - Type definitions for HTML parsing

### Step 2: Create Storage Buckets

Before migrating images, you need to create storage buckets in Supabase:

1. Open your Supabase project: https://supabase.com/dashboard/project/ixjiaggaxkxkxefqgnrx
2. Navigate to **Storage** in the left sidebar
3. Go to **SQL Editor** tab
4. Copy and paste the contents of `supabase-storage-setup.sql`
5. Click **Run** to create the buckets and policies

This will create three storage buckets:
- `mountain-images` - For mountain gallery images (5MB limit)
- `backgrounds` - For full-screen background images (10MB limit)
- `content-images` - For activity/place images (5MB limit)

### Step 3: Migrate Content (Mountains Data)

This script will parse all 56 mountain HTML files and extract structured data into Supabase:

```bash
npm run migrate:content
```

**What it does:**
- Scans `c:\inetpub\explorethemournes` for HTML files
- Extracts mountain name, Gaelic name, height, terrain, views
- Extracts coordinates from Google Maps URLs
- Inserts data into `mountains` and `starting_points` tables
- Skips non-mountain pages (index, contact, activities, etc.)

**Expected output:**
```
Starting content migration...

Found 56 mountain HTML files

Processing: slieve-donard.html
✓ Inserted mountain: Slieve Donard
  ✓ Inserted 3 starting point(s)

Processing: slieve-bearnagh.html
✓ Inserted mountain: Slieve Bearnagh
  ✓ Inserted 2 starting point(s)

...

==================================================
Migration complete!
Success: 56
Failed: 0
==================================================
```

### Step 4: Migrate Images

This script will upload all images to Supabase Storage:

```bash
npm run migrate:images
```

**What it does:**
- Scans `c:\inetpub\explorethemournes\images` recursively
- Converts all images to WebP format (better compression)
- Optimizes images (max width 1600px, 85% quality)
- Uploads to appropriate storage bucket
- Maintains directory structure
- Inserts metadata into `images` table

**Expected output:**
```
Starting image migration...

Found 236 image files

[1/236] mountains/donard/slieve-donard.jpg
  Processing: slieve-donard.jpg
  → Bucket: mountain-images
  → Path: mountains/donard/slieve-donard.webp
  ✓ Uploaded (342.5KB)

...

==================================================
Image migration complete!
Success: 236
Failed: 0
Skipped: 0
==================================================
```

**Note:** Image migration may take 5-10 minutes depending on file sizes and internet speed. Each image is optimized before upload.

### Step 5: Run Both Migrations Together (Optional)

To run both migrations sequentially:

```bash
npm run migrate:all
```

This will:
1. Migrate all content first
2. Then migrate all images

## Verification

After migration, verify the results:

### Check Database

1. Go to Supabase **Table Editor**
2. Check `mountains` table - should have ~56 rows
3. Check `starting_points` table - should have ~150 rows (multiple per mountain)
4. Check `images` table - should have ~236 rows

### Check Storage

1. Go to Supabase **Storage**
2. Browse `mountain-images` bucket - should see mountain photos
3. Browse `backgrounds` bucket - should see large background images
4. Browse `content-images` bucket - should see activity/place images

### Test on Website

1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000/mountains/slieve-donard
3. Verify all data displays correctly
4. Check that images load (once we add gallery component)

## Troubleshooting

### "Old site path not found"

If you see this error:
```
Error: Old site path not found: c:\inetpub\explorethemournes
```

**Fix:** Update the `OLD_SITE_PATH` constant in the migration scripts:
- `scripts/migrate-content.ts` - line 7
- `scripts/migrate-images.ts` - line 6

Change it to wherever your legacy site is located.

### "Storage bucket does not exist"

If image upload fails with bucket error:

**Fix:** Make sure you ran `supabase-storage-setup.sql` in Step 2.

### "Permission denied" or "RLS policy"

If you get RLS (Row Level Security) errors:

**Fix:** The scripts use `SUPABASE_SERVICE_KEY` which bypasses RLS. Make sure this environment variable is set in `.env.local`.

### Images not optimizing

If you get Sharp errors:

**Fix:** Sharp is a native dependency. Try reinstalling:
```bash
npm uninstall sharp
npm install sharp
```

### Rate limiting errors

If you get too many requests:

**Fix:** The scripts already include 100-200ms delays between operations. If needed, increase the delay:
- `migrate-content.ts` line 267: change `100` to `500`
- `migrate-images.ts` line 272: change `200` to `500`

## After Migration

Once migration is complete, you can:

1. **Delete test data:** Remove the manual "Slieve Donard" entry if it conflicts
2. **Review data:** Check for any missing or incorrect data
3. **Update images table:** Link images to their respective mountains
4. **Build gallery component:** Create the image gallery to display migrated photos
5. **Add remaining pages:** Migrate activities, places, and walks

## Next Steps

After successful migration:
- ✅ Phase 2 complete: All content and images migrated
- → Phase 3: Build interactive components (gallery, maps, navigation)
- → Phase 4: Add contact form and additional features
- → Phase 5: Create admin dashboard
- → Phase 6: Enable PWA features

## Migration Scripts Reference

### migrate-content.ts

**Extracts from HTML:**
- Mountain name from `<title>` tag
- Gaelic name and meaning from `<h2>` tag
- Height, terrain, views from "Profile" accordion section
- Starting points from Google Maps links
- Meta description for SEO

**Inserts into:**
- `mountains` table
- `starting_points` table

### migrate-images.ts

**Processes:**
- All `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` files
- Converts to WebP format
- Resizes to max 1600px width
- Compresses to 85% quality

**Uploads to:**
- `mountain-images` bucket (images in /mountains/ directories)
- `backgrounds` bucket (images in /backgrounds/ directories)
- `content-images` bucket (all other images)

**Inserts into:**
- `images` table with metadata (width, height, file size, storage path)

## File Structure After Migration

```
Supabase Database:
├── mountains (56 rows)
│   ├── id, slug, name, gaelic_name, meaning
│   ├── height, terrain, views, description
│   └── seo_title, seo_description, published
├── starting_points (~150 rows)
│   ├── mountain_id (foreign key)
│   ├── name, description, latitude, longitude
│   └── google_maps_url, difficulty, display_order
└── images (236 rows)
    ├── storage_path (e.g., "mountain-images/donard/slieve-donard.webp")
    ├── title, caption, alt_text
    └── width, height, photographer_credit

Supabase Storage:
├── mountain-images/
│   ├── donard/
│   │   ├── slieve-donard.webp
│   │   ├── summit-view.webp
│   │   └── ... (12 images)
│   ├── bearnagh/
│   │   └── ... (8 images)
│   └── ... (56 mountain directories)
├── backgrounds/
│   ├── donard-background.webp
│   └── ... (56 background images)
└── content-images/
    ├── activities/
    │   └── ... (activity images)
    └── places/
        └── ... (place images)
```

## Support

If you encounter issues during migration:
1. Check the error messages carefully
2. Verify environment variables are correct
3. Ensure Supabase project is accessible
4. Check that the legacy site path exists
5. Review the troubleshooting section above

For additional help, review the main [README.md](README.md) or the [Implementation Plan](scalable-wobbling-sloth.md).
