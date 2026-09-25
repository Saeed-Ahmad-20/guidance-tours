'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createWebinar, deleteWebinar } from '../../../actions/admin'

export type AdminWebinar = {
  id: string
  title: string
  description: string | null
  video_url: string
  recorded_on: string | null
}

export default function WebinarManager({ webinars }: { webinars: AdminWebinar[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await createWebinar(fd)
      if (r.ok) {
        formRef.current?.reset()
        router.refresh()
      } else {
        setError(r.error)
      }
    })
  }

  function onDelete(w: AdminWebinar) {
    if (!confirm(`Remove "${w.title}" from the portal?`)) return
    setError(null)
    startTransition(async () => {
      const r = await deleteWebinar(w.id)
      if (r.ok) router.refresh()
      else setError(r.error)
    })
  }

  const inputCls =
    'rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition w-full'

  return (
    <>
      <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Add a recording</h2>
        <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-stone-600 sm:col-span-2">
            Title
            <input name="title" required maxLength={200} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-600">
            Video link
            <input
              name="video_url"
              type="url"
              required
              placeholder="https://youtu.be/…"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-600">
            Recorded on (optional)
            <input name="recorded_on" type="date" className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-600 sm:col-span-2">
            Description (optional)
            <textarea name="description" rows={3} maxLength={4000} className={inputCls} />
          </label>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Add webinar'}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-3">
          Published ({webinars.length})
        </h2>
        {webinars.length === 0 ? (
          <p className="text-sm text-stone-500">No webinars yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100 text-sm">
            {webinars.map(w => (
              <li key={w.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-stone-900 font-medium truncate">{w.title}</p>
                  <p className="text-xs text-stone-500 truncate">
                    {w.recorded_on ?? 'No date'} ·{' '}
                    <a
                      href={w.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C4A348] hover:underline"
                    >
                      {w.video_url}
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(w)}
                  disabled={pending}
                  className="text-xs text-red-600 hover:underline shrink-0 disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
