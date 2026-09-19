'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AGE_GROUP_LABEL,
  STATUS_LABEL,
  DEFAULT_ASSUMPTIONS,
  assumptionsToQuery,
  computeFinanceRows,
  type Assumptions,
  type ComputedFinanceRow,
  type FinanceRow,
} from '../../../../lib/finance-calc'
import { cap } from '../../../../lib/booking'

const STATUS_CLS: Record<ComputedFinanceRow['status'], string> = {
  pending_payment: 'bg-amber-100 text-amber-800',
  transfer_submitted: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
}

function formatMoney(n: number): string {
  const abs = Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n < 0 ? `-£${abs}` : `£${abs}`
}

type SortKey = 'name' | 'room' | 'ageGroup' | 'charged' | 'flight' | 'ground' | 'actual' | 'margin' | 'status'

function sortValue(r: ComputedFinanceRow, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return r.name.toLowerCase()
    case 'room':
      return r.roomType
    case 'ageGroup':
      return r.ageGroup
    case 'charged':
      return r.amountCharged
    case 'flight':
      return r.flightCost
    case 'ground':
      return r.groundCost
    case 'actual':
      return r.actualCost
    case 'margin':
      return r.margin
    case 'status':
      return r.status
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

function NumberField({
  value,
  onChange,
  width = 'w-20',
}: {
  value: number
  onChange: (value: string) => void
  width?: string
}) {
  return (
    <input
      type="number"
      min="0"
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`text-sm rounded-lg border border-stone-200 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-stone-400 ${width}`}
    />
  )
}

function Stat({ label, value, tone = 'stone' }: { label: string; value: string; tone?: 'stone' | 'green' | 'amber' }) {
  const toneMap = {
    stone: 'bg-white border-stone-200 text-stone-900',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  }[tone]
  return (
    <div className={`rounded-xl border p-4 ${toneMap}`}>
      <p className="text-[10px] uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default function FinanceBreakdown({ tourId, rows }: { tourId: string; rows: FinanceRow[] }) {
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' })

  function toggleSort(key: SortKey) {
    setSort(prev => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  function updateAssumption(key: keyof Assumptions, raw: string) {
    const n = Number(raw)
    setAssumptions(prev => ({ ...prev, [key]: Number.isFinite(n) && n >= 0 ? n : 0 }))
  }

  const computed = useMemo(() => computeFinanceRows(rows, assumptions), [rows, assumptions])

  const sorted = useMemo(() => {
    const dirMul = sort.dir === 'asc' ? 1 : -1
    return [...computed].sort((a, b) => {
      const av = sortValue(a, sort.key)
      const bv = sortValue(b, sort.key)
      if (av < bv) return -1 * dirMul
      if (av > bv) return 1 * dirMul
      return 0
    })
  }, [computed, sort])

  const totals = useMemo(
    () =>
      computed.reduce(
        (acc, r) => {
          acc.charged += r.amountCharged
          acc.flight += r.flightCost
          acc.ground += r.groundCost
          acc.actual += r.actualCost
          acc.margin += r.margin
          return acc
        },
        { charged: 0, flight: 0, ground: 0, actual: 0, margin: 0 }
      ),
    [computed]
  )

  function downloadExcel() {
    const query = assumptionsToQuery(assumptions)
    window.location.href = `/admin/finance/${tourId}/export?${query.toString()}`
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-stone-900">Cost assumptions</h2>
          <button
            type="button"
            onClick={downloadExcel}
            className="text-xs font-semibold bg-[#C4A348] text-white rounded-full px-4 py-2 hover:bg-[#b2932e] transition shrink-0"
          >
            Download Excel
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Flight cost (actual, per person)
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
              <span>First</span>
              <NumberField value={assumptions.adultTier1Count} onChange={v => updateAssumption('adultTier1Count', v)} width="w-16" />
              <span>adults at £</span>
              <NumberField value={assumptions.adultTier1Price} onChange={v => updateAssumption('adultTier1Price', v)} />
              <span>· additional adults at £</span>
              <NumberField value={assumptions.adultTier2Price} onChange={v => updateAssumption('adultTier2Price', v)} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
              <label className="flex items-center gap-2">
                <span className="w-12">Youth</span>
                <span>£</span>
                <NumberField value={assumptions.youthFlightPrice} onChange={v => updateAssumption('youthFlightPrice', v)} />
              </label>
              <label className="flex items-center gap-2">
                <span className="w-12">Infant</span>
                <span>£</span>
                <NumberField value={assumptions.infantFlightPrice} onChange={v => updateAssumption('infantFlightPrice', v)} />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Ground package cost (actual, per person)
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
              <label className="flex items-center gap-2">
                <span className="w-12">Double</span>
                <span>£</span>
                <NumberField value={assumptions.groundDouble} onChange={v => updateAssumption('groundDouble', v)} />
              </label>
              <label className="flex items-center gap-2">
                <span className="w-12">Triple</span>
                <span>£</span>
                <NumberField value={assumptions.groundTriple} onChange={v => updateAssumption('groundTriple', v)} />
              </label>
              <label className="flex items-center gap-2">
                <span className="w-12">Quad</span>
                <span>£</span>
                <NumberField value={assumptions.groundQuad} onChange={v => updateAssumption('groundQuad', v)} />
              </label>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-400">
          There&apos;s no record of which actual flight batch each passenger was ticketed on, so flight cost
          is assigned in booking order — the first {assumptions.adultTier1Count} adults booked get the
          first rate, every adult after that gets the second. Adjust the counts/prices above to match
          reality; the download uses whatever is set here.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label="Price charged" value={formatMoney(totals.charged)} />
        <Stat label="Flight cost" value={formatMoney(totals.flight)} />
        <Stat label="Ground cost" value={formatMoney(totals.ground)} />
        <Stat label="Total actual cost" value={formatMoney(totals.actual)} />
        <Stat label="Margin" value={formatMoney(totals.margin)} tone={totals.margin >= 0 ? 'green' : 'amber'} />
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-5">
          No active bookings for this tour.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-stone-200">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-stone-500 bg-stone-50 border-b border-stone-200">
              <tr>
                <SortTh sortKey="name" sort={sort} onSort={toggleSort}>Name</SortTh>
                <SortTh sortKey="room" sort={sort} onSort={toggleSort}>Room</SortTh>
                <SortTh sortKey="ageGroup" sort={sort} onSort={toggleSort}>Age group</SortTh>
                <SortTh sortKey="charged" sort={sort} onSort={toggleSort}>Price charged</SortTh>
                <SortTh sortKey="flight" sort={sort} onSort={toggleSort}>Flight cost</SortTh>
                <SortTh sortKey="ground" sort={sort} onSort={toggleSort}>Ground cost</SortTh>
                <SortTh sortKey="actual" sort={sort} onSort={toggleSort}>Total actual cost</SortTh>
                <SortTh sortKey="margin" sort={sort} onSort={toggleSort}>Margin</SortTh>
                <SortTh sortKey="status" sort={sort} onSort={toggleSort}>Status</SortTh>
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r.id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">
                    {r.name}
                    <p className="text-xs text-stone-400 mt-0.5">
                      {r.leadName} · <span className="font-mono">{r.reservationCode}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3 text-stone-700 capitalize">{cap(r.roomType)}</td>
                  <td className="px-4 py-3 text-stone-700">{AGE_GROUP_LABEL[r.ageGroup]}</td>
                  <td className="px-4 py-3 font-semibold text-stone-900">{formatMoney(r.amountCharged)}</td>
                  <td className="px-4 py-3 text-stone-700">
                    {formatMoney(r.flightCost)}
                    <p className="text-xs text-stone-400 mt-0.5">{r.flightTierLabel}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{formatMoney(r.groundCost)}</td>
                  <td className="px-4 py-3 font-semibold text-stone-700">{formatMoney(r.actualCost)}</td>
                  <td className={`px-4 py-3 font-semibold ${r.margin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatMoney(r.margin)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5 ${STATUS_CLS[r.status]}`}
                    >
                      {STATUS_LABEL[r.status]}
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
