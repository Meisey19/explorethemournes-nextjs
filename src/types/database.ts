// Database types for Supabase tables

export interface Mountain {
  id: string;
  slug: string;
  name: string;
  gaelic_name: string | null;
  meaning: string | null;
  height: number | null;
  terrain: string | null;
  views: string | null;
  description: string | null;
  region: string | null;
  photographer_credit: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StartingPoint {
  id: string;
  mountain_id: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  parking_available: boolean;
  difficulty: string | null;
  display_order: number;
}

export interface Image {
  id: string;
  storage_path: string;
  title: string | null;
  caption: string | null;
  photographer_credit: string | null;
  alt_text: string;
  width: number | null;
  height: number | null;
  mountain_id: string | null;
  is_featured: boolean;
  display_order: number;
}
