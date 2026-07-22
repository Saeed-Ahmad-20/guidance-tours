import { cookies, headers } from 'next/headers'
import { getSessionSecret } from './env'
import { signToken, verifyToken, fingerprintFromHeaders } from './session-token'

export const ADMIN_COOKIE = 'gt_admin'
export const ADMIN_SESSION_DAYS = 7

type AdminPayload = {
  u: string // username
  fp: string // request fingerprint (UA hash)
  exp: number
}

function secret(): string {
  return getSessionSecret('ADMIN_SESSION_SECRET')
}

export async function signAdminSession(username: string): Promise<{ value: string; maxAge: number }> {
  const fp = fingerprintFromHeaders(await headers())
  return signToken<{ u: string; fp: string }>(
    { u: username, fp },
    secret(),
    ADMIN_SESSION_DAYS * 24 * 60 * 60
  )
}

export async function verifyAdminSession(cookie: string | undefined): Promise<string | null> {
  const payload = verifyToken<AdminPayload>(cookie, secret())
  if (!payload) return null
  const fp = fingerprintFromHeaders(await headers())
  if (payload.fp !== fp) return null
  return payload.u
}

export async function getAdminUser(): Promise<string | null> {
  const store = await cookies()
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value)
}
