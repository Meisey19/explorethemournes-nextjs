import { createClient } from '@/lib/supabase/server';
import { Mountain, StartingPoint, Image } from '@/types/database';

export interface MountainWithRelations extends Mountain {
  starting_points: StartingPoint[];
  images: Image[];
}

export async function getMountainBySlug(slug: string): Promise<MountainWithRelations | null> {
  const supabase = await createClient();

  // Fetch mountain data
  const { data: mountain, error: mountainError } = await supabase
    .from('mountains')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (mountainError || !mountain) {
    console.error('Error fetching mountain:', mountainError);
    return null;
  }

  // Fetch starting points
  const { data: startingPoints, error: startingPointsError } = await supabase
    .from('starting_points')
    .select('*')
    .eq('mountain_id', mountain.id)
    .order('display_order');

  if (startingPointsError) {
    console.error('Error fetching starting points:', startingPointsError);
  }

  // Fetch images
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('*')
    .eq('mountain_id', mountain.id);

  if (imagesError) {
    console.error('Error fetching images:', imagesError);
  }

  return {
    ...mountain,
    starting_points: startingPoints || [],
    images: images || [],
  };
}

export async function getAllMountains(): Promise<Mountain[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mountains')
    .select('*')
    .eq('published', true)
    .order('name');

  if (error) {
    console.error('Error fetching mountains:', error);
    return [];
  }

  return data || [];
}
