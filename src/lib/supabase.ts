import { createClient } from '@supabase/supabase-js';

// Public Supabase credentials (safe to include in client code)
const supabaseUrl = 'https://pxhpfewunsetuxygeprp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4aHBmZXd1bnNldHV4eWdlcHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTkwODMsImV4cCI6MjA4NDA5NTA4M30.HcALCU_gFnuHcIOAIK6lx89rFmuBfbNGRKMM8hMubjg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = true;
