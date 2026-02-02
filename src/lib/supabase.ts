import { createClient } from '@supabase/supabase-js';

// Public Supabase credentials (safe to include in client code)
const supabaseUrl = 'https://pxhpfewunsetuxygeprp.supabase.co';
const supabaseAnonKey = 'sb_publishable_dZfmgOW6Z1N2FYNtiaDLMQ_Q27bxxAQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = true;
