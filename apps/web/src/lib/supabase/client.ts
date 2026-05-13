/**
 * Supabase clients for SmartShopper.
 *
 * - `serverClient()` — service-role (admin), only used in API routes / cron
 *   workers. Bypasses RLS. NEVER imported from client components.
 * - `readClient()` — anon (publishable) key. Read-only access protected by
 *   RLS. Safe to use from any server-side context (RSC, API route). For
 *   browser-side reads, prefer fetching through our own /api/* routes so
 *   the keys stay out of the bundle.
 *
 * Env vars required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY (publishable)
 *   - SUPABASE_SERVICE_ROLE_KEY (server-only, for writes)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _readClient: SupabaseClient<Database> | null = null;
let _serverClient: SupabaseClient<Database> | null = null;

/** Returns true when the Supabase client can be constructed. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/**
 * Read-only client using the anon key. RLS still applies. Safe to call
 * from any environment but the env vars must be set.
 */
export function readClient(): SupabaseClient<Database> | null {
  if (!url || !anonKey) return null;
  if (!_readClient) {
    _readClient = createClient<Database>(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _readClient;
}

/**
 * Service-role client. Bypasses RLS. Only call from server-side code
 * (API routes, cron workers) — never from a client component.
 */
export function serverClient(): SupabaseClient<Database> | null {
  if (!url || !serviceKey) return null;
  if (!_serverClient) {
    _serverClient = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _serverClient;
}
