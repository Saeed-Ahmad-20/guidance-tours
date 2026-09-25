'use client'

import { usePathname } from 'next/navigation'

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/portal')) return null

  return (
    <footer data-site-chrome className="border-t border-stone-200 text-stone-400 text-center text-xs py-5 px-6">
      © {new Date().getFullYear()} Guidance Tours · All rights reserved
    </footer>
  )
}
