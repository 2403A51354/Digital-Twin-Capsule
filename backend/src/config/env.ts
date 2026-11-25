import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};

export const isBackendSupabaseConfigured = () => {
  return (
    Boolean(ENV.SUPABASE_URL) &&
    Boolean(ENV.SUPABASE_SERVICE_ROLE_KEY) &&
    !ENV.SUPABASE_URL.includes('your-project-id')
  );
};
