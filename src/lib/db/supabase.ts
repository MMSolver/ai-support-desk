import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.',
  );
}

/**
 * Client-safe Supabase client. Uses the public anon key — safe to use in
 * Client Components. Relies on Row Level Security policies for access control.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);

let cachedServiceClient: SupabaseClient<Database> | null = null;

/**
 * Server-only Supabase client using the service role key. This client
 * bypasses Row Level Security and MUST NEVER be imported from any module
 * that can be bundled into client code (no "use client" files, no code
 * reachable from Client Components).
 *
 * Only call this from Route Handlers, Server Components, or other
 * server-side-only code.
 */
export function getServiceSupabase(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceSupabase() must never be called from client-side code.');
  }

  if (cachedServiceClient) {
    return cachedServiceClient;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase service role environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.',
    );
  }

  cachedServiceClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedServiceClient;
}
