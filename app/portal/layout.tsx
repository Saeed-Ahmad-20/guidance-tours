import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  getPortalSession,
  portalBasePath,
  publicSiteHref,
} from '../lib/portal-session'
import PortalNav from './portal-nav'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Passenger Portal · Guidance Tours',
  robots: { index: false, follow: false },
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [session, base, homeHref] = await Promise.all([
    getPortalSession(),
    portalBasePath(),
    publicSiteHref('/'),
  ])

  return (
    <div className="flex-1 flex flex-col bg-stone-50" data-portal-shell>
      <header className="bg-[#F8F7F3] border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href={base || '/'} className="flex items-center gap-3 min-w-0">
            <Image src="/images/logo.png" alt="" width={32} height={32} className="rounded-sm" />
            <span className="font-semibold text-stone-900 tracking-tight truncate">
              Guidance Tours{' '}
              <span className="text-[#C4A348] font-medium">Passenger Portal</span>
            </span>
          </Link>
          <a
            href={homeHref}
            className="hidden sm:inline text-sm text-stone-500 hover:text-stone-900 transition shrink-0"
          >
            Main website ↗
          </a>
        </div>
        {session && <PortalNav base={base} />}
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-stone-200 text-stone-400 text-center text-xs py-5 px-6">
        © {new Date().getFullYear()} Guidance Tours · Need help? WhatsApp{' '}
        <a href="https://wa.me/447983432900" className="text-[#C4A348] hover:underline">
          07983 432 900
        </a>
      </footer>
    </div>
  )
}
