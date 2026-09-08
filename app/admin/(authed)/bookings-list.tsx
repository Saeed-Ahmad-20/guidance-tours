'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useState, useTransition } from 'react'
import { cancelBooking, confirmDeposit, revertToPending } from '../../actions/admin'
import { formatGBP } from '../../lib/booking'

export type BookingPassenger = {
  position: number
  given_names: string
  surname: string
  person_type: 'adult' | 'infant'
  room_type: 'quad' | 'triple' | 'double'
  date_of_birth: string
  passport_expiry: string
  passport_renewal_required: boolean
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

export default function BookingsList({
  bookings,
  counts,
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
      const target = booking.status === 'confirmed' ? booking.total_cost_gbp : booking.deposit_amount_gbp
      const remaining = Math.max(0, target - booking.amount_received_gbp)
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

  function onConfirmDeposit() {
    if (!panel) return
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) { setError('Enter a valid amount.'); return }
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
  const isPartial =
    panel?.type === 'confirm' &&
    !isBalanceTopUp &&
    !isNaN(received) &&
    received > 0 &&
    totalReceived < (panel?.booking.deposit_amount_gbp ?? Infinity)

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
                <Th>Code</Th>
                <Th>Lead</Th>
                <Th>People</Th>
                <Th>Deposit</Th>
                <Th>Claimed</Th>
                <Th>Created</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
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
                        {b.amount_received_gbp < b.deposit_amount_gbp ? (
                          <span>
                            <span className="text-amber-700">{formatGBP(b.deposit_amount_gbp - b.amount_received_gbp)} remaining</span>
                            <span className="text-stone-400 font-normal text-xs ml-1">of {formatGBP(b.deposit_amount_gbp)}</span>
                          </span>
                        ) : b.status === 'confirmed' && balanceRemaining > 0 ? (
                          <span>
                            {formatGBP(b.deposit_amount_gbp)}
                            <span className="text-amber-700 font-normal text-xs ml-1">· {formatGBP(balanceRemaining)} balance due</span>
                          </span>
                        ) : (
                          formatGBP(b.deposit_amount_gbp)
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
                        <StatusPill status={b.status} amountReceivedGBP={b.amount_received_gbp} depositAmountGBP={b.deposit_amount_gbp} />
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2 flex-wrap">
                          {canConfirm && (
                            <button
                              onClick={() => isActionRow && panel?.type === 'confirm' ? closePanel() : openPanel('confirm', b)}
                              disabled={busy}
                              className="text-xs font-semibold bg-emerald-600 text-white rounded-full px-3 py-1.5 hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                              {busy ? '…' : b.status === 'confirmed' ? 'Record balance payment' : 'Confirm deposit'}
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
                        <td colSpan={9} className="px-4 py-3">
                          <PassengerPanel passengers={pax} />
                        </td>
                      </tr>
                    )}

                    {isActionRow && panel?.type === 'confirm' && (
                      <tr className="bg-emerald-50/50 border-b border-stone-100">
                        <td colSpan={9} className="px-4 py-3">
                          <div className="flex flex-col gap-2.5 max-w-sm">
                            <p className="text-xs font-semibold text-stone-700">
                              {b.status === 'confirmed' ? 'Balance payment received' : b.amount_received_gbp > 0 ? 'Amount received (this transfer)' : 'Amount received'}
                              <span className="ml-2 font-normal text-stone-400">
                                {b.status === 'confirmed'
                                  ? `already received ${formatGBP(b.amount_received_gbp)} · balance ${formatGBP(balanceRemaining)}`
                                  : b.amount_received_gbp > 0
                                  ? `previously received ${formatGBP(b.amount_received_gbp)} · remaining ${formatGBP(b.deposit_amount_gbp - b.amount_received_gbp)}`
                                  : `expected ${formatGBP(b.deposit_amount_gbp)}`}
                              </span>
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-stone-500 text-sm">£</span>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amountStr}
                                onChange={e => setAmountStr(e.target.value)}
                                className="w-28 text-sm rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              />
                            </div>
                            {isPartial && (
                              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                Total received: {formatGBP(totalReceived)} — shortfall of {formatGBP(b.deposit_amount_gbp - totalReceived)}. Customer will be notified.
                              </p>
                            )}
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={onConfirmDeposit}
                                disabled={isPending}
                                className="text-xs font-semibold bg-emerald-600 text-white rounded-full px-3 py-1.5 hover:bg-emerald-700 transition disabled:opacity-50"
                              >
                                {isPending ? 'Working…' : isBalanceTopUp ? 'Record payment' : isPartial ? 'Confirm partial' : 'Confirm'}
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
                        <td colSpan={9} className="px-4 py-3">
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
                        <td colSpan={9} className="px-4 py-3">
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

function PassengerPanel({ passengers }: { passengers: BookingPassenger[] }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
      <table className="min-w-full text-xs">
        <thead className="uppercase text-[10px] text-stone-500 bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">#</th>
            <th className="text-left px-3 py-2 font-semibold">Name</th>
            <th className="text-left px-3 py-2 font-semibold">Type</th>
            <th className="text-left px-3 py-2 font-semibold">Bed</th>
            <th className="text-left px-3 py-2 font-semibold">DOB</th>
            <th className="text-left px-3 py-2 font-semibold">Passport expiry</th>
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
              <td className="px-3 py-2 capitalize text-stone-700">{p.room_type}-room bed</td>
              <td className="px-3 py-2 text-stone-700">{p.date_of_birth}</td>
              <td className="px-3 py-2 text-stone-700">{p.passport_expiry}</td>
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
