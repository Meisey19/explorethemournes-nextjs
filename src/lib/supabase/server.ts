import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
  // Simplified server client for proof of concept
  // Auth features can be added later when needed
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
