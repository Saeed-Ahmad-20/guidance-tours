'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminLogin } from '../../actions/admin'

export default function AdminLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await adminLogin(fd)
      if (r.ok) router.push('/admin')
      else setError(r.error)
    })
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[#C4A348] text-xs font-bold uppercase tracking-[0.3em]">Guidance Tours</p>
          <h1 className="text-white text-2xl font-bold mt-2">Admin sign in</h1>
        </div>
        <form
          onSubmit={submit}
          className="bg-stone-800 border border-stone-700 rounded-2xl p-6 shadow-2xl"
          autoComplete="off"
        >
          <label className="flex flex-col gap-1.5 text-sm mb-4">
            <span className="text-stone-300 font-medium">Username</span>
            <input
              name="username"
              required
              autoComplete="username"
              className="rounded-lg border border-stone-600 bg-stone-900 text-white px-3 py-2.5 text-sm focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm mb-5">
            <span className="text-stone-300 font-medium">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-stone-600 bg-stone-900 text-white px-3 py-2.5 text-sm focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition"
            />
          </label>
          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-700/50 p-3 text-sm text-red-200 mb-4">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#C4A348] text-stone-900 font-bold text-sm hover:bg-[#E8D48B] transition disabled:opacity-50"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-xs text-stone-500 mt-6">
          Authorised personnel only.
        </p>
      </div>
    </div>
  )
}
