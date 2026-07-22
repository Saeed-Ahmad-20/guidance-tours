import { headers } from 'next/headers'

// Next.js Server Actions enforce Origin === Host by default, but the check
// only runs for requests Next recognises as actions. Re-validating here gives
// us defence in depth: any state-changing action that calls assertSameOrigin()
// fails closed if the Origin/Referer header is missing or points at another
// site, which blocks classic CSRF and clickjacked-form submissions even if
// the framework guard regresses.

export class CsrfError extends Error {
  constructor() { super('CSRF: cross-origin request rejected.') }
}

function hostOf(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

export async function assertSameOrigin(): Promise<void> {
  const h = await headers()
  const host = h.get('host')
  if (!host) throw new CsrfError()

  const originHost = hostOf(h.get('origin'))
  const refererHost = hostOf(h.get('referer'))

  // We accept either header as long as it matches the request Host. Some
  // privacy modes strip Referer; some user-agents strip Origin on same-origin
  // navigations — requiring both would lock out legitimate users.
  const matched =
    (originHost !== null && originHost === host) ||
    (refererHost !== null && refererHost === host)

  if (!matched) throw new CsrfError()
}
