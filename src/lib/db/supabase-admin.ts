import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Server-only Supabase client using the service role key. This client
 * bypasses Row Level Security.
 *
 * The `server-only` import above makes this a build-time guarantee: bundling
 * this module into any Client Component fails the build instead of leaking
 * the service role key into the browser at runtime.
 *
 * Only call this from Route Handlers, Server Components, or other
 * server-side-only code.
 */

let cachedServiceClient: SupabaseClient<Database> | null = null;

export function getServiceSupabase(): SupabaseClient<Database> {
  if (cachedServiceClient) {
    return cachedServiceClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
