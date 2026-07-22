import { headers } from 'next/headers'
import { supabaseAdmin } from './supabase-admin'

// Rate limits are persisted in Supabase (`rate_limits` table) so they hold
// across Fluid Compute instances and serverless cold starts. The in-memory
// Map below is a *fallback only* — used if the DB call errors so that the
// site does not hard-fail when Supabase is briefly unreachable. A determined
// attacker bypassing the persistent layer would have to take Supabase down
// first, at which point booking writes are also blocked.
type Bucket = { count: number; firstAt: number }
const localFallback = new Map<string, Map<string, Bucket>>()
const MAX_KEYS_PER_SCOPE = 5000

export async function clientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0].trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}

function evictLocal(scoped: Map<string, Bucket>, windowMs: number, now: number) {
  for (const [k, v] of scoped) {
    if (now - v.firstAt > windowMs) scoped.delete(k)
  }
  if (scoped.size <= MAX_KEYS_PER_SCOPE) return
  const sorted = [...scoped.entries()].sort((a, b) => a[1].firstAt - b[1].firstAt)
  const toRemove = scoped.size - MAX_KEYS_PER_SCOPE
  for (let i = 0; i < toRemove; i++) scoped.delete(sorted[i][0])
}

function checkLocal(scope: string, key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  let scoped = localFallback.get(scope)
  if (!scoped) {
    scoped = new Map()
    localFallback.set(scope, scoped)
  }
  const entry = scoped.get(key)
  if (!entry || now - entry.firstAt > windowMs) {
    if (scoped.size >= MAX_KEYS_PER_SCOPE) evictLocal(scoped, windowMs, now)
    scoped.set(key, { count: 1, firstAt: now })
    return true
  }
  entry.count++
  return entry.count <= max
}

export async function checkRateLimit(
  scope: string,
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  try {
    const db = supabaseAdmin()
    const windowSeconds = Math.ceil(windowMs / 1000)
    const { data, error } = await db.rpc('check_rate_limit', {
      p_scope: scope,
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      console.error('[rate-limit] db error, falling back to local:', error.message)
      return checkLocal(scope, key, max, windowMs)
    }
    // RPC returns true if request is allowed, false if over limit.
    return Boolean(data)
  } catch (e) {
    console.error('[rate-limit] unexpected error, falling back to local:', e)
    return checkLocal(scope, key, max, windowMs)
  }
}

export async function resetRateLimit(scope: string, key: string): Promise<void> {
  try {
    const db = supabaseAdmin()
    await db.rpc('reset_rate_limit', { p_scope: scope, p_key: key })
  } catch (e) {
    console.error('[rate-limit] reset failed:', e)
  }
  localFallback.get(scope)?.delete(key)
}
