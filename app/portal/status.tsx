'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markPaymentSent, portalLogout, updateLeadContact } from '../actions/portal'
import { BANK_DETAILS, cap, formatGBP } from '../lib/booking'

export type PortalReservation = {
  id: string
  reservation_code: string
  lead_given_names: string
  lead_surname: string
  lead_email: string | null
  lead_phone: string | null
  total_people: number
  total_cost_gbp: number
  deposit_amount_gbp: number
  status: 'pending_payment' | 'transfer_submitted' | 'confirmed' | 'expired' | 'cancelled'
  created_at: string
  expires_at: string
  display_expires_at: string
  transfer_submitted_at: string | null
  confirmed_at: string | null
  admin_note: string | null
  amount_received_gbp: number
  last_claimed_amount_gbp: number | null
  last_claimed_at: string | null
  passengers: Array<{
    given_names: string
    surname: string
    person_type: 'adult' | 'infant'
    room_type: 'quad' | 'triple' | 'double'
    room_index: number
    passport_expiry: string
    passport_renewal_required: boolean
  }>
}


export default function PortalStatus({ reservation }: { reservation: PortalReservation }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onLogout() {
    startTransition(async () => {
      await portalLogout()
      router.refresh()
    })
  }

  const s = reservation.status
  const remaining = Math.max(0, reservation.total_cost_gbp - reservation.amount_received_gbp)
  const hasReceivedAnything = reservation.amount_received_gbp > 0
  const isPartialDeposit =
    s === 'pending_payment' &&
    hasReceivedAnything &&
    reservation.amount_received_gbp < reservation.deposit_amount_gbp
  const partialRemaining = isPartialDeposit
    ? reservation.deposit_amount_gbp - reservation.amount_received_gbp
    : 0

  const [option, setOption] = useState<'deposit' | 'full' | 'remaining' | 'custom'>(
    hasReceivedAnything ? 'remaining' : 'deposit'
  )
  const [customRaw, setCustomRaw] = useState('')

  const customMin = hasReceivedAnything ? 1 : reservation.deposit_amount_gbp
  const customMax = hasReceivedAnything ? remaining : reservation.total_cost_gbp
  const customAmount = Math.min(
    customMax,
    Math.max(customMin, Math.floor(Number(customRaw) || customMin))
  )
  const chosenAmount = isPartialDeposit
    ? partialRemaining
    : option === 'full'
    ? reservation.total_cost_gbp
    : option === 'remaining'
    ? remaining
    : option === 'custom'
    ? customAmount
    : reservation.deposit_amount_gbp
  const displayAmount = chosenAmount

  function onMarkSent() {
    setError(null)
    startTransition(async () => {
      const r = await markPaymentSent(chosenAmount)
      if (r.ok) {
        router.refresh()
      } else {
        setError(r.error)
      }
    })
  }

  return (
    <div className="w-full bg-stone-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-widest">Reservation</p>
            <p className="font-mono text-xl sm:text-2xl font-bold text-stone-900 tracking-wider select-all">
              {reservation.reservation_code}
            </p>
            <p className="text-sm text-stone-500 mt-1">
              {reservation.lead_given_names} {reservation.lead_surname} · {reservation.total_people} {reservation.total_people === 1 ? 'person' : 'people'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-stone-400 hover:text-stone-700 transition"
          >
            Log out
          </button>
        </div>

        <StatusCard status={s} reservation={reservation} />

        {remaining > 0 && s !== 'expired' && s !== 'cancelled' && (
          <>
            {s === 'pending_payment' && <Countdown expiresAt={reservation.display_expires_at} />}

            {reservation.last_claimed_amount_gbp && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mt-5 text-sm text-blue-900">
                You told us you sent <strong>{formatGBP(reservation.last_claimed_amount_gbp)}</strong>
                {reservation.last_claimed_at && ` on ${formatDate(reservation.last_claimed_at)}`} — we're checking with the bank and will confirm shortly.
              </div>
            )}

            <section className="bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] text-stone-200 rounded-2xl p-5 sm:p-7 mt-5">
              <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest mb-4">
                Bank transfer details
              </p>

              {!isPartialDeposit && (
                <div className="mb-5">
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">How much would you like to pay?</p>
                  <div className="flex flex-col gap-2">
                    {!hasReceivedAnything && (
                      <>
                        <label className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${option === 'deposit' ? 'border-[#C4A348]/60 bg-[#C4A348]/10' : 'border-white/10 hover:border-white/20'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${option === 'deposit' ? 'border-[#C4A348]' : 'border-stone-500'}`}>
                              {option === 'deposit' && <span className="w-2 h-2 rounded-full bg-[#C4A348]" />}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">Deposit only</p>
                              <p className="text-xs text-stone-400">Minimum required to hold your place</p>
                            </div>
                          </div>
                          <span className="font-mono text-[#C4A348] font-bold text-sm whitespace-nowrap">{formatGBP(reservation.deposit_amount_gbp)}</span>
                          <input type="radio" className="sr-only" checked={option === 'deposit'} onChange={() => setOption('deposit')} />
                        </label>

                        <label className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${option === 'full' ? 'border-[#C4A348]/60 bg-[#C4A348]/10' : 'border-white/10 hover:border-white/20'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${option === 'full' ? 'border-[#C4A348]' : 'border-stone-500'}`}>
                              {option === 'full' && <span className="w-2 h-2 rounded-full bg-[#C4A348]" />}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">Pay in full</p>
                              <p className="text-xs text-stone-400">No balance to pay later</p>
                            </div>
                          </div>
                          <span className="font-mono text-[#C4A348] font-bold text-sm whitespace-nowrap">{formatGBP(reservation.total_cost_gbp)}</span>
                          <input type="radio" className="sr-only" checked={option === 'full'} onChange={() => setOption('full')} />
                        </label>
                      </>
                    )}

                    {hasReceivedAnything && (
                      <label className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${option === 'remaining' ? 'border-[#C4A348]/60 bg-[#C4A348]/10' : 'border-white/10 hover:border-white/20'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${option === 'remaining' ? 'border-[#C4A348]' : 'border-stone-500'}`}>
                            {option === 'remaining' && <span className="w-2 h-2 rounded-full bg-[#C4A348]" />}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">Pay remaining balance in full</p>
                            <p className="text-xs text-stone-400">Settles your account — nothing left to pay</p>
                          </div>
                        </div>
                        <span className="font-mono text-[#C4A348] font-bold text-sm whitespace-nowrap">{formatGBP(remaining)}</span>
                        <input type="radio" className="sr-only" checked={option === 'remaining'} onChange={() => setOption('remaining')} />
                      </label>
                    )}

                    {(hasReceivedAnything ? remaining > 0 : reservation.total_cost_gbp > reservation.deposit_amount_gbp) && (
                      <label className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${option === 'custom' ? 'border-[#C4A348]/60 bg-[#C4A348]/10' : 'border-white/10 hover:border-white/20'}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${option === 'custom' ? 'border-[#C4A348]' : 'border-stone-500'}`}>
                            {option === 'custom' && <span className="w-2 h-2 rounded-full bg-[#C4A348]" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">Custom amount</p>
                            <p className="text-xs text-stone-400">
                              {hasReceivedAnything ? 'Up to the remaining balance' : 'Between deposit and full amount'}
                            </p>
                            {option === 'custom' && (
                              <div className="mt-2 flex items-center gap-1.5" onClick={e => e.preventDefault()}>
                                <span className="text-stone-400 text-sm">£</span>
                                <input
                                  type="number"
                                  min={customMin}
                                  max={customMax}
                                  step={1}
                                  value={customRaw}
                                  onChange={e => setCustomRaw(e.target.value)}
                                  placeholder={String(customMin)}
                                  className="w-28 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-stone-500 focus:border-[#C4A348]/60 focus:outline-none"
                                  autoFocus
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {option === 'custom' && customRaw && (
                          <span className="font-mono text-[#C4A348] font-bold text-sm whitespace-nowrap">{formatGBP(customAmount)}</span>
                        )}
                        <input type="radio" className="sr-only" checked={option === 'custom'} onChange={() => setOption('custom')} />
                      </label>
                    )}
                  </div>
                  <div className="h-px bg-white/10 mt-5" />
                </div>
              )}

              <dl className="grid grid-cols-1 gap-3 text-sm">
                <BankRow label="Account holder" value={BANK_DETAILS.accountHolder} />
                <BankRow label="Account number" value={BANK_DETAILS.accountNumber} />
                <BankRow label="Sort code" value={BANK_DETAILS.sortCode} />
                <BankRow label="Reference" value={reservation.reservation_code} />
                <div className="h-px bg-white/10 my-1" />
                <BankRow label="Amount to transfer" value={formatGBP(displayAmount)} emphasis />
              </dl>
              {!isPartialDeposit && option !== 'deposit' && (
                <p className="text-xs text-stone-400 mt-4 leading-relaxed">
                  {option === 'full' || option === 'remaining'
                    ? `Settles your account in full for ${reservation.total_people} ${reservation.total_people === 1 ? 'person' : 'people'} — no balance remaining.`
                    : `Partial payment · ${formatGBP(reservation.total_cost_gbp - chosenAmount)} will remain outstanding${!hasReceivedAnything ? ', due 8 weeks before departure.' : '.'}`}
                </p>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 mt-5">
              <h2 className="font-semibold text-stone-900 mb-1">
                {isPartialDeposit
                  ? 'Sent the remaining deposit?'
                  : hasReceivedAnything && option === 'custom'
                  ? 'Sent that amount?'
                  : hasReceivedAnything
                  ? 'Sent the remaining balance?'
                  : 'Already transferred?'}
              </h2>
              <p className="text-sm text-stone-500 mb-4">
                {isPartialDeposit
                  ? "Once you've transferred the outstanding deposit, let us know below and we'll check and confirm your place."
                  : hasReceivedAnything && option === 'custom'
                  ? "Once you've completed the bank transfer for that amount, let us know below and we'll check and confirm receipt."
                  : hasReceivedAnything
                  ? "Once you've completed the bank transfer, let us know below and we'll check and confirm receipt."
                  : "Once you've completed the bank transfer, let us know below. We'll confirm receipt and lock in your place."}
              </p>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">
                  {error}
                </div>
              )}
              <button
                onClick={onMarkSent}
                disabled={pending}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50"
              >
                {pending
                  ? 'Saving…'
                  : isPartialDeposit
                  ? "I've sent the remaining balance"
                  : hasReceivedAnything && option === 'custom'
                  ? "I've sent this payment"
                  : hasReceivedAnything
                  ? "I've sent the remaining balance"
                  : "I've sent my payment"}
              </button>
            </section>
          </>
        )}

        <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 mt-5">
          <h2 className="font-semibold text-stone-900 mb-3">Passengers</h2>
          <ul className="divide-y divide-stone-100">
            {reservation.passengers.map((p, i) => (
              <li key={i} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-stone-900">
                    {p.given_names} {p.surname}
                    {p.person_type === 'infant' && (
                      <span className="ml-2 text-xs text-stone-500">(infant)</span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500">
                    {cap(p.room_type)}-room bed · passport to {p.passport_expiry}
                  </p>
                </div>
                {p.passport_renewal_required && (
                  <span className="text-xs text-amber-700 font-semibold">Renewal req.</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <ContactEditor
          email={reservation.lead_email || ''}
          phone={reservation.lead_phone || ''}
        />

        <p className="text-xs text-stone-400 text-center mt-8">
          Need help? Contact us on WhatsApp at{' '}
          <a href="https://wa.me/447983432900" className="text-[#C4A348] hover:underline">
            07983 432 900
          </a>
        </p>
      </div>
    </div>
  )
}

function StatusCard({
  status,
  reservation,
}: {
  status: PortalReservation['status']
  reservation: PortalReservation
}) {
  const remaining = Math.max(0, reservation.total_cost_gbp - reservation.amount_received_gbp)
  const hasReceivedAnything = reservation.amount_received_gbp > 0
  const isPartialDeposit =
    status === 'pending_payment' &&
    hasReceivedAnything &&
    reservation.amount_received_gbp < reservation.deposit_amount_gbp

  const config = {
    pending_payment: isPartialDeposit
      ? {
          tone: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: '⚠️',
          title: 'Partial deposit received',
          body: `We received ${formatGBP(reservation.amount_received_gbp)} of your ${formatGBP(reservation.deposit_amount_gbp)} deposit. Please transfer the remaining ${formatGBP(reservation.deposit_amount_gbp - reservation.amount_received_gbp)} using your reservation code as the reference.`,
        }
      : {
          tone: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: '⏳',
          title: 'Awaiting your payment',
          body: 'Choose how much to pay below, then complete a bank transfer for that amount. Press the button once sent.',
        },
    transfer_submitted: {
      tone: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: '🔎',
      title: 'Awaiting admin confirmation',
      body: "Thanks — you marked your payment as sent. We'll confirm receipt within 1–2 working days and your place will be locked in.",
    },
    confirmed: {
      tone: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: '✓',
      title: 'Your place is confirmed',
      body:
        remaining > 0
          ? `We've received your deposit — your place is secured. Remaining balance: ${formatGBP(remaining)}, due before departure.`
          : "We've received your payment in full — your place is secured.",
    },
    expired: {
      tone: 'bg-stone-100 border-stone-200 text-stone-700',
      icon: '⌛',
      title: 'This booking has expired',
      body: 'The deposit window passed. Your place was released. Please make a new booking if you still wish to travel.',
    },
    cancelled: {
      tone: 'bg-stone-100 border-stone-200 text-stone-700',
      icon: '✕',
      title: 'This booking was cancelled',
      body: 'This booking was cancelled. Please make a new booking if you still wish to travel.',
    },
  }[status]

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${config.tone}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{config.icon}</span>
        <div className="flex-1">
          <p className="font-semibold">{config.title}</p>
          <p className="text-sm mt-1 leading-relaxed">{config.body}</p>
          {reservation.admin_note && (
            <div className="mt-3 pt-3 border-t border-current/20">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
                Message from our team
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {reservation.admin_note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const msLeft = new Date(expiresAt).getTime() - now
  const secs = Math.max(0, Math.floor(msLeft / 1000))
  const dh = Math.floor(secs / 3600)
  const dm = Math.floor((secs % 3600) / 60)
  const ds = secs % 60
  const expired = secs === 0

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mt-5">
      <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-2 text-center">
        Time to complete transfer
      </p>
      <p
        className={`text-center font-mono text-3xl sm:text-4xl font-bold tracking-wider ${
          secs < 3600 ? 'text-red-600' : 'text-stone-900'
        }`}
      >
        {String(dh).padStart(2, '0')}:{String(dm).padStart(2, '0')}:{String(ds).padStart(2, '0')}
      </p>
      <p className="text-center text-xs text-stone-400 mt-2">
        {expired
          ? 'Window closed — please refresh.'
          : 'Booking will be cancelled after the window closes.'}
      </p>
    </div>
  )
}

function BankRow({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-stone-400 text-xs uppercase tracking-wider">{label}</dt>
      <dd
        className={`font-mono ${
          emphasis ? 'text-[#C4A348] text-xl font-bold' : 'text-white text-sm sm:text-base'
        } select-all`}
      >
        {value}
      </dd>
    </div>
  )
}

function ContactEditor({ email, phone }: { email: string; phone: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [emailVal, setEmailVal] = useState(email)
  const [phoneVal, setPhoneVal] = useState(phone)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <div className="text-center mt-6">
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-stone-400 hover:text-[#C4A348] transition underline"
        >
          Update contact details
        </button>
      </div>
    )
  }

  function onSave() {
    setError(null)
    startTransition(async () => {
      const r = await updateLeadContact(emailVal, phoneVal)
      if (r.ok) { setOpen(false); router.refresh() }
      else setError(r.error)
    })
  }

  const inputCls = 'rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition w-full'

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 mt-5">
      <h2 className="font-semibold text-stone-900 mb-3">Update contact details</h2>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-stone-700 font-medium">Email address</span>
          <input
            type="email"
            value={emailVal}
            onChange={e => setEmailVal(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-stone-700 font-medium">Phone number</span>
          <input
            type="tel"
            value={phoneVal}
            onChange={e => setPhoneVal(e.target.value)}
            className={inputCls}
          />
        </label>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={pending}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={() => setOpen(false)}
            disabled={pending}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  )
}

