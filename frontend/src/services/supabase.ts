import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  !supabaseUrl.includes('your-project-id');

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase credentials not yet configured in frontend/.env. Running in interactive demo mode. Update frontend/.env with your real Supabase project URL and Anon key to activate real database authentication.'
  );
}

// Create and export the Supabase client
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = () => isConfigured;
