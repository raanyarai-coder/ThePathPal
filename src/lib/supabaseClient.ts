import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://pzzrgstawlqxanfdjnbq.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6enJnc3Rhd2xxeGFuZmRqbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNzAxOTMsImV4cCI6MjEwMTk0NjE5M30.W6E0k16XXSLqp2NmiTecviaXYOPEsX2wZjV3DacvlSA';

export function getValidSupabaseUrl(): string {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const rawUrl = typeof envUrl === 'string' && envUrl.trim().length > 0 ? envUrl.trim() : DEFAULT_SUPABASE_URL;
  try {
    let formatted = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;
    const parsed = new URL(formatted);
    // If hostname does not contain a dot (e.g. 'pzzrgstawlqxanfdjnbq'), append '.supabase.co'
    if (!parsed.hostname.includes('.')) {
      parsed.hostname = `${parsed.hostname}.supabase.co`;
    }
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    // Fallback
  }
  return DEFAULT_SUPABASE_URL;
}

export function getValidSupabaseAnonKey(): string {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

export const SUPABASE_URL = getValidSupabaseUrl();
export const SUPABASE_ANON_KEY = getValidSupabaseAnonKey();

/**
 * Custom fetch implementation for Supabase client that adds detailed error logging
 * for failed network requests and HTTP error responses.
 */
const customFetch: typeof fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      console.warn(`[Supabase Fetch] HTTP ${response.status} ${response.statusText} - ${urlStr}`);
    }
    return response;
  } catch (error: any) {
    console.warn(`[Supabase Fetch] Network request to ${urlStr} failed:`, error?.message || error);
    throw error;
  }
};

/**
 * Centralized Supabase client instance initialized with environment variables
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, featuring custom fetch logging.
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: customFetch,
  },
});

export const supabaseClient = supabase;
export default supabase;
