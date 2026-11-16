/**
 * Initialize Supabase JavaScript client with graceful detection of valid credentials vs local backend auth.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verify that the credentials are true production/dev keys and not placeholder template strings
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('...')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Retrieve current user's JWT access token for API requests.
 */
export async function getAccessToken(): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        return data.session.access_token;
      }
    } catch (e) {
      console.warn('Supabase getSession failed:', e);
    }
  }

  // Persistent native JWT token from backend auth
  const localToken = localStorage.getItem('teravia_auth_token');
  return localToken || null;
}
