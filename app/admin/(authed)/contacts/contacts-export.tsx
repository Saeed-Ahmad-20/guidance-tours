'use client'

import { useMemo, useState } from 'react'
import { buildVCards } from '../../../lib/vcard'

export type ContactRow = {
  id: string
  givenNames: string
  surname: string
  email: string | null
  phone: string | null
  reservationCode: string
  tourId: string
  tourLabel: string
  status: 'pending_payment' | 'transfer_submitted' | 'confirmed' | 'expired' | 'cancelled'
  isLead: boolean
}

const STATUS_LABEL: Record<ContactRow['status'], string> = {
  pending_payment: 'Awaiting transfer',
  transfer_submitted: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
        active ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
      }`}
    >
      {children}
    </button>
  )
}

export default function ContactsExport({ rows, tours }: { rows: ContactRow[]; tours: { id: string; label: string }[] }) {
  const [search, setSearch] = useState('')
  const [tourIds, setTourIds] = useState<Set<string>>(new Set())
  // Cancelled and expired bookings are hidden until asked for.
  const [statuses, setStatuses] = useState<Set<ContactRow['status']>>(
    new Set(['pending_payment', 'transfer_submitted', 'confirmed'])
  )
  const [picked, setPicked] = useState<Set<string>>(new Set())

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows
      .filter(r => (tourIds.size === 0 || tourIds.has(r.tourId)) && (statuses.size === 0 || statuses.has(r.status)))
      .filter(
        r =>
          !q ||
          `${r.givenNames} ${r.surname}`.toLowerCase().includes(q) ||
          r.reservationCode.toLowerCase().includes(q) ||
          (r.email ?? '').toLowerCase().includes(q) ||
          (r.phone ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => `${a.givenNames} ${a.surname}`.localeCompare(`${b.givenNames} ${b.surname}`))
  }, [rows, search, tourIds, statuses])

  const chosen = picked.size > 0 ? shown.filter(r => picked.has(r.id)) : shown
  const exportable = chosen.filter(r => r.email || r.phone)
  const allPicked = shown.length > 0 && shown.every(r => picked.has(r.id))

  function download() {
    const vcf = buildVCards(
      exportable.map(r => ({
        givenNames: r.givenNames,
        surname: r.surname,
        email: r.email,
        phone: r.phone,
        org: 'Guidance Tours',
        note: `${r.tourLabel} · Booking ${r.reservationCode}`,
      }))
    )
    const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'guidance-tours-contacts.vcf'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, code, email, phone…"
          className="text-sm rounded-lg border border-stone-200 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-400 w-64"
        />
        <span className="text-xs text-stone-400 ml-auto">
          {shown.length} of {rows.length}
        </span>
        <button
          type="button"
          onClick={download}
          disabled={exportable.length === 0}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition disabled:opacity-40"
        >
          Save {exportable.length} to phone (.vcf)
        </button>
      </div>

      <div className="flex flex-col gap-2 bg-white rounded-xl border border-stone-200 p-3">
        {tours.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-0.5">Tour</span>
            {tours.map(t => (
              <Chip key={t.id} active={tourIds.has(t.id)} onClick={() => setTourIds(prev => toggle(prev, t.id))}>
                {t.label}
              </Chip>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-0.5">Status</span>
          {(Object.keys(STATUS_LABEL) as ContactRow['status'][]).map(s => (
            <Chip key={s} active={statuses.has(s)} onClick={() => setStatuses(prev => toggle(prev, s))}>
              {STATUS_LABEL[s]}
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-500">
        {picked.size > 0 ? `${picked.size} ticked.` : 'Nothing ticked, so the file covers everyone shown.'}{' '}
        {chosen.length - exportable.length > 0 &&
          `${chosen.length - exportable.length} with no email or phone are left out.`}
      </p>

      {shown.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-5">No passengers match.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-stone-200">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-stone-500 bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    aria-label="Tick everyone shown"
                    checked={allPicked}
                    onChange={() => setPicked(allPicked ? new Set() : new Set(shown.map(r => r.id)))}
                  />
                </th>
                <th className="text-left px-4 py-2.5 font-semibold">Name</th>
                <th className="text-left px-4 py-2.5 font-semibold">Email</th>
                <th className="text-left px-4 py-2.5 font-semibold">Phone</th>
                <th className="text-left px-4 py-2.5 font-semibold">Booking</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr key={r.id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Tick ${r.givenNames} ${r.surname}`}
                      checked={picked.has(r.id)}
                      onChange={() => setPicked(prev => toggle(prev, r.id))}
                    />
                  </td>
                  <td className="px-4 py-3 text-stone-900">
                    {r.givenNames} {r.surname}
                    {r.isLead && (
                      <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8a6e1f]">Lead</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{r.email ?? <span className="text-stone-300">None added</span>}</td>
                  <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                    {r.phone ?? <span className="text-stone-300">None added</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-700">{r.reservationCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
