import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Build-safe: createClient won't crash during next build prerendering
// even if env vars are empty strings. Actual calls only happen client-side.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
