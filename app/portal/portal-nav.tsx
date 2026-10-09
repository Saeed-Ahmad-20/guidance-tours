'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { portalLogout } from '../actions/portal'

const TABS = [
  { path: '', label: 'My Booking' },
  { path: '/itinerary', label: 'Itinerary' },
  { path: '/checklist', label: 'Checklist' },
  { path: '/documents', label: 'Travel Documents' },
  { path: '/historical-sites', label: 'Historical Sites' },
  { path: '/haramayn', label: 'Haramayn' },
  { path: '/webinars', label: 'Webinars' },
  { path: '/pdf', label: 'PDF' },
]

export default function PortalNav({ base }: { base: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  // Browser path is "/documents" on portal.* and "/portal/documents" elsewhere.
  const current = (usePathname() ?? '').replace(/^\/portal(?=\/|$)/, '').replace(/\/$/, '')
  const currentLabel = TABS.find(t => t.path === current)?.label ?? 'Menu'

  function onLogout() {
    setMenuOpen(false)
    startTransition(async () => {
      await portalLogout()
      router.refresh()
    })
  }

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile: hamburger that opens a left-hand side menu */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="portal-side-menu"
        className="sm:hidden flex items-center gap-2.5 py-2.5 -ml-1 text-sm font-medium text-stone-900"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {currentLabel}
      </button>

      {/* Desktop: horizontal tabs */}
      <nav className="hidden sm:flex gap-1 overflow-x-auto -mb-px">
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
        className="hidden sm:block text-xs text-stone-400 hover:text-stone-700 transition shrink-0 disabled:opacity-50"
      >
        Log out
      </button>

      {/* Side menu (mobile only) */}
      <div className={`sm:hidden fixed inset-0 z-50 ${menuOpen ? '' : 'pointer-events-none'}`} aria-hidden={!menuOpen}>
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          id="portal-side-menu"
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] bg-[#F8F7F3] shadow-xl flex flex-col transition-transform duration-200 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-stone-200">
            <span className="font-semibold text-stone-900">Menu</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 -mr-2 text-stone-500 hover:text-stone-900"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {TABS.map(t => {
              const active = current === t.path
              return (
                <Link
                  key={t.path}
                  href={`${base}${t.path}` || '/'}
                  onClick={() => setMenuOpen(false)}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? 'page' : undefined}
                  className={`block px-5 py-3 text-sm font-medium border-l-4 transition ${
                    active
                      ? 'border-[#C4A348] bg-white text-stone-900'
                      : 'border-transparent text-stone-600 hover:bg-white hover:text-stone-900'
                  }`}
                >
                  {t.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-stone-200 p-4">
            <button
              onClick={onLogout}
              disabled={pending}
              tabIndex={menuOpen ? 0 : -1}
              className="text-sm text-stone-500 hover:text-stone-900 transition disabled:opacity-50"
            >
              Log out
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
