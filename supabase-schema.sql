-- ExploreTheMournes Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor after creating a new project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Core Tables
-- =====================================================

-- Mountains table (main content)
CREATE TABLE mountains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gaelic_name TEXT,
  meaning TEXT,
  height INTEGER, -- height in meters
  terrain TEXT,
  views TEXT,
  description TEXT,
  region TEXT, -- 'eastern' or 'western'
  featured_image_id UUID,
  background_image_id UUID,
  photographer_credit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT
);

-- Starting points with coordinates
CREATE TABLE starting_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  parking_available BOOLEAN DEFAULT true,
  difficulty TEXT, -- 'easy', 'moderate', 'difficult'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Images with Supabase Storage integration
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_path TEXT NOT NULL, -- path in Supabase Storage bucket
  title TEXT,
  caption TEXT,
  photographer_credit TEXT,
  alt_text TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/webp',
  mountain_id UUID REFERENCES mountains(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- Activity pages (fell running, hiking clubs, triathlons)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  gaelic_title TEXT,
  content JSONB, -- structured content blocks
  featured_image_id UUID REFERENCES images(id),
  background_image_id UUID REFERENCES images(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT
);

-- Places of interest (Game of Thrones, Mourne Wall, Silent Valley)
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  gaelic_title TEXT,
  content JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  featured_image_id UUID REFERENCES images(id),
  background_image_id UUID REFERENCES images(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT
);

-- Walking routes
CREATE TABLE walks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  distance_km DECIMAL(5, 2),
  duration_hours DECIMAL(4, 2),
  elevation_gain INTEGER,
  gpx_file_path TEXT, -- path to GPX file in Supabase Storage
  starting_point_id UUID REFERENCES starting_points(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true
);

-- Many-to-many: walks can include multiple mountains
CREATE TABLE walk_mountains (
  walk_id UUID NOT NULL REFERENCES walks(id) ON DELETE CASCADE,
  mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
  sequence_order INTEGER,
  PRIMARY KEY (walk_id, mountain_id)
);

-- Content sections (for accordion-style expandable content)
CREATE TABLE content_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_type TEXT NOT NULL, -- 'mountain', 'activity', 'place'
  parent_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'read', 'archived', 'spam'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users (for content management dashboard)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'editor', -- 'admin', 'editor'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- =====================================================
-- Indexes for performance
-- =====================================================

CREATE INDEX idx_mountains_slug ON mountains(slug);
CREATE INDEX idx_mountains_region ON mountains(region);
CREATE INDEX idx_mountains_published ON mountains(published);
CREATE INDEX idx_images_mountain ON images(mountain_id);
CREATE INDEX idx_images_featured ON images(is_featured);
CREATE INDEX idx_starting_points_mountain ON starting_points(mountain_id);
CREATE INDEX idx_content_sections_parent ON content_sections(parent_type, parent_id);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created ON contact_submissions(created_at DESC);
CREATE INDEX idx_activities_slug ON activities(slug);
CREATE INDEX idx_places_slug ON places(slug);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE mountains ENABLE ROW LEVEL SECURITY;
ALTER TABLE starting_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_mountains ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published mountains" ON mountains
  FOR SELECT USING (published = true);

CREATE POLICY "Public can view starting points" ON starting_points
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mountains
      WHERE mountains.id = starting_points.mountain_id
      AND mountains.published = true
    )
  );

CREATE POLICY "Public can view images" ON images
  FOR SELECT USING (true);

CREATE POLICY "Public can view published activities" ON activities
  FOR SELECT USING (published = true);

CREATE POLICY "Public can view published places" ON places
  FOR SELECT USING (published = true);

CREATE POLICY "Public can view published walks" ON walks
  FOR SELECT USING (published = true);

CREATE POLICY "Public can view walk_mountains" ON walk_mountains
  FOR SELECT USING (true);

CREATE POLICY "Public can view content sections" ON content_sections
  FOR SELECT USING (true);

-- Anyone can submit contact forms
CREATE POLICY "Anyone can submit contact forms" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Admin access policies
CREATE POLICY "Admins can manage all mountains" ON mountains
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can manage starting points" ON starting_points
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can manage images" ON images
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can manage activities" ON activities
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can manage places" ON places
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can manage walks" ON walks
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can update contact submissions" ON contact_submissions
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_mountains_updated_at BEFORE UPDATE ON mountains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_walks_updated_at BEFORE UPDATE ON walks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Storage Buckets (Create these in Supabase Dashboard)
-- =====================================================

-- After running this schema, create these storage buckets in Supabase Dashboard:
-- 1. 'mountain-images' (public, 10MB limit, allowed: image/jpeg, image/png, image/webp)
-- 2. 'backgrounds' (public, 20MB limit, allowed: image/jpeg, image/png, image/webp)
-- 3. 'gpx-files' (public, 5MB limit, allowed: application/gpx+xml, application/xml)

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Insert a sample mountain
-- INSERT INTO mountains (slug, name, gaelic_name, meaning, height, terrain, views, published, region)
-- VALUES (
--   'slieve-donard',
--   'Slieve Donard',
--   'Sliabh Dhónairt',
--   'Mountain of (St.) Domhangart',
--   850,
--   'Mostly rock if following the Glen river but heather if approaching from most other routes.',
--   'Provides nice views out over Newcastle, Murlough Bay & into some of the other peaks of the mournes.',
--   true,
--   'eastern'
-- );

COMMENT ON TABLE mountains IS 'Main mountain content with Gaelic names and hiking information';
COMMENT ON TABLE starting_points IS 'GPS coordinates and details for mountain trail starting points';
COMMENT ON TABLE images IS 'Image gallery with references to Supabase Storage';
COMMENT ON TABLE activities IS 'Activity pages like fell-running, hiking clubs, triathlons';
COMMENT ON TABLE places IS 'Places of interest like Game of Thrones locations, Mourne Wall';
COMMENT ON TABLE walks IS 'Walking routes with GPX data and difficulty ratings';
COMMENT ON TABLE content_sections IS 'Accordion sections for mountains (Profile, Photograph, etc.)';
COMMENT ON TABLE contact_submissions IS 'Contact form submissions from website visitors';
