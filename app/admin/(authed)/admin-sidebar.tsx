'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { adminLogout } from '../../actions/admin'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/rooms', label: 'Room allocations' },
  { href: '/admin/finance', label: 'Financial breakdown' },
  { href: '/admin/documents', label: 'Travel documents' },
  { href: '/admin/contacts', label: 'Contacts' },
  { href: '/admin/webinars', label: 'Webinars' },
]

function Panel({ user, onNavigate }: { user: string; onNavigate?: () => void }) {
  const path = usePathname() ?? ''
  const isActive = (href: string) => (href === '/admin' ? path === '/admin' : path === href || path.startsWith(`${href}/`))

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="h-14 px-5 flex items-center text-[#C4A348] font-bold text-sm uppercase tracking-widest border-b border-stone-800 shrink-0"
      >
        Guidance Admin
      </Link>
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Admin pages">
        {NAV.map(l => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            aria-current={isActive(l.href) ? 'page' : undefined}
            className={`block px-5 py-2.5 text-sm border-l-4 transition ${
              isActive(l.href)
                ? 'border-[#C4A348] bg-stone-800 text-white font-medium'
                : 'border-transparent text-stone-300 hover:bg-stone-800/60 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-stone-800 p-4 shrink-0">
        <p className="text-xs text-stone-500 mb-3 truncate">
          signed in as <span className="text-stone-300 font-medium">{user}</span>
        </p>
        <form action={adminLogout}>
          <button
            type="submit"
            className="text-xs text-stone-300 hover:text-white border border-stone-700 hover:border-stone-500 rounded-full px-3 py-1.5 transition"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminSidebar({ user }: { user: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      {/* Desktop: fixed side panel */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 bg-stone-900 border-r border-stone-800 z-30">
        <Panel user={user} />
      </aside>

      {/* Mobile and tablet: top bar that opens the same panel as a drawer */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-stone-900 border-b border-stone-800 px-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="admin-side-panel"
          className="-ml-1 p-2 text-stone-200 hover:text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-[#C4A348] font-bold text-sm uppercase tracking-widest">Guidance Admin</span>
      </header>

      <div className={`lg:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          id="admin-side-panel"
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] bg-stone-900 shadow-xl transition-transform duration-200 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {open && <Panel user={user} onNavigate={() => setOpen(false)} />}
        </aside>
      </div>
    </>
  )
}
