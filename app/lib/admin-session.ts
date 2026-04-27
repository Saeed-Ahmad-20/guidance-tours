import { cookies } from 'next/headers'
import { signToken, verifyToken } from './session-token'

export const ADMIN_COOKIE = 'gt_admin'
export const ADMIN_SESSION_DAYS = 7

type AdminPayload = {
  u: string // username
  exp: number
}

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s || s.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be set (>= 32 chars).')
  }
  return s
}

export function signAdminSession(username: string): { value: string; maxAge: number } {
  return signToken<{ u: string }>(
    { u: username },
    secret(),
    ADMIN_SESSION_DAYS * 24 * 60 * 60
  )
}

export function verifyAdminSession(cookie: string | undefined): string | null {
  const payload = verifyToken<AdminPayload>(cookie, secret())
  return payload?.u ?? null
}

export async function getAdminUser(): Promise<string | null> {
  const store = await cookies()
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value)
}
