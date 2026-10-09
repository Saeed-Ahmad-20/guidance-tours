'use client'

import { useEffect } from 'react'

// Opens the collapsed <details> that a #hash link points at, so deep links such
// as /haramayn#kaabah show their content.
export default function OpenOnHash() {
  useEffect(() => {
    function openTarget() {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      const el = document.getElementById(id)
      if (el instanceof HTMLDetailsElement) {
        el.open = true
        el.scrollIntoView()
      }
    }
    openTarget()
    window.addEventListener('hashchange', openTarget)
    return () => window.removeEventListener('hashchange', openTarget)
  }, [])

  return null
}
