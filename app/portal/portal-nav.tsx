'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { portalLogout } from '../actions/portal'

const TABS = [
  { path: '', label: 'My Booking' },
  { path: '/itinerary', label: 'Itinerary' },
  { path: '/checklist', label: 'Checklist' },
  { path: '/documents', label: 'Travel Documents' },
  { path: '/webinars', label: 'Webinars' },
]

export default function PortalNav({ base }: { base: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  // Browser path is "/documents" on portal.* and "/portal/documents" elsewhere.
  const current = (usePathname() ?? '').replace(/^\/portal(?=\/|$)/, '').replace(/\/$/, '')

  function onLogout() {
    startTransition(async () => {
      await portalLogout()
      router.refresh()
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
      <nav className="flex gap-1 overflow-x-auto -mb-px">
        {TABS.map(t => {
          const active = current === t.path
          return (
            <Link
              key={t.path}
              href={`${base}${t.path}` || '/'}
              aria-current={active ? 'page' : undefined}
              className={`whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition ${
                active
                  ? 'border-[#C4A348] text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={onLogout}
        disabled={pending}
        className="text-xs text-stone-400 hover:text-stone-700 transition shrink-0 disabled:opacity-50"
      >
        Log out
      </button>
    </div>
  )
}
