'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { removeWaitingListEntry } from '../../actions/admin'

type WaitingRow = {
  id: string
  name: string
  email: string
  phone: string | null
  people_requested: number
  created_at: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function WaitingListManager({ initial }: { initial: WaitingRow[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(initial)
  const [removing, setRemoving] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function remove(id: string) {
    if (!confirm('Remove this person from the waiting list?')) return
    setRemoving(id)
    startTransition(async () => {
      const result = await removeWaitingListEntry(id)
      if (result.ok) {
        setRows(prev => prev.filter(r => r.id !== id))
        router.refresh()
      } else {
        alert(result.error ?? 'Could not remove entry.')
      }
      setRemoving(null)
    })
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-5">
        No one is on the waiting list.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-stone-200">
      <table className="min-w-full text-sm">
        <thead className="text-xs uppercase text-stone-500 bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="text-left px-4 py-2.5 font-semibold">#</th>
            <th className="text-left px-4 py-2.5 font-semibold">When</th>
            <th className="text-left px-4 py-2.5 font-semibold">Name</th>
            <th className="text-left px-4 py-2.5 font-semibold">Email</th>
            <th className="text-left px-4 py-2.5 font-semibold">Phone</th>
            <th className="text-left px-4 py-2.5 font-semibold">Spaces</th>
            <th className="text-left px-4 py-2.5 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w, i) => (
            <tr key={w.id} className="border-b border-stone-100 last:border-b-0">
              <td className="px-4 py-3 text-stone-400 text-xs font-semibold">{i + 1}</td>
              <td className="px-4 py-3 text-stone-700">{formatDate(w.created_at)}</td>
              <td className="px-4 py-3 text-stone-700">{w.name}</td>
              <td className="px-4 py-3 text-stone-700">
                <a href={`mailto:${w.email}`} className="text-[#C4A348] hover:underline">
                  {w.email}
                </a>
              </td>
              <td className="px-4 py-3 text-stone-700">{w.phone ?? '—'}</td>
              <td className="px-4 py-3 text-stone-700">{w.people_requested}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => remove(w.id)}
                  disabled={pending && removing === w.id}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition"
                >
                  {removing === w.id ? 'Removing…' : 'Remove'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
