'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTravelDocument, uploadTravelDocument } from '../../../../actions/admin'
import {
  TRAVEL_DOC_TYPES,
  TRAVEL_DOC_TYPE_LABELS,
  type TravelDocType,
} from '../../../../lib/portal-content'

export type AdminTravelDoc = {
  id: string
  passenger_id: string | null
  doc_type: TravelDocType
  label: string
  url: string | null
  created_at: string
}

export default function TravelDocuments({
  reservationId,
  passengers,
  documents,
}: {
  reservationId: string
  passengers: Array<{ id: string; given_names: string; surname: string }>
  documents: AdminTravelDoc[]
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const nameById = new Map(passengers.map(p => [p.id, `${p.given_names} ${p.surname}`]))

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await uploadTravelDocument(reservationId, fd)
      if (r.ok) {
        formRef.current?.reset()
        router.refresh()
      } else {
        setError(r.error)
      }
    })
  }

  function onDelete(doc: AdminTravelDoc) {
    if (!confirm(`Delete "${doc.label}"? The passenger will no longer see it.`)) return
    setError(null)
    startTransition(async () => {
      const r = await deleteTravelDocument(doc.id)
      if (r.ok) router.refresh()
      else setError(r.error)
    })
  }

  const inputCls =
    'rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition w-full'

  return (
    <div className="flex flex-col gap-4">
      {documents.length === 0 ? (
        <p className="text-sm text-stone-500">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-stone-100 text-sm">
          {documents.map(d => (
            <li key={d.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-stone-900 truncate">{d.label}</p>
                <p className="text-xs text-stone-500">
                  {TRAVEL_DOC_TYPE_LABELS[d.doc_type]} ·{' '}
                  {d.passenger_id ? nameById.get(d.passenger_id) ?? 'Passenger' : 'Whole booking'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {d.url && (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#C4A348] hover:underline"
                  >
                    View
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(d)}
                  disabled={pending}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="rounded-lg border border-stone-200 bg-stone-50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <label className="flex flex-col gap-1 text-xs text-stone-600">
          Type
          <select name="doc_type" required defaultValue="flight_ticket" className={inputCls}>
            {TRAVEL_DOC_TYPES.map(t => (
              <option key={t} value={t}>
                {TRAVEL_DOC_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-600">
          For
          <select name="passenger_id" defaultValue="" className={inputCls}>
            <option value="">Whole booking</option>
            {passengers.map(p => (
              <option key={p.id} value={p.id}>
                {p.given_names} {p.surname}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-600 sm:col-span-2">
          Name shown to passenger
          <input
            name="label"
            required
            maxLength={120}
            placeholder="e.g. Outbound flight LHR → JED, 14 Dec"
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-600 sm:col-span-2">
          File (PDF, JPG, PNG or WEBP · max 10MB)
          <input
            name="file"
            type="file"
            required
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="text-sm"
          />
        </label>
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50"
          >
            {pending ? 'Working…' : 'Upload document'}
          </button>
        </div>
      </form>
    </div>
  )
}
