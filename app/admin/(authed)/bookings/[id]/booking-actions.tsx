'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { cancelBooking, confirmDeposit, revertToPending } from '../../../../actions/admin'
import { formatGBP } from '../../../../lib/booking'

type Status = 'pending_payment' | 'transfer_submitted' | 'confirmed' | 'expired' | 'cancelled'
type Panel = 'confirm' | 'revert' | null

export default function BookingActions({
  id,
  status,
  depositAmountGBP,
  depositReceivedGBP,
}: {
  id: string
  status: Status
  depositAmountGBP: number
  depositReceivedGBP?: number
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [panel, setPanel] = useState<Panel>(null)
  const [amountStr, setAmountStr] = useState('')
  const [note, setNote] = useState('')

  const canConfirm = status === 'pending_payment' || status === 'transfer_submitted'
  const canRevert = status === 'transfer_submitted' || status === 'confirmed'
  const canCancel = status !== 'expired' && status !== 'cancelled'

  function openPanel(p: Panel) {
    setPanel(p)
    if (p === 'confirm') {
      const remaining =
        depositReceivedGBP !== undefined
          ? depositAmountGBP - depositReceivedGBP
          : depositAmountGBP
      setAmountStr(remaining.toString())
    } else {
      setAmountStr('')
    }
    setNote('')
    setError(null)
  }

  function onCancel() {
    if (!confirm('Cancel this booking? This frees up the places.')) return
    setError(null)
    startTransition(async () => {
      const r = await cancelBooking(id)
      if (r.ok) router.refresh()
      else setError(r.error)
    })
  }

  function onConfirmDeposit() {
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount.')
      return
    }
    const totalAmount = (depositReceivedGBP ?? 0) + amount
    setError(null)
    startTransition(async () => {
      const r = await confirmDeposit(id, totalAmount)
      if (r.ok) { setPanel(null); router.refresh() }
      else setError(r.error)
    })
  }

  function onRevert() {
    setError(null)
    startTransition(async () => {
      const r = await revertToPending(id, note.trim() || undefined)
      if (r.ok) { setPanel(null); setNote(''); router.refresh() }
      else setError(r.error)
    })
  }

  const received = parseFloat(amountStr)
  const totalReceived = (depositReceivedGBP ?? 0) + (isNaN(received) ? 0 : received)
  const isPartial = !isNaN(received) && received > 0 && totalReceived < depositAmountGBP

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canConfirm && (
          <button
            onClick={() => openPanel(panel === 'confirm' ? null : 'confirm')}
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            Confirm deposit received
          </button>
        )}
        {canRevert && (
          <button
            onClick={() => openPanel(panel === 'revert' ? null : 'revert')}
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-sm hover:bg-amber-200 transition disabled:opacity-50"
          >
            Revert to pending
          </button>
        )}
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-white border border-stone-300 text-stone-700 font-semibold text-sm hover:border-red-400 hover:text-red-600 transition disabled:opacity-50"
          >
            Cancel booking
          </button>
        )}
      </div>

      {panel === 'confirm' && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">Confirm deposit received</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {depositReceivedGBP !== undefined
                ? 'Enter the amount received in this transfer. Customer will be emailed.'
                : 'Enter the amount actually received. Customer will be emailed.'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
              {depositReceivedGBP !== undefined ? 'Amount received (this transfer)' : 'Amount received'}
            </label>
            {depositReceivedGBP !== undefined && (
              <p className="text-xs text-stone-400">
                Previously received {formatGBP(depositReceivedGBP)} · remaining expected {formatGBP(depositAmountGBP - depositReceivedGBP)}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-stone-500 text-sm">£</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                className="w-32 text-sm rounded-lg border border-stone-200 bg-white px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              {depositReceivedGBP === undefined && (
                <span className="text-xs text-stone-400">expected {formatGBP(depositAmountGBP)}</span>
              )}
            </div>
            {isPartial && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                Total received will be {formatGBP(totalReceived)} — shortfall of {formatGBP(depositAmountGBP - totalReceived)}. Customer will be notified.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onConfirmDeposit}
              disabled={isPending}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition disabled:opacity-50"
            >
              {isPending ? 'Working…' : isPartial ? 'Confirm partial payment' : 'Confirm full payment'}
            </button>
            <button
              onClick={() => setPanel(null)}
              disabled={isPending}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white border border-stone-300 text-stone-600 font-semibold text-sm hover:border-stone-400 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {panel === 'revert' && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">Revert to pending payment</p>
            <p className="text-xs text-stone-500 mt-0.5">
              The booking window will be extended. Customer will be emailed and their portal will update.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
              Message to customer{' '}
              <span className="font-normal normal-case tracking-normal text-stone-400">
                (optional — shown in portal &amp; emailed)
              </span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. We couldn't match your transfer — please re-send using the reference below."
              rows={3}
              className="w-full text-sm rounded-lg border border-stone-200 bg-white p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRevert}
              disabled={isPending}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition disabled:opacity-50"
            >
              {isPending ? 'Working…' : 'Revert to pending'}
            </button>
            <button
              onClick={() => setPanel(null)}
              disabled={isPending}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white border border-stone-300 text-stone-600 font-semibold text-sm hover:border-stone-400 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
