import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Provide placeholder values so createClient doesn't throw an error immediately.
// App.tsx will check the actual environment variables and show a setup screen if they are missing.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
