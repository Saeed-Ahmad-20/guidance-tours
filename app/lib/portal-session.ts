import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionSecret } from './env'
import { signToken, verifyToken, fingerprintFromHeaders } from './session-token'

export const PORTAL_COOKIE = 'gt_portal'
export const PORTAL_SESSION_DAYS = 7

// One session per passenger. The lead passenger (who booked and pays) sees
// the whole booking; everyone else sees only their own details and documents.
export type PortalSession = {
  rid: string // reservation id
  pid: string // reservation_passengers id of the signed-in passenger
  lead: boolean
}

type PortalPayload = PortalSession & {
  fp: string // request fingerprint (UA hash)
  exp: number
}

function secret(): string {
  return getSessionSecret('PORTAL_SESSION_SECRET')
}

export async function signPortalSession(session: PortalSession): Promise<{ value: string; maxAge: number }> {
  const fp = fingerprintFromHeaders(await headers())
  return signToken<PortalSession & { fp: string }>(
    { rid: session.rid, pid: session.pid, lead: session.lead, fp },
    secret(),
    PORTAL_SESSION_DAYS * 24 * 60 * 60
  )
}

export async function getPortalSession(): Promise<PortalSession | null> {
  const store = await cookies()
  const payload = verifyToken<PortalPayload>(store.get(PORTAL_COOKIE)?.value, secret())
  // Tokens from before per-passenger logins carry no pid; force a fresh login.
  if (!payload || !payload.pid) return null
  const fp = fingerprintFromHeaders(await headers())
  if (payload.fp !== fp) return null
  return { rid: payload.rid, pid: payload.pid, lead: payload.lead === true }
}

async function isPortalSubdomain(): Promise<boolean> {
  const host = ((await headers()).get('host') ?? '').toLowerCase()
  return host.startsWith('portal.')
}

// On portal.* the proxy maps "/x" to "/portal/x", so links there drop the
// prefix; on the main domain (and localhost) they keep it.
export async function portalBasePath(): Promise<string> {
  return (await isPortalSubdomain()) ? '' : '/portal'
}

// Public-site links from inside the portal must be absolute on portal.*,
// otherwise the proxy would rewrite them into /portal/*.
export async function publicSiteHref(path: string): Promise<string> {
  if (!(await isPortalSubdomain())) return path
  return `${process.env.SITE_URL || 'https://www.guidancetours.co.uk'}${path}`
}

export async function requirePortalSession(): Promise<PortalSession> {
  const session = await getPortalSession()
  if (!session) redirect((await portalBasePath()) || '/')
  return session
}
