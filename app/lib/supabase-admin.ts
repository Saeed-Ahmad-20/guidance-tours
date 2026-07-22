import 'server-only'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdminConfig } from './env'

// SECURITY: This client uses the service-role key, which bypasses Row Level
// Security. It must NEVER be returned to the browser or imported by a Client
// Component. The `server-only` import above is enforced by Next.js at build
// time. Server Actions and Route Handlers should still call requireAdmin() /
// verifyPortalSession() before any read or write — RLS is not the auth layer
// here, our session middleware is.

let cached: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached
  const { url, serviceRoleKey } = getSupabaseAdminConfig()
  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as SupabaseClient
  return cached
}
