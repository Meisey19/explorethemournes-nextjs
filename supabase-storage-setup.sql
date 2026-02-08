-- Storage buckets setup for ExploreTheMournes
-- Run this in the Supabase SQL Editor to create storage buckets

-- Create bucket for mountain images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mountain-images',
  'mountain-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for background images (larger file size)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backgrounds',
  'backgrounds',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for activity/place images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies: Allow public read access
CREATE POLICY "Public read access for mountain images"
ON storage.objects FOR SELECT
USING (bucket_id = 'mountain-images');

CREATE POLICY "Public read access for backgrounds"
ON storage.objects FOR SELECT
USING (bucket_id = 'backgrounds');

CREATE POLICY "Public read access for content images"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-images');

-- Allow authenticated users to upload (for admin dashboard later)
CREATE POLICY "Authenticated users can upload mountain images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'mountain-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload backgrounds"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'backgrounds' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload content images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'content-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete (for admin dashboard)
CREATE POLICY "Authenticated users can delete mountain images"
ON storage.objects FOR DELETE
USING (bucket_id = 'mountain-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete backgrounds"
ON storage.objects FOR DELETE
USING (bucket_id = 'backgrounds' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete content images"
ON storage.objects FOR DELETE
USING (bucket_id = 'content-images' AND auth.role() = 'authenticated');
