'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { portalLogin } from '../actions/portal'

export default function LoginForm({
  prefilledCode = '',
  error: initialError = '',
}: {
  prefilledCode?: string
  error?: string
}) {
  const router = useRouter()
  const [code, setCode] = useState(prefilledCode)
  const [surname, setSurname] = useState('')
  const [error, setError] = useState(initialError)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await portalLogin(fd)
      if (r.ok) {
        router.refresh()
      } else {
        setError(r.error)
      }
    })
  }

  return (
    <div className="w-full bg-stone-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Booking portal</h1>
          <p className="text-stone-500 mt-2 text-sm">
            Log in with your reservation number and surname.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm"
        >
          <label className="flex flex-col gap-1.5 text-sm mb-4">
            <span className="text-stone-700 font-medium">Reservation number</span>
            <input
              name="reservation_code"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              maxLength={8}
              minLength={8}
              pattern="[A-Za-z0-9]{8}"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="8 characters, case-sensitive"
              className="rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-mono tracking-widest bg-white focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm mb-5">
            <span className="text-stone-700 font-medium">Surname of lead Passenger</span>
            <input
              name="surname"
              value={surname}
              onChange={e => setSurname(e.target.value)}
              required
              autoComplete="family-name"
              className="rounded-lg border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition"
            />
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          Don&apos;t have a reservation?{' '}
          <Link href="/umrah-2026/book" className="text-[#C4A348] hover:underline">
            Book a place
          </Link>
        </p>
      </div>
    </div>
  )
}
