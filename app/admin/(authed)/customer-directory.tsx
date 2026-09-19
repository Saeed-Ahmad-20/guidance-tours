'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AgeGroup } from '../../lib/booking'

export type CustomerRow = {
  id: string
  reservationId: string
  reservationCode: string
  tourId: string
  tourLabel: string
  leadName: string
  leadEmail: string | null
  leadPhone: string | null
  name: string
  personType: 'adult' | 'infant'
  ageGroup: AgeGroup
  roomType: 'quad' | 'triple' | 'double'
  roomLabel: string | null
  dateOfBirth: string
  passportExpiry: string
  passportRenewalRequired: boolean
  passportPhotoUploadedAt: string | null
  status: 'pending_payment' | 'transfer_submitted' | 'confirmed' | 'expired' | 'cancelled'
  createdAt: string
}

const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  infant: 'Infant (0–2)',
  youth: 'Youth (2–15)',
  adult: 'Adult (15+)',
}

const AGE_GROUP_CLS: Record<AgeGroup, string> = {
  infant: 'bg-blue-100 text-blue-800',
  youth: 'bg-purple-100 text-purple-800',
  adult: 'bg-stone-100 text-stone-600',
}

const STATUS_LABEL: Record<CustomerRow['status'], string> = {
  pending_payment: 'Awaiting transfer',
  transfer_submitted: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

const STATUS_CLS: Record<CustomerRow['status'], string> = {
  pending_payment: 'bg-amber-100 text-amber-800',
  transfer_submitted: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  expired: 'bg-stone-200 text-stone-600',
  cancelled: 'bg-stone-200 text-stone-600',
}

const ROOM_TYPE_LABEL: Record<CustomerRow['roomType'], string> = {
  quad: 'Quad',
  triple: 'Triple',
  double: 'Double',
}

const PERSON_TYPE_LABEL: Record<CustomerRow['personType'], string> = {
  adult: 'Adult',
  infant: 'Infant',
}

const PASSPORT_LABEL: Record<'uploaded' | 'missing', string> = {
  uploaded: 'Uploaded',
  missing: 'Not uploaded',
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

type SortKey = 'name' | 'tour' | 'booking' | 'room' | 'ageGroup' | 'dob' | 'passport' | 'status'

const AGE_GROUP_ORDER: Record<AgeGroup, number> = { infant: 0, youth: 1, adult: 2 }

function sortValue(c: CustomerRow, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return c.name.toLowerCase()
    case 'tour':
      return c.tourLabel.toLowerCase()
    case 'booking':
      return c.reservationCode
    case 'room':
      return c.roomType
    case 'ageGroup':
      return AGE_GROUP_ORDER[c.ageGroup]
    case 'dob':
      return c.dateOfBirth
    case 'passport':
      return c.passportPhotoUploadedAt ? 1 : 0
    case 'status':
      return c.status
  }
}

function SortTh({
  children,
  sortKey,
  sort,
  onSort,
}: {
  children: ReactNode
  sortKey: SortKey
  sort: { key: SortKey; dir: 'asc' | 'desc' }
  onSort: (key: SortKey) => void
}) {
  const active = sort.key === sortKey
  return (
    <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-stone-900 transition ${active ? 'text-stone-900' : ''}`}
      >
        {children}
        <span className="text-[10px] w-2.5 inline-block">{active ? (sort.dir === 'asc' ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  )
}

function FilterGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: { value: T; label: string }[]
  selected: Set<T>
  onToggle: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-0.5">
        {label}
      </span>
      {options.map(opt => {
        const active = selected.has(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            aria-pressed={active}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
              active
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function CustomerDirectory({
  customers,
  tours,
}: {
  customers: CustomerRow[]
  tours: { id: string; label: string }[]
}) {
  const [search, setSearch] = useState('')
  const [tourIds, setTourIds] = useState<Set<string>>(new Set())
  const [statuses, setStatuses] = useState<Set<CustomerRow['status']>>(new Set())
  const [roomTypes, setRoomTypes] = useState<Set<CustomerRow['roomType']>>(new Set())
  const [personTypes, setPersonTypes] = useState<Set<CustomerRow['personType']>>(new Set())
  const [ageGroups, setAgeGroups] = useState<Set<AgeGroup>>(new Set())
  const [passportOpts, setPassportOpts] = useState<Set<'uploaded' | 'missing'>>(new Set())
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' })

  function toggleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    )
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter(c => {
      if (tourIds.size > 0 && !tourIds.has(c.tourId)) return false
      if (statuses.size > 0 && !statuses.has(c.status)) return false
      if (roomTypes.size > 0 && !roomTypes.has(c.roomType)) return false
      if (personTypes.size > 0 && !personTypes.has(c.personType)) return false
      if (ageGroups.size > 0 && !ageGroups.has(c.ageGroup)) return false
      if (passportOpts.size > 0) {
        const has = c.passportPhotoUploadedAt ? 'uploaded' : 'missing'
        if (!passportOpts.has(has)) return false
      }
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.leadName.toLowerCase().includes(q) ||
        c.reservationCode.toLowerCase().includes(q) ||
        (c.leadEmail ?? '').toLowerCase().includes(q) ||
        (c.leadPhone ?? '').toLowerCase().includes(q)
      )
    })
  }, [customers, search, tourIds, statuses, roomTypes, personTypes, ageGroups, passportOpts])

  const sorted = useMemo(() => {
    const dirMul = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const av = sortValue(a, sort.key)
      const bv = sortValue(b, sort.key)
      if (av < bv) return -1 * dirMul
      if (av > bv) return 1 * dirMul
      return 0
    })
  }, [filtered, sort])

  const hasMultipleTours = tours.length > 1
  const hasActiveFilters =
    tourIds.size > 0 ||
    statuses.size > 0 ||
    roomTypes.size > 0 ||
    personTypes.size > 0 ||
    ageGroups.size > 0 ||
    passportOpts.size > 0 ||
    search.trim() !== ''

  function clearFilters() {
    setSearch('')
    setTourIds(new Set())
    setStatuses(new Set())
    setRoomTypes(new Set())
    setPersonTypes(new Set())
    setAgeGroups(new Set())
    setPassportOpts(new Set())
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, code, email, phone…"
          className="text-sm rounded-lg border border-stone-200 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-400 w-56"
        />
        <span className="text-xs text-stone-400 ml-auto">
          {filtered.length} of {customers.length}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-stone-500 hover:text-red-600 transition"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 bg-white rounded-xl border border-stone-200 p-3">
        {hasMultipleTours && (
          <FilterGroup
            label="Tour"
            options={tours.map(t => ({ value: t.id, label: t.label }))}
            selected={tourIds}
            onToggle={v => setTourIds(prev => toggle(prev, v))}
          />
        )}
        <FilterGroup
          label="Status"
          options={(Object.keys(STATUS_LABEL) as CustomerRow['status'][]).map(s => ({
            value: s,
            label: STATUS_LABEL[s],
          }))}
          selected={statuses}
          onToggle={v => setStatuses(prev => toggle(prev, v))}
        />
        <FilterGroup
          label="Bed type"
          options={(Object.keys(ROOM_TYPE_LABEL) as CustomerRow['roomType'][]).map(r => ({
            value: r,
            label: ROOM_TYPE_LABEL[r],
          }))}
          selected={roomTypes}
          onToggle={v => setRoomTypes(prev => toggle(prev, v))}
        />
        <FilterGroup
          label="Person"
          options={(Object.keys(PERSON_TYPE_LABEL) as CustomerRow['personType'][]).map(p => ({
            value: p,
            label: PERSON_TYPE_LABEL[p],
          }))}
          selected={personTypes}
          onToggle={v => setPersonTypes(prev => toggle(prev, v))}
        />
        <FilterGroup
          label="Age group"
          options={(Object.keys(AGE_GROUP_LABEL) as AgeGroup[]).map(g => ({
            value: g,
            label: AGE_GROUP_LABEL[g],
          }))}
          selected={ageGroups}
          onToggle={v => setAgeGroups(prev => toggle(prev, v))}
        />
        <FilterGroup
          label="Passport"
          options={(Object.keys(PASSPORT_LABEL) as Array<'uploaded' | 'missing'>).map(p => ({
            value: p,
            label: PASSPORT_LABEL[p],
          }))}
          selected={passportOpts}
          onToggle={v => setPassportOpts(prev => toggle(prev, v))}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-5">
          No customers match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-stone-200">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-stone-500 bg-stone-50 border-b border-stone-200">
              <tr>
                <SortTh sortKey="name" sort={sort} onSort={toggleSort}>Name</SortTh>
                {!hasMultipleTours ? null : (
                  <SortTh sortKey="tour" sort={sort} onSort={toggleSort}>Tour</SortTh>
                )}
                <SortTh sortKey="booking" sort={sort} onSort={toggleSort}>Booking</SortTh>
                <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Contact</th>
                <SortTh sortKey="room" sort={sort} onSort={toggleSort}>Room</SortTh>
                <SortTh sortKey="ageGroup" sort={sort} onSort={toggleSort}>Age group</SortTh>
                <SortTh sortKey="dob" sort={sort} onSort={toggleSort}>DOB</SortTh>
                <SortTh sortKey="passport" sort={sort} onSort={toggleSort}>Passport</SortTh>
                <SortTh sortKey="status" sort={sort} onSort={toggleSort}>Status</SortTh>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => (
                <tr key={c.id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">
                    {c.name}
                    {c.personType === 'infant' && (
                      <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Infant
                      </span>
                    )}
                    {c.name !== c.leadName && (
                      <p className="text-xs text-stone-400 mt-0.5">Lead: {c.leadName}</p>
                    )}
                  </td>
                  {!hasMultipleTours ? null : (
                    <td className="px-4 py-3 text-stone-700">{c.tourLabel}</td>
                  )}
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bookings/${c.reservationId}`}
                      className="font-mono font-semibold text-stone-900 hover:text-[#C4A348]"
                    >
                      {c.reservationCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {c.leadEmail && (
                      <a href={`mailto:${c.leadEmail}`} className="block text-xs text-stone-600 hover:text-[#C4A348]">
                        {c.leadEmail}
                      </a>
                    )}
                    {c.leadPhone && <p className="text-xs text-stone-400">{c.leadPhone}</p>}
                  </td>
                  <td className="px-4 py-3 text-stone-700 capitalize">
                    {c.roomType}
                    {c.roomLabel && <p className="text-xs text-stone-400 normal-case">{c.roomLabel}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5 ${AGE_GROUP_CLS[c.ageGroup]}`}
                    >
                      {AGE_GROUP_LABEL[c.ageGroup]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-700 whitespace-nowrap">{c.dateOfBirth}</td>
                  <td className="px-4 py-3">
                    {c.passportPhotoUploadedAt ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        ✓ Uploaded
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Not uploaded
                      </span>
                    )}
                    {c.passportRenewalRequired && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mt-0.5">
                        Renewal req.
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5 ${STATUS_CLS[c.status]}`}
                    >
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
