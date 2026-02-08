import { createClient } from '@/lib/supabase/server';

export interface Place {
  id: string;
  slug: string;
  title: string;
  content: {
    subtitle?: string;
    sections: Array<{
      type: string;
      title: string;
      content: string;
    }>;
    gallery_images?: string[];
    background_image_path?: string;
  };
  latitude?: number;
  longitude?: number;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

export async function getAllPlaces(): Promise<Place[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('published', true)
    .order('title');

  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }

  return data || [];
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching place:', error);
    return null;
  }

  return data;
}
