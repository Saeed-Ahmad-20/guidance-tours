'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { portalLogout } from '../actions/portal'
import { GROUPS } from './portal-groups'

const TABS = GROUPS.flatMap(g => [{ path: g.path, label: g.label }, ...g.tabs])

export default function PortalNav({ base }: { base: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  // Desktop sub-bar the passenger opened or closed on this page; otherwise the current category's bar shows.
  const [barOverride, setBarOverride] = useState<{ path: string; group: string | null } | null>(null)
  // Side menu categories the passenger has opened or closed; until then the current one is open.
  const [sideOpen, setSideOpen] = useState<string[] | null>(null)
  // Browser path is "/documents" on portal.* and "/portal/documents" elsewhere.
  const current = (usePathname() ?? '').replace(/^\/portal(?=\/|$)/, '').replace(/\/$/, '')
  const currentGroup = GROUPS.find(g => g.path === current || g.tabs.some(t => t.path === current))
  const openGroup = barOverride?.path === current ? barOverride.group : (currentGroup?.label ?? null)
  const sideOpenNow = sideOpen ?? (currentGroup ? [currentGroup.label] : [])
  const expandedGroup = GROUPS.find(g => g.label === openGroup)
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
    <>
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

      {/* Desktop: category tabs, with the pages of the current category underneath */}
      <nav className="hidden sm:flex gap-1 -mb-px" aria-label="Categories">
        {GROUPS.map(g => {
          const active = g === currentGroup
          const open = openGroup === g.label
          return (
            <div key={g.label} className="relative flex">
              <Link
                href={`${base}${g.path}`}
                onClick={() => setBarOverride(null)}
                aria-current={active ? 'true' : undefined}
                className={`whitespace-nowrap pl-3 pr-1 py-2.5 text-sm font-medium border-b-2 transition ${
                  active
                    ? 'border-[#C4A348] text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                {g.label}
              </Link>
              <button
                type="button"
                onClick={() => setBarOverride({ path: current, group: open ? null : g.label })}
                aria-expanded={open}
                aria-label={`Show ${g.label} pages`}
                className={`pr-2 pl-0.5 py-2.5 border-b-2 text-stone-400 hover:text-stone-900 transition ${
                  active ? 'border-[#C4A348]' : 'border-transparent'
                }`}
              >
                <span aria-hidden className={`block text-base leading-none transition-transform ${open ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>
            </div>
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
            {GROUPS.map(g => {
              const open = sideOpenNow.includes(g.label)
              return (
                <div key={g.label} className="pb-1">
                  <div className="flex items-center pr-2">
                    <Link
                      href={`${base}${g.path}`}
                      onClick={() => setMenuOpen(false)}
                      tabIndex={menuOpen ? 0 : -1}
                      aria-current={current === g.path ? 'page' : undefined}
                      className={`flex-1 px-5 py-3 text-[11px] font-bold uppercase tracking-widest hover:underline ${
                        current === g.path ? 'text-stone-900' : 'text-[#8a6e1f]'
                      }`}
                    >
                      {g.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSideOpen(open ? sideOpenNow.filter(l => l !== g.label) : [...sideOpenNow, g.label])}
                      aria-expanded={open}
                      aria-label={`${open ? 'Hide' : 'Show'} ${g.label} pages`}
                      tabIndex={menuOpen ? 0 : -1}
                      className="p-2 text-stone-500 hover:text-stone-900"
                    >
                      <span aria-hidden className={`block text-xl leading-none transition-transform ${open ? 'rotate-180' : ''}`}>
                        ⌄
                      </span>
                    </button>
                  </div>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      {g.tabs.map(t => {
                        const active = current === t.path
                        return (
                          <Link
                            key={t.path}
                            href={`${base}${t.path}` || '/'}
                            onClick={() => setMenuOpen(false)}
                            tabIndex={menuOpen && open ? 0 : -1}
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
                    </div>
                  </div>
                </div>
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

    {expandedGroup && (
      <div key={expandedGroup.label} className="portal-reveal hidden sm:block border-t border-stone-100 bg-stone-50/60">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-2 py-2 overflow-x-auto" aria-label={expandedGroup.label}>
          {expandedGroup.tabs.map(t => {
            const active = current === t.path
            return (
              <Link
                key={t.path}
                href={`${base}${t.path}` || '/'}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-sm transition ${
                  active ? 'bg-[#2C1F0E] text-white font-medium' : 'text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                {t.label}
              </Link>
            )
          })}
        </nav>
      </div>
    )}
    </>
  )
}
