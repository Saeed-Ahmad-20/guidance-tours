'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassengerContact } from '../actions/portal'
import UmrahMubarak from './umrah-mubarak'

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
    id: string
    given_names: string
    surname: string
    email: string | null
    phone: string | null
    person_type: 'adult' | 'infant'
    room_type: 'quad' | 'triple' | 'double'
    room_index: number
    passport_expiry: string
    passport_renewal_required: boolean
    passport_photo_uploaded_at: string | null
    passport_photo_url: string | null
    passport_photo_is_pdf: boolean
  }>
}

export default function PortalStatus({
  reservation,
  viewer,
  siteUrl,
}: {
  reservation: PortalReservation
  viewer: { isLead: boolean; name: string }
  siteUrl: string
}) {
  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <UmrahMubarak name={viewer.name} siteUrl={siteUrl} />

        <div className="mb-6">
          <p className="text-xs text-stone-500 uppercase tracking-widest">Reservation</p>
          <p className="font-mono text-xl sm:text-2xl font-bold text-stone-900 tracking-wider select-all">
            {reservation.reservation_code}
          </p>
          <p className="text-sm text-stone-500 mt-1">
            {viewer.isLead
              ? `${reservation.lead_given_names} ${reservation.lead_surname} · ${reservation.total_people} ${reservation.total_people === 1 ? 'person' : 'people'}`
              : `Signed in as ${viewer.name} · booked by ${reservation.lead_given_names} ${reservation.lead_surname}`}
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 mt-5">
          <h2 className="font-semibold text-stone-900 mb-1">Your Details</h2>
          <p className="text-sm text-stone-500 mb-1">
            {viewer.isLead
              ? 'Add an email address and phone number for yourself and each passenger. Passengers can also add their own.'
              : 'Add your own email address and phone number.'}
          </p>
          <ul className="divide-y divide-stone-100 mt-2">
            {reservation.passengers.map(p => (
              <li key={p.id} className="py-3 text-sm">
                <p className="text-stone-900">
                  {p.given_names} {p.surname}
                  {p.person_type === 'infant' && <span className="ml-2 text-xs text-stone-500">(infant)</span>}
                </p>
                <ContactEditor passengerId={p.id} email={p.email || ''} phone={p.phone || ''} />
              </li>
            ))}
          </ul>
        </section>

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

function ContactEditor({ passengerId, email, phone }: { passengerId: string; email: string; phone: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [emailVal, setEmailVal] = useState(email)
  const [phoneVal, setPhoneVal] = useState(phone)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSave() {
    setError(null)
    startTransition(async () => {
      const r = await updatePassengerContact(passengerId, emailVal, phoneVal)
      if (r.ok) { setOpen(false); router.refresh() }
      else setError(r.error)
    })
  }

  function onCancel() {
    setEmailVal(email)
    setPhoneVal(phone)
    setError(null)
    setOpen(false)
  }

  if (!open) {
    return (
      <div className="mt-2 text-xs text-stone-500">
        {email || phone ? (
          <p className="break-all">{[email, phone].filter(Boolean).join(' · ')}</p>
        ) : (
          <p>No email or phone added yet.</p>
        )}
        <button onClick={() => setOpen(true)} className="text-[#C4A348] hover:underline">
          {email || phone ? 'Edit contact details' : 'Add contact details'}
        </button>
      </div>
    )
  }

  const inputCls = 'rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition w-full'

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl bg-stone-50 border border-stone-200 p-3">
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-stone-700 font-medium">Email address</span>
        <input type="email" value={emailVal} onChange={e => setEmailVal(e.target.value)} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-stone-700 font-medium">Phone number</span>
        <input type="tel" value={phoneVal} onChange={e => setPhoneVal(e.target.value)} className={inputCls} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#C4A348] text-white font-semibold text-xs hover:bg-[#b2932e] transition disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
