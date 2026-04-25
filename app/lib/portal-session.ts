import { createHmac, timingSafeEqual } from 'node:crypto'

export const PORTAL_COOKIE = 'gt_portal'
export const PORTAL_SESSION_DAYS = 7

type PortalPayload = {
  rid: string // reservation id
  exp: number // unix seconds
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function b64urlDecode(s: string): Buffer {
  const pad = 4 - (s.length % 4 || 4)
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad === 4 ? 0 : pad)
  return Buffer.from(padded, 'base64')
}

function secret(): string {
  const s = process.env.PORTAL_SESSION_SECRET
  if (!s || s.length < 32) {
    throw new Error('PORTAL_SESSION_SECRET must be set (>= 32 chars).')
  }
  return s
}

export function signPortalSession(reservationId: string): {
  value: string
  maxAge: number
} {
  const maxAge = PORTAL_SESSION_DAYS * 24 * 60 * 60
  const payload: PortalPayload = {
    rid: reservationId,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  }
  const body = b64url(JSON.stringify(payload))
  const sig = b64url(createHmac('sha256', secret()).update(body).digest())
  return { value: `${body}.${sig}`, maxAge }
}

export function verifyPortalSession(cookie: string | undefined): string | null {
  if (!cookie) return null
  const parts = cookie.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  const expected = b64url(createHmac('sha256', secret()).update(body).digest())
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return null
  if (!timingSafeEqual(sigBuf, expBuf)) return null
  try {
    const payload = JSON.parse(b64urlDecode(body).toString('utf8')) as PortalPayload
    if (!payload.rid || !payload.exp) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload.rid
  } catch {
    return null
  }
}
