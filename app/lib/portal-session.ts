import { headers } from 'next/headers'
import { getSessionSecret } from './env'
import { signToken, verifyToken, fingerprintFromHeaders } from './session-token'

export const PORTAL_COOKIE = 'gt_portal'
export const PORTAL_SESSION_DAYS = 7

type PortalPayload = {
  rid: string // reservation id
  fp: string // request fingerprint (UA hash)
  exp: number
}

function secret(): string {
  return getSessionSecret('PORTAL_SESSION_SECRET')
}

export async function signPortalSession(reservationId: string): Promise<{ value: string; maxAge: number }> {
  const fp = fingerprintFromHeaders(await headers())
  return signToken<{ rid: string; fp: string }>(
    { rid: reservationId, fp },
    secret(),
    PORTAL_SESSION_DAYS * 24 * 60 * 60
  )
}

export async function verifyPortalSession(cookie: string | undefined): Promise<string | null> {
  const payload = verifyToken<PortalPayload>(cookie, secret())
  if (!payload) return null
  const fp = fingerprintFromHeaders(await headers())
  if (payload.fp !== fp) return null
  return payload.rid
}
