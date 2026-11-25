import { createClient } from '@supabase/supabase-js';
import { ENV, isBackendSupabaseConfigured } from '../config/env.js';

let supabaseClient: any = null;

if (isBackendSupabaseConfigured()) {
  supabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ Connected to Supabase with Service Role privileges.');
} else {
  console.warn(
    '⚠️ Backend running with fallback in-memory store. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env for production database access.'
  );
}

export const getSupabase = () => supabaseClient;
