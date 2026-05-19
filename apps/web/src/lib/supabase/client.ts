/**
 * Supabase clients for SmartShopper.
 *
 * ALL Supabase access in this app is server-side (the /api/prices route,
 * the /admin/prices RSC, the scraper). So we use plain runtime env vars —
 * NOT `NEXT_PUBLIC_*`. The NEXT_PUBLIC prefix triggers Next.js build-time
 * inlining: if the var isn't present when `next build` runs it gets baked
 * in as `undefined` and a later redeploy can't fix it. Plain `SUPABASE_*`
 * vars are read fresh at request time.
 *
 * Env vars (set in Vercel → Settings → Environment Variables, Production):
 *   - SUPABASE_URL                 — project URL
 *   - SUPABASE_ANON_KEY            — publishable key (RLS-protected reads)
 *   - SUPABASE_SERVICE_ROLE_KEY    — admin key (writes; cron only)
 *
 * For backwards-compat we also accept the NEXT_PUBLIC_ variants.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

function url(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}
function anonKey(): string | undefined {
  return process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
function serviceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

let _readClient: SupabaseClient<Database> | null = null;
let _serverClient: SupabaseClient<Database> | null = null;

/** True when at least the read client can be constructed. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url() && (anonKey() || serviceKey()));
}

/**
 * Read client. Prefers the anon key (RLS applies); falls back to the
 * service-role key so a misconfigured anon key doesn't take the whole
 * read path down — the data behind it (prices/products/retailers) is
 * public anyway. Returns null only when no key at all is available.
 */
export function readClient(): SupabaseClient<Database> | null {
  const u = url();
  const key = anonKey() ?? serviceKey();
  if (!u || !key) return null;
  if (!_readClient) {
    _readClient = createClient<Database>(u, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _readClient;
}

/**
 * Service-role client. Bypasses RLS. Server-side only — never import from
 * a client component.
 */
export function serverClient(): SupabaseClient<Database> | null {
  const u = url();
  const key = serviceKey();
  if (!u || !key) return null;
  if (!_serverClient) {
    _serverClient = createClient<Database>(u, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _serverClient;
}
