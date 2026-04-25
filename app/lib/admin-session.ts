import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'gt_admin'
export const ADMIN_SESSION_DAYS = 7

type AdminPayload = {
  u: string // username
  exp: number
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
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s || s.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be set (>= 32 chars).')
  }
  return s
}

export function signAdminSession(username: string): { value: string; maxAge: number } {
  const maxAge = ADMIN_SESSION_DAYS * 24 * 60 * 60
  const payload: AdminPayload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  }
  const body = b64url(JSON.stringify(payload))
  const sig = b64url(createHmac('sha256', secret()).update(body).digest())
  return { value: `${body}.${sig}`, maxAge }
}

export function verifyAdminSession(cookie: string | undefined): string | null {
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
    const payload = JSON.parse(b64urlDecode(body).toString('utf8')) as AdminPayload
    if (!payload.u || !payload.exp) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload.u
  } catch {
    return null
  }
}

export async function getAdminUser(): Promise<string | null> {
  const store = await cookies()
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value)
}
