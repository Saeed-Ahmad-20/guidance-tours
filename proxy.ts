import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const url = request.nextUrl
  const host = (request.headers.get('host') ?? '').toLowerCase()
  const isAdminSubdomain = host.startsWith('admin.')
  const isLocal =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0') ||
    host.endsWith('.local')

  if (isAdminSubdomain) {
    if (!url.pathname.startsWith('/admin')) {
      const rewritten = url.clone()
      rewritten.pathname = url.pathname === '/' ? '/admin' : `/admin${url.pathname}`
      return NextResponse.rewrite(rewritten)
    }
    return NextResponse.next()
  }

  // Hide the admin area from the main public domain in production.
  if (!isLocal && url.pathname.startsWith('/admin')) {
    return new NextResponse('Not found', { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)'],
}
