'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useMemo, useState, useTransition } from 'react'
import { cancelBooking, confirmDeposit, revertToPending } from '../../actions/admin'
import { ageGroup, effectiveDepositGBP, formatGBP, type AgeGroup } from '../../lib/booking'

const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  infant: 'Infant',
  youth: 'Youth',
  adult: 'Adult',
}

const AGE_GROUP_CLS: Record<AgeGroup, string> = {
  infant: 'bg-blue-100 text-blue-800',
  youth: 'bg-purple-100 text-purple-800',
  adult: 'bg-stone-100 text-stone-600',
}

export type BookingPassenger = {
  id: string
  position: number
  given_names: string
  surname: string
  person_type: 'adult' | 'infant'
  room_type: 'quad' | 'triple' | 'double'
  room_allocation_id: string | null
  date_of_birth: string
  passport_expiry: string
  passport_renewal_required: boolean
  passport_photo_uploaded_at: string | null
}

export type BookingRow = {
  id: string
  reservation_code: string
  lead_given_names: string
  lead_surname: string
  lead_email: string | null
  lead_phone: string | null
  total_people: number
  total_cost_gbp: number
  deposit_amount_gbp: number
  amount_received_gbp: number
  last_claimed_amount_gbp: number | null
  last_claimed_at: string | null
  quad_rooms: number
  triple_rooms: number
  double_rooms: number
  status: 'pending_payment' | 'transfer_submitted' | 'confirmed' | 'expired' | 'cancelled'
  created_at: string
  expires_at: string
  transfer_submitted_at: string | null
  confirmed_at: string | null
  passengers?: BookingPassenger[]
}

type Tab = 'claims' | 'awaiting' | 'pending' | 'confirmed' | 'expired' | 'cancelled' | 'all'
type PanelType = 'confirm' | 'revert' | 'cancel'

// What's still owed for a confirm/top-up action on this booking — the
// (promo-capped) deposit before confirmation, or the remaining balance after.
// Can legitimately be 0 (a fully comped booking, or a prior transfer that
// already covered it), in which case submitting 0 is how the admin confirms
// it rather than an error.
function remainingDue(b: BookingRow): number {
  const target = b.status === 'confirmed' ? b.total_cost_gbp : effectiveDepositGBP(b.total_cost_gbp, b.deposit_amount_gbp)
  return Math.max(0, target - b.amount_received_gbp)
}

type SortKey = 'code' | 'lead' | 'people' | 'received' | 'passports' | 'claimed' | 'created' | 'status'

function sortValue(b: BookingRow, key: SortKey): string | number {
  switch (key) {
    case 'code':
      return b.reservation_code
    case 'lead':
      return `${b.lead_given_names} ${b.lead_surname}`.toLowerCase()
    case 'people':
      return b.total_people
    case 'received':
      return b.amount_received_gbp
    case 'passports': {
      const pax = b.passengers ?? []
      return pax.length ? pax.filter(p => p.passport_photo_uploaded_at).length / pax.length : -1
    }
    case 'claimed':
      return b.last_claimed_amount_gbp ?? -1
    case 'created':
      return b.created_at
    case 'status':
      return b.status
  }
}

export default function BookingsList({
  bookings,
  counts,
  departureDate,
}: {
  bookings: BookingRow[]
  counts: {
    pending: number
    awaiting: number
    confirmed: number
    expired: number
    cancelled: number
    claims: number
  }
  departureDate: string | null
}) {
  const [tab, setTab] = useState<Tab>(
    counts.claims > 0 ? 'claims' : counts.awaiting > 0 ? 'awaiting' : 'pending'
  )
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [panel, setPanel] = useState<{ id: string; type: PanelType; booking: BookingRow } | null>(null)
  const [amountStr, setAmountStr] = useState('')
  const [revertNote, setRevertNote] = useState('')
  const [cancelNote, setCancelNote] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'created', dir: 'desc' })

  function toggleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    )
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openPanel(type: PanelType, booking: BookingRow) {
    setPanel({ id: booking.id, type, booking })
    if (type === 'confirm') {
      const remaining = remainingDue(booking)
      const prefill = booking.last_claimed_amount_gbp
        ? Math.min(booking.last_claimed_amount_gbp, remaining)
        : remaining
      setAmountStr(prefill.toString())
    } else {
      setAmountStr('')
    }
    setRevertNote('')
    setCancelNote('')
    setError(null)
  }

  function closePanel() {
    setPanel(null)
    setAmountStr('')
    setRevertNote('')
    setCancelNote('')
    setError(null)
  }

  const filtered = bookings.filter(b => {
    if (tab === 'all') return true
    if (tab === 'claims') return b.last_claimed_amount_gbp != null
    if (tab === 'awaiting') return b.status === 'transfer_submitted'
    if (tab === 'pending') return b.status === 'pending_payment'
    if (tab === 'confirmed') return b.status === 'confirmed'
    if (tab === 'expired') return b.status === 'expired'
    if (tab === 'cancelled') return b.status === 'cancelled'
    return false
  })

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

  function onConfirmDeposit() {
    if (!panel) return
    const amount = parseFloat(amountStr)
    const nothingOwed = remainingDue(panel.booking) <= 0
    if (isNaN(amount) || amount < 0 || (amount === 0 && !nothingOwed)) {
      setError('Enter a valid amount.')
      return
    }
    const prevReceived = panel.booking.amount_received_gbp
    const totalAmount = prevReceived + amount
    setActionId(panel.id)
    setError(null)
    startTransition(async () => {
      const r = await confirmDeposit(panel.id, totalAmount)
      setActionId(null)
      if (r.ok) { closePanel(); router.refresh() }
      else setError(r.error)
    })
  }

  function onRevertToPending() {
    if (!panel) return
    setActionId(panel.id)
    setError(null)
    startTransition(async () => {
      const r = await revertToPending(panel.id, revertNote.trim() || undefined)
      setActionId(null)
      if (r.ok) { closePanel(); router.refresh() }
      else setError(r.error)
    })
  }

  function onCancelConfirmed() {
    if (!panel) return
    setActionId(panel.id)
    setError(null)
    startTransition(async () => {
      const r = await cancelBooking(panel.id, cancelNote.trim() || undefined)
      setActionId(null)
      if (r.ok) { closePanel(); router.refresh() }
      else setError(r.error)
    })
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'claims', label: 'Claims to review', count: counts.claims },
    { id: 'awaiting', label: 'Awaiting confirmation', count: counts.awaiting },
    { id: 'pending', label: 'Pending transfer', count: counts.pending },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'expired', label: 'Expired', count: counts.expired },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
    { id: 'all', label: 'All', count: bookings.length },
  ]

  const received = parseFloat(amountStr)
  const prevReceived = panel?.booking.amount_received_gbp ?? 0
  const totalReceived = !isNaN(received) ? prevReceived + received : 0
  const isBalanceTopUp = panel?.booking.status === 'confirmed'
  const panelEffectiveDeposit = panel
    ? effectiveDepositGBP(panel.booking.total_cost_gbp, panel.booking.deposit_amount_gbp)
    : 0
  const isPayInFullOnly = panel ? panelEffectiveDeposit >= panel.booking.total_cost_gbp : false
  const isPartial =
    panel?.type === 'confirm' &&
    !isBalanceTopUp &&
    !isNaN(received) &&
    received > 0 &&
    totalReceived < panelEffectiveDeposit

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(t => {
          const active = t.id === tab
          const urgent = t.id === 'claims' && t.count > 0
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                active
                  ? 'bg-stone-900 text-white border-stone-900'
                  : urgent
                  ? 'bg-blue-50 text-blue-800 border-blue-300 hover:border-blue-400'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {t.label}
              <span
                className={`ml-2 inline-block min-w-[1.25rem] text-center rounded-full px-1.5 ${
                  active ? 'bg-white/20 text-white' : urgent ? 'bg-blue-200 text-blue-900' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-3">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-5">
          Nothing in this category.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-stone-200">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-stone-500 bg-stone-50 border-b border-stone-200">
              <tr>
                <Th className="w-8">{''}</Th>
                <SortTh sortKey="code" sort={sort} onSort={toggleSort}>Code</SortTh>
                <SortTh sortKey="lead" sort={sort} onSort={toggleSort}>Lead</SortTh>
                <SortTh sortKey="people" sort={sort} onSort={toggleSort}>People</SortTh>
                <SortTh sortKey="received" sort={sort} onSort={toggleSort}>Amount received</SortTh>
                <SortTh sortKey="passports" sort={sort} onSort={toggleSort}>Passports</SortTh>
                <SortTh sortKey="claimed" sort={sort} onSort={toggleSort}>Claimed</SortTh>
                <SortTh sortKey="created" sort={sort} onSort={toggleSort}>Created</SortTh>
                <SortTh sortKey="status" sort={sort} onSort={toggleSort}>Status</SortTh>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(b => {
                const isOpen = expanded.has(b.id)
                const pax = b.passengers ?? []
                const hasPax = pax.length > 0
                const isActionRow = panel?.id === b.id
                const balanceRemaining = Math.max(0, b.total_cost_gbp - b.amount_received_gbp)
                const canConfirm =
                  b.status === 'transfer_submitted' ||
                  b.status === 'pending_payment' ||
                  (b.status === 'confirmed' && balanceRemaining > 0)
                const canRevert = b.status === 'transfer_submitted' || b.status === 'confirmed'
                const canCancelB = b.status !== 'expired' && b.status !== 'cancelled'
                const busy = isPending && actionId === b.id
                const rowEffectiveDeposit = effectiveDepositGBP(b.total_cost_gbp, b.deposit_amount_gbp)
                const rowPayInFullOnly = rowEffectiveDeposit >= b.total_cost_gbp
                const passportsUploaded = pax.filter(p => p.passport_photo_uploaded_at).length

                const hasClaim = b.last_claimed_amount_gbp != null

                return (
                  <React.Fragment key={b.id}>
                    <tr className={`border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50 ${hasClaim ? 'bg-blue-50/60' : ''}`}>
                      <Td className="align-middle">
                        <button
                          type="button"
                          onClick={() => toggleExpand(b.id)}
                          disabled={!hasPax}
                          aria-expanded={isOpen}
                          aria-label={isOpen ? 'Hide passengers' : 'Show passengers'}
                          className="w-6 h-6 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </Td>
                      <Td>
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="font-mono font-semibold text-stone-900 hover:text-[#C4A348]"
                        >
                          {b.reservation_code}
                        </Link>
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <span className="text-stone-900">
                            {b.lead_given_names} {b.lead_surname}
                          </span>
                          {b.lead_email && (
                            <a
                              href={`mailto:${b.lead_email}`}
                              className="text-xs text-stone-500 hover:text-[#C4A348]"
                            >
                              {b.lead_email}
                            </a>
                          )}
                        </div>
                      </Td>
                      <Td>{b.total_people}</Td>
                      <Td className="font-semibold">
                        <div className="flex flex-col">
                          <span>{formatGBP(b.amount_received_gbp)}</span>
                          {balanceRemaining > 0 && (
                            <span className="text-amber-700 font-normal text-xs mt-0.5">
                              {formatGBP(balanceRemaining)} balance due
                            </span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        {hasPax ? (
                          <span
                            className={`text-xs font-semibold ${
                              passportsUploaded < pax.length ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {passportsUploaded}/{pax.length}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </Td>
                      <Td>
                        {hasClaim ? (
                          <div>
                            <span className="inline-flex items-center gap-1 font-semibold text-blue-800 bg-blue-100 rounded-full px-2 py-0.5 text-xs">
                              {formatGBP(b.last_claimed_amount_gbp!)}
                            </span>
                            {b.last_claimed_at && (
                              <p className="text-[11px] text-stone-400 mt-0.5">{formatDateTime(b.last_claimed_at)}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </Td>
                      <Td className="text-xs text-stone-500">{formatDateTime(b.created_at)}</Td>
                      <Td>
                        <StatusPill status={b.status} amountReceivedGBP={b.amount_received_gbp} depositAmountGBP={rowEffectiveDeposit} />
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2 flex-wrap">
                          {canConfirm && (
                            <button
                              onClick={() => isActionRow && panel?.type === 'confirm' ? closePanel() : openPanel('confirm', b)}
                              disabled={busy}
                              className="text-xs font-semibold bg-emerald-600 text-white rounded-full px-3 py-1.5 hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                              {busy
                                ? '…'
                                : b.status === 'confirmed'
                                ? 'Record balance payment'
                                : rowPayInFullOnly
                                ? 'Confirm payment in full'
                                : 'Confirm deposit'}
                            </button>
                          )}
                          {canRevert && (
                            <button
                              onClick={() => isActionRow && panel?.type === 'revert' ? closePanel() : openPanel('revert', b)}
                              disabled={busy}
                              className="text-xs font-semibold bg-amber-100 border border-amber-300 text-amber-900 rounded-full px-3 py-1.5 hover:bg-amber-200 transition disabled:opacity-50"
                            >
                              {busy ? '…' : 'Revert to pending'}
                            </button>
                          )}
                          {canCancelB && (
                            <button
                              onClick={() => isActionRow && panel?.type === 'cancel' ? closePanel() : openPanel('cancel', b)}
                              disabled={busy}
                              className="text-xs text-stone-500 hover:text-red-600 transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>

                    {isOpen && hasPax && (
                      <tr className="bg-stone-50/60 border-b border-stone-100">
                        <td colSpan={10} className="px-4 py-3">
                          <PassengerPanel passengers={pax} departureDate={departureDate} />
                        </td>
                      </tr>
                    )}

                    {isActionRow && panel?.type === 'confirm' && (
                      <tr className="bg-emerald-50/50 border-b border-stone-100">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="flex flex-col gap-2.5 max-w-sm">
                            <p className="text-xs font-semibold text-stone-700">
                              {b.status === 'confirmed' ? 'Balance payment received' : b.amount_received_gbp > 0 ? 'Amount received (this transfer)' : rowPayInFullOnly ? 'Amount received (pay in full)' : 'Amount received'}
                              <span className="ml-2 font-normal text-stone-400">
                                {b.status === 'confirmed'
                                  ? `already received ${formatGBP(b.amount_received_gbp)} · balance ${formatGBP(balanceRemaining)}`
                                  : b.amount_received_gbp > 0
                                  ? `previously received ${formatGBP(b.amount_received_gbp)} · remaining ${formatGBP(rowEffectiveDeposit - b.amount_received_gbp)}`
                                  : `expected ${formatGBP(rowEffectiveDeposit)}${rowPayInFullOnly ? ' (full amount — total is below our usual deposit)' : ''}`}
                              </span>
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-stone-500 text-sm">£</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amountStr}
                                onChange={e => setAmountStr(e.target.value)}
                                className="w-28 text-sm rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              />
                            </div>
                            {isPartial && (
                              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                Total received: {formatGBP(totalReceived)} — shortfall of {formatGBP(rowEffectiveDeposit - totalReceived)}. Customer will be notified.
                              </p>
                            )}
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={onConfirmDeposit}
                                disabled={isPending}
                                className="text-xs font-semibold bg-emerald-600 text-white rounded-full px-3 py-1.5 hover:bg-emerald-700 transition disabled:opacity-50"
                              >
                                {isPending
                                  ? 'Working…'
                                  : isBalanceTopUp
                                  ? 'Record payment'
                                  : isPartial
                                  ? 'Confirm partial'
                                  : rowPayInFullOnly
                                  ? 'Confirm full payment'
                                  : 'Confirm'}
                              </button>
                              <button
                                onClick={closePanel}
                                disabled={isPending}
                                className="text-xs text-stone-500 hover:text-stone-700 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {isActionRow && panel?.type === 'revert' && (
                      <tr className="bg-amber-50/50 border-b border-stone-100">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="flex flex-col gap-2.5 max-w-sm">
                            <p className="text-xs font-semibold text-stone-700">
                              Revert to pending — optional message to customer
                            </p>
                            <textarea
                              value={revertNote}
                              onChange={e => setRevertNote(e.target.value)}
                              placeholder="e.g. We couldn't match your transfer — please re-send using the reference."
                              rows={2}
                              className="w-full text-sm rounded-lg border border-stone-200 bg-white p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={onRevertToPending}
                                disabled={isPending}
                                className="text-xs font-semibold bg-amber-500 text-white rounded-full px-3 py-1.5 hover:bg-amber-600 transition disabled:opacity-50"
                              >
                                {isPending ? 'Working…' : 'Revert to pending'}
                              </button>
                              <button
                                onClick={closePanel}
                                disabled={isPending}
                                className="text-xs text-stone-500 hover:text-stone-700 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {isActionRow && panel?.type === 'cancel' && (
                      <tr className="bg-red-50/40 border-b border-stone-100">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="flex flex-col gap-2.5 max-w-sm">
                            <p className="text-xs font-semibold text-stone-700">
                              Cancel booking — optional reason for customer
                            </p>
                            <textarea
                              value={cancelNote}
                              onChange={e => setCancelNote(e.target.value)}
                              placeholder="e.g. Duplicate booking — your other reservation is confirmed."
                              rows={2}
                              maxLength={1000}
                              className="w-full text-sm rounded-lg border border-stone-200 bg-white p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={onCancelConfirmed}
                                disabled={isPending}
                                className="text-xs font-semibold bg-red-600 text-white rounded-full px-3 py-1.5 hover:bg-red-700 transition disabled:opacity-50"
                              >
                                {isPending ? 'Working…' : 'Cancel booking'}
                              </button>
                              <button
                                onClick={closePanel}
                                disabled={isPending}
                                className="text-xs text-stone-500 hover:text-stone-700 transition"
                              >
                                Keep booking
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PassengerPanel({
  passengers,
  departureDate,
}: {
  passengers: BookingPassenger[]
  departureDate: string | null
}) {
  const referenceDate = departureDate ?? new Date().toISOString().slice(0, 10)

  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
      <table className="min-w-full text-xs">
        <thead className="uppercase text-[10px] text-stone-500 bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">#</th>
            <th className="text-left px-3 py-2 font-semibold">Name</th>
            <th className="text-left px-3 py-2 font-semibold">Type</th>
            <th className="text-left px-3 py-2 font-semibold">Age group</th>
            <th className="text-left px-3 py-2 font-semibold">Bed</th>
            <th className="text-left px-3 py-2 font-semibold">DOB</th>
            <th className="text-left px-3 py-2 font-semibold">Passport expiry</th>
            <th className="text-left px-3 py-2 font-semibold">Passport photo</th>
            <th className="text-left px-3 py-2 font-semibold">Flag</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map(p => (
            <tr key={p.position} className="border-b border-stone-100 last:border-b-0">
              <td className="px-3 py-2 text-stone-500">{p.position}</td>
              <td className="px-3 py-2 text-stone-900 font-medium">
                {p.given_names} {p.surname}
              </td>
              <td className="px-3 py-2 capitalize text-stone-700">{p.person_type}</td>
              <td className="px-3 py-2">
                {(() => {
                  const g = ageGroup(p.date_of_birth, referenceDate)
                  return (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${AGE_GROUP_CLS[g]}`}
                    >
                      {AGE_GROUP_LABEL[g]}
                    </span>
                  )
                })()}
              </td>
              <td className="px-3 py-2 capitalize text-stone-700">{p.room_type}-room bed</td>
              <td className="px-3 py-2 text-stone-700">{p.date_of_birth}</td>
              <td className="px-3 py-2 text-stone-700">{p.passport_expiry}</td>
              <td className="px-3 py-2">
                {p.passport_photo_uploaded_at ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">✓ Uploaded</span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Not uploaded</span>
                )}
              </td>
              <td className="px-3 py-2">
                {p.passport_renewal_required ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Renewal req.
                  </span>
                ) : (
                  ''
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({
  status,
  amountReceivedGBP,
  depositAmountGBP,
}: {
  status: BookingRow['status']
  amountReceivedGBP?: number
  depositAmountGBP?: number
}) {
  const isPartialTransfer =
    status === 'pending_payment' &&
    amountReceivedGBP !== undefined &&
    amountReceivedGBP > 0 &&
    depositAmountGBP !== undefined &&
    amountReceivedGBP < depositAmountGBP

  const map: Record<BookingRow['status'], { label: string; cls: string }> = {
    pending_payment: isPartialTransfer
      ? { label: 'Partial — awaiting balance', cls: 'bg-amber-100 text-amber-800' }
      : { label: 'Awaiting transfer', cls: 'bg-amber-100 text-amber-800' },
    transfer_submitted: { label: 'Awaiting confirmation', cls: 'bg-blue-100 text-blue-800' },
    confirmed: { label: 'Confirmed', cls: 'bg-emerald-100 text-emerald-800' },
    expired: { label: 'Expired', cls: 'bg-stone-200 text-stone-600' },
    cancelled: { label: 'Cancelled', cls: 'bg-stone-200 text-stone-600' },
  }
  const { label, cls } = map[status]
  return (
    <span className={`inline-block text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5 ${cls}`}>
      {label}
    </span>
  )
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <th className={`text-left px-4 py-2.5 font-semibold whitespace-nowrap ${className}`}>{children}</th>
}

function SortTh({
  children,
  sortKey,
  sort,
  onSort,
  className = '',
}: {
  children: React.ReactNode
  sortKey: SortKey
  sort: { key: SortKey; dir: 'asc' | 'desc' }
  onSort: (key: SortKey) => void
  className?: string
}) {
  const active = sort.key === sortKey
  return (
    <th className={`text-left px-4 py-2.5 font-semibold whitespace-nowrap ${className}`}>
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

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <td className={`px-4 py-3 text-stone-700 ${className}`}>{children}</td>
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
