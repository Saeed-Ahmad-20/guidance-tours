import { signToken, verifyToken } from './session-token'

export const PORTAL_COOKIE = 'gt_portal'
export const PORTAL_SESSION_DAYS = 7

type PortalPayload = {
  rid: string // reservation id
  exp: number
}

function secret(): string {
  const s = process.env.PORTAL_SESSION_SECRET
  if (!s || s.length < 32) {
    throw new Error('PORTAL_SESSION_SECRET must be set (>= 32 chars).')
  }
  return s
}

export function signPortalSession(reservationId: string): { value: string; maxAge: number } {
  return signToken<{ rid: string }>(
    { rid: reservationId },
    secret(),
    PORTAL_SESSION_DAYS * 24 * 60 * 60
  )
}

export function verifyPortalSession(cookie: string | undefined): string | null {
  const payload = verifyToken<PortalPayload>(cookie, secret())
  return payload?.rid ?? null
}
