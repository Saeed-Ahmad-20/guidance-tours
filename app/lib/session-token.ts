import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

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

export function signToken<P extends object>(
  payload: P,
  secret: string,
  ttlSeconds: number
): { value: string; maxAge: number } {
  const body = b64url(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })
  )
  const sig = b64url(createHmac('sha256', secret).update(body).digest())
  return { value: `${body}.${sig}`, maxAge: ttlSeconds }
}

export function verifyToken<P extends { exp: number }>(
  cookie: string | undefined,
  secret: string
): P | null {
  if (!cookie) return null
  const parts = cookie.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  const expected = b64url(createHmac('sha256', secret).update(body).digest())
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return null
  if (!timingSafeEqual(sigBuf, expBuf)) return null
  try {
    const payload = JSON.parse(b64urlDecode(body).toString('utf8')) as P
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// Bind a session token to a coarse client fingerprint so a stolen cookie
// replayed from a different browser is rejected. We hash User-Agent only
// (Accept-Language is too unstable across navigations); IP would invalidate
// sessions on every mobile-network handover.
export function fingerprintFromHeaders(h: Headers): string {
  const ua = h.get('user-agent') ?? ''
  return createHash('sha256').update(ua).digest('base64url').slice(0, 16)
}
