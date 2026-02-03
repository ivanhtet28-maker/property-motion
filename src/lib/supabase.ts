import { createClient } from '@supabase/supabase-js';

// Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pxhpfewunsetuxygeprp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set. Supabase functionality will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');

export const isSupabaseConfigured = !!supabaseAnonKey;
