'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminUpdatePassenger } from '../../../../actions/admin'
import {
  formatGBP,
  ROOM_PRICE_GBP,
  PASSPORT_VALIDITY_CUTOFF,
  passportNeedsRenewal,
} from '../../../../lib/booking'

type PassengerRow = {
  id: string
  position: number
  given_names: string
  surname: string
  person_type: 'adult' | 'infant'
  room_type: 'quad' | 'triple' | 'double'
  room_index: number
  date_of_birth: string
  passport_expiry: string
  passport_renewal_required: boolean
}

export default function PassengerEditor({
  reservationId,
  passengers,
}: {
  reservationId: string
  passengers: PassengerRow[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)

  function onSaved() {
    setEditingId(null)
    router.refresh()
  }

  return (
    <ul className="divide-y divide-stone-100">
      {passengers.map(p =>
        editingId === p.id ? (
          <PassengerEditForm
            key={p.id}
            passenger={p}
            reservationId={reservationId}
            onSaved={onSaved}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <PassengerReadRow
            key={p.id}
            passenger={p}
            onEdit={() => setEditingId(p.id)}
          />
        )
      )}
    </ul>
  )
}

function PassengerReadRow({
  passenger: p,
  onEdit,
}: {
  passenger: PassengerRow
  onEdit: () => void
}) {
  return (
    <li className="py-3 flex items-center justify-between gap-4 text-sm">
      <div className="flex-1 min-w-0">
        <p className="text-stone-900 font-medium">
          {p.given_names} {p.surname}
          {p.person_type === 'infant' && (
            <span className="ml-2 text-xs text-stone-500">(infant)</span>
          )}
          {p.passport_renewal_required && (
            <span className="ml-2 text-xs text-amber-700 font-semibold">Renewal req.</span>
          )}
        </p>
        <p className="text-xs text-stone-500 mt-0.5">
          {cap(p.room_type)}-room bed · DOB: {p.date_of_birth} · Passport to: {p.passport_expiry}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 text-xs text-[#C4A348] hover:underline"
      >
        Edit
      </button>
    </li>
  )
}

function PassengerEditForm({
  passenger,
  reservationId,
  onSaved,
  onCancel,
}: {
  passenger: PassengerRow
  reservationId: string
  onSaved: () => void
  onCancel: () => void
}) {
  const [givenNames, setGivenNames] = useState(passenger.given_names)
  const [surname, setSurname] = useState(passenger.surname)
  const [personType, setPersonType] = useState<'adult' | 'infant'>(passenger.person_type)
  const [dob, setDob] = useState(passenger.date_of_birth)
  const [passportExpiry, setPassportExpiry] = useState(passenger.passport_expiry)
  const [roomType, setRoomType] = useState<'quad' | 'triple' | 'double'>(passenger.room_type)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const today = new Date().toISOString().slice(0, 10)
  const flagged = passportExpiry && passportNeedsRenewal(passportExpiry)
  const roomChanged = roomType !== passenger.room_type

  function onSave() {
    if (!givenNames.trim() || !surname.trim()) return setError('Name fields are required.')
    if (!dob || dob < '1900-01-01' || dob >= today) return setError('Enter a valid date of birth.')
    if (!passportExpiry) return setError('Passport expiry is required.')
    setError(null)
    startTransition(async () => {
      const r = await adminUpdatePassenger(passenger.id, reservationId, {
        given_names: givenNames,
        surname,
        person_type: personType,
        date_of_birth: dob,
        passport_expiry: passportExpiry,
        room_type: roomType,
      })
      if (r.ok) onSaved()
      else setError(r.error)
    })
  }

  const inputCls = 'text-sm rounded-lg border border-stone-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400 w-full'
  const labelCls = 'flex flex-col gap-1 text-xs font-medium text-stone-600 uppercase tracking-wider'

  return (
    <li className="py-4 flex flex-col gap-4 bg-stone-50 rounded-xl px-4 my-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#C4A348] font-bold uppercase tracking-widest">
          Person {passenger.position}
        </p>
        <select
          value={personType}
          onChange={e => setPersonType(e.target.value as 'adult' | 'infant')}
          className="text-sm rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus:outline-none"
        >
          <option value="adult">Adult</option>
          <option value="infant">Infant (0–2 yrs)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className={labelCls}>
          Given names
          <input
            value={givenNames}
            onChange={e => setGivenNames(e.target.value)}
            className={`${inputCls} font-normal normal-case tracking-normal`}
          />
        </label>
        <label className={labelCls}>
          Surname
          <input
            value={surname}
            onChange={e => setSurname(e.target.value)}
            className={`${inputCls} font-normal normal-case tracking-normal`}
          />
        </label>
        <label className={labelCls}>
          Date of birth
          <input
            type="date"
            value={dob}
            min="1900-01-01"
            max={today}
            onChange={e => setDob(e.target.value)}
            className={`${inputCls} font-normal normal-case tracking-normal`}
          />
        </label>
        <label className={labelCls}>
          Passport expiry
          <input
            type="date"
            value={passportExpiry}
            min={today}
            onChange={e => setPassportExpiry(e.target.value)}
            className={`${inputCls} font-normal normal-case tracking-normal`}
          />
        </label>
        <label className={labelCls}>
          Bed type
          <select
            value={roomType}
            onChange={e => setRoomType(e.target.value as 'quad' | 'triple' | 'double')}
            className={`${inputCls} font-normal normal-case tracking-normal`}
          >
            <option value="quad">Quad-room bed — {formatGBP(ROOM_PRICE_GBP.quad)}/person</option>
            <option value="triple">Triple-room bed — {formatGBP(ROOM_PRICE_GBP.triple)}/person</option>
            <option value="double">Double-room bed — {formatGBP(ROOM_PRICE_GBP.double)}/person</option>
          </select>
        </label>
      </div>

      {roomChanged && (
        <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          Bed type changed to {roomType} — package total will be recalculated on save.
        </p>
      )}
      {flagged && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Passport expires before {PASSPORT_VALIDITY_CUTOFF} — renewal will be flagged.
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        <button
          onClick={onCancel}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white border border-stone-300 text-stone-600 font-semibold text-sm hover:border-stone-400 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </li>
  )
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
