import { headers } from 'next/headers'

// Best-effort in-memory rate limiter. Module-level Map is per-instance, so on
// serverless this only catches the lazy/casual case — a determined attacker
// can hop between warm instances. Replace with Supabase- or Redis-backed
// counters once we have a persistent store wired up.
type Bucket = { count: number; firstAt: number }
const buckets = new Map<string, Map<string, Bucket>>()

// Hard cap per scope to bound memory on long-lived Fluid Compute instances.
// When exceeded, we evict expired entries first, then the oldest by firstAt.
const MAX_KEYS_PER_SCOPE = 5000

export async function clientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0].trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}

function evict(scoped: Map<string, Bucket>, windowMs: number, now: number) {
  for (const [k, v] of scoped) {
    if (now - v.firstAt > windowMs) scoped.delete(k)
  }
  if (scoped.size <= MAX_KEYS_PER_SCOPE) return
  const sorted = [...scoped.entries()].sort((a, b) => a[1].firstAt - b[1].firstAt)
  const toRemove = scoped.size - MAX_KEYS_PER_SCOPE
  for (let i = 0; i < toRemove; i++) scoped.delete(sorted[i][0])
}

export function checkRateLimit(
  scope: string,
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now()
  let scoped = buckets.get(scope)
  if (!scoped) {
    scoped = new Map()
    buckets.set(scope, scoped)
  }
  const entry = scoped.get(key)
  if (!entry || now - entry.firstAt > windowMs) {
    if (scoped.size >= MAX_KEYS_PER_SCOPE) evict(scoped, windowMs, now)
    scoped.set(key, { count: 1, firstAt: now })
    return true
  }
  entry.count++
  return entry.count <= max
}

export function resetRateLimit(scope: string, key: string): void {
  buckets.get(scope)?.delete(key)
}
