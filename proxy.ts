import { NextResponse, type NextRequest } from 'next/server'

function rewriteUnder(request: NextRequest, prefix: string) {
  const url = request.nextUrl
  if (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)) {
    return NextResponse.next()
  }
  const rewritten = url.clone()
  rewritten.pathname = url.pathname === '/' ? prefix : `${prefix}${url.pathname}`
  return NextResponse.rewrite(rewritten)
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl
  const host = (request.headers.get('host') ?? '').toLowerCase()
  const isLocal =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0') ||
    host.endsWith('.local')

  if (host.startsWith('admin.')) return rewriteUnder(request, '/admin')
  if (host.startsWith('portal.')) {
    if (url.pathname.startsWith('/admin')) return new NextResponse('Not found', { status: 404 })
    return rewriteUnder(request, '/portal')
  }

  // Hide the admin area from the main public domain in production.
  if (!isLocal && url.pathname.startsWith('/admin')) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Once PORTAL_SITE_URL is set (i.e. the portal subdomain is live), send old
  // www.../portal links there so passengers land on the canonical host.
  const portalOrigin = process.env.PORTAL_SITE_URL
  if (portalOrigin && !isLocal && (url.pathname === '/portal' || url.pathname.startsWith('/portal/'))) {
    const target = new URL(url.pathname.slice('/portal'.length) || '/', portalOrigin)
    target.search = url.search
    return NextResponse.redirect(target, 307)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)'],
}
