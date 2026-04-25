'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/umrah-2026', label: 'Umrah 2026' },
  { href: '/portal', label: 'My Booking' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname?.startsWith('/admin')) return null

  return (
    <nav className="bg-[#F8F7F3] border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Guidance Tours"
            width={36}
            height={36}
            className="rounded-sm"
          />
          <span className="font-semibold text-stone-900 text-base tracking-tight">
            Guidance Tours
          </span>
        </Link>

        <ul className="hidden sm:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-base font-medium transition-colors ${
                  pathname === href
                    ? 'text-[#C4A348]'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="sm:hidden p-2 text-stone-600 hover:text-stone-900"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <ul className="sm:hidden border-t border-stone-200 px-6 py-4 flex flex-col items-center gap-4 bg-[#F8F7F3]">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'text-[#C4A348]'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
