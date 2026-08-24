import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Export a client that can be used across the app. This file intentionally
// does not use any service role key — only the publishable key from env.
export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
