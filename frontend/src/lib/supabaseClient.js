import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
const isConfigured =
  url && key &&
  !url.includes('your_') &&
  !key.includes('your_');

export const supabase = isConfigured ? createClient(url, key) : null;
export const isSupabaseConfigured = !!supabase;
