import { createClient } from '@/lib/supabase/server';

export interface Activity {
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
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

export async function getAllActivities(): Promise<Activity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('published', true)
    .order('title');

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return data || [];
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching activity:', error);
    return null;
  }

  return data;
}
