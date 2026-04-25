'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import {
  CreateBookingInput,
  createBooking,
  joinWaitingList,
  type AvailabilityResult,
} from '../../actions/booking'
import {
  DEPARTURE_DATE,
  DEPOSIT_PER_PERSON_GBP,
  PASSPORT_VALIDITY_CUTOFF,
  Passenger,
  RETURN_DATE,
  ROOM_CAPACITY,
  ROOM_PRICE_GBP,
  RoomSelection,
  RoomType,
  buildBedLayout,
  formatGBP,
  passportNeedsRenewal,
  totalCostGBP,
  totalDepositGBP,
  totalPeople,
} from '../../lib/booking'

type Step = 'rooms' | 'passengers' | 'review'

const EMPTY_ROOMS: RoomSelection = { quad: 0, triple: 0, double: 0 }

function emptyPassenger(
  position: number,
  room_type: RoomType,
  room_index: number
): Passenger {
  return {
    position,
    room_type,
    room_index,
    person_type: 'adult',
    given_names: '',
    surname: '',
    date_of_birth: '',
    passport_expiry: '',
    passport_renewal_required: false,
  }
}

function buildPassengersFor(rooms: RoomSelection): Passenger[] {
  const out: Passenger[] = []
  const layout = buildBedLayout(rooms)
  let pos = 1
  for (const bed of layout) {
    out.push(emptyPassenger(pos, bed.room_type, bed.room_index))
    pos++
  }
  return out
}

export default function BookingWizard({
  initialAvailability,
}: {
  initialAvailability: AvailabilityResult
}) {
  const router = useRouter()
  const [availability] = useState(initialAvailability)
  const [step, setStep] = useState<Step>('rooms')
  const [rooms, setRooms] = useState<RoomSelection>(EMPTY_ROOMS)
  const [leadGivenNames, setLeadGivenNames] = useState('')
  const [leadSurname, setLeadSurname] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [notEnough, setNotEnough] = useState<{ remaining: number } | null>(null)
  const [showPartialDialog, setShowPartialDialog] = useState(false)
  const [pending, startTransition] = useTransition()

  const people = totalPeople(rooms)
  const cost = totalCostGBP(rooms)
  const deposit = totalDepositGBP(rooms)
  const remaining = availability.remaining
  const tooMany = people > remaining
  const flaggedCount = useMemo(
    () => passengers.filter(p => p.passport_expiry && passportNeedsRenewal(p.passport_expiry)).length,
    [passengers]
  )

  function setRoom(type: RoomType, value: number) {
    const v = Math.max(0, Math.min(25, Math.floor(value)))
    setRooms(prev => ({ ...prev, [type]: v }))
  }

  function reduceRoomsTo(r: RoomSelection, target: number): RoomSelection {
    let n = totalPeople(r)
    const out = { ...r }
    for (const t of ['quad', 'triple', 'double'] as RoomType[]) {
      while (n > target && out[t] > 0) { out[t]--; n-- }
    }
    return out
  }

  function proceedToPassengersWithRooms(r: RoomSelection) {
    const next = buildPassengersFor(r)
    if (next.length > 0) {
      next[0].given_names = leadGivenNames.trim()
      next[0].surname = leadSurname.trim()
    }
    setRooms(r)
    setPassengers(next)
    setStep('passengers')
  }

  function goToPassengers() {
    if (people < 1) return
    if (!leadGivenNames.trim() || !leadSurname.trim()) return
    if (tooMany) {
      setShowPartialDialog(true)
      return
    }
    proceedToPassengersWithRooms(rooms)
  }

  function updatePassenger(i: number, patch: Partial<Passenger>) {
    setPassengers(prev => {
      const out = [...prev]
      out[i] = { ...out[i], ...patch }
      if (patch.passport_expiry !== undefined) {
        out[i].passport_renewal_required = patch.passport_expiry
          ? passportNeedsRenewal(patch.passport_expiry)
          : false
      }
      return out
    })
  }

  function passengersComplete(): boolean {
    return passengers.every(
      p =>
        p.given_names.trim() &&
        p.surname.trim() &&
        dobIsValid(p.date_of_birth) &&
        p.passport_expiry
    )
  }

  function submit() {
    setSubmitError(null)
    const input: CreateBookingInput = {
      rooms,
      leadGivenNames: leadGivenNames.trim(),
      leadSurname: leadSurname.trim(),
      leadEmail: leadEmail.trim() || undefined,
      leadPhone: leadPhone.trim() || undefined,
      passengers,
    }
    startTransition(async () => {
      const result = await createBooking(input)
      if (result.ok) {
        router.push(`/umrah-2026/book/confirmation/${result.code}`)
        return
      }
      if (result.error === 'not_enough_places') {
        setNotEnough({ remaining: result.remaining })
        return
      }
      setSubmitError(result.error === 'validation' ? result.message : result.message)
    })
  }

  return (
    <div className="w-full bg-stone-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8">
          <Link
            href="/umrah-2026"
            className="text-sm text-stone-500 hover:text-[#C4A348] transition-colors"
          >
            ← Back to Umrah 2026
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-4">
            Book your place
          </h1>
          <p className="text-stone-500 mt-2">
            {remaining > 0
              ? `${remaining} ${remaining === 1 ? 'place' : 'places'} remaining on this trip.`
              : 'This trip is fully booked — you can join the waiting list below.'}
          </p>
        </div>

        {remaining === 0 ? (
          <WaitingListInlineForm />
        ) : (
          <>
            <Stepper step={step} />

            {step === 'rooms' && (
              <RoomsStep
                rooms={rooms}
                setRoom={setRoom}
                leadGivenNames={leadGivenNames}
                leadSurname={leadSurname}
                leadEmail={leadEmail}
                leadPhone={leadPhone}
                setLeadGivenNames={setLeadGivenNames}
                setLeadSurname={setLeadSurname}
                setLeadEmail={setLeadEmail}
                setLeadPhone={setLeadPhone}
                people={people}
                cost={cost}
                deposit={deposit}
                remaining={remaining}
                onNext={goToPassengers}
              />
            )}

            {step === 'passengers' && (
              <PassengersStep
                passengers={passengers}
                update={updatePassenger}
                onBack={() => setStep('rooms')}
                onNext={() => setStep('review')}
                canContinue={passengersComplete()}
              />
            )}

            {step === 'review' && (
              <ReviewStep
                rooms={rooms}
                passengers={passengers}
                leadGivenNames={leadGivenNames}
                leadSurname={leadSurname}
                leadEmail={leadEmail}
                leadPhone={leadPhone}
                cost={cost}
                deposit={deposit}
                flaggedCount={flaggedCount}
                pending={pending}
                submitError={submitError}
                onBack={() => setStep('passengers')}
                onSubmit={submit}
                onCancel={() => router.push('/umrah-2026')}
              />
            )}
          </>
        )}

        {showPartialDialog && (
          <PartialSpacesDialog
            requested={people}
            remaining={remaining}
            leadName={`${leadGivenNames} ${leadSurname}`.trim()}
            leadEmail={leadEmail}
            leadPhone={leadPhone}
            onProceed={() => {
              setShowPartialDialog(false)
              proceedToPassengersWithRooms(reduceRoomsTo(rooms, remaining))
            }}
            onClose={() => setShowPartialDialog(false)}
          />
        )}

        {notEnough && (
          <NotEnoughDialog
            remaining={notEnough.remaining}
            leadName={`${leadGivenNames} ${leadSurname}`.trim()}
            leadEmail={leadEmail}
            leadPhone={leadPhone}
            onClose={() => setNotEnough(null)}
            onProceedWith={() => {
              const reduced = reduceRoomsTo(rooms, notEnough.remaining)
              setRooms(reduced)
              setNotEnough(null)
              setStep('rooms')
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ── Stepper ── */
function Stepper({ step }: { step: Step }) {
  const items: { id: Step; label: string }[] = [
    { id: 'rooms', label: 'Rooms' },
    { id: 'passengers', label: 'Passenger details' },
    { id: 'review', label: 'Review & confirm' },
  ]
  const idx = items.findIndex(i => i.id === step)
  return (
    <ol className="flex items-center gap-2 sm:gap-3 mb-8 text-xs sm:text-sm">
      {items.map((item, i) => {
        const active = i === idx
        const done = i < idx
        return (
          <li key={item.id} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold transition-colors ${
                done
                  ? 'bg-[#C4A348] text-white'
                  : active
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <span
              className={`${
                active ? 'text-stone-900 font-semibold' : 'text-stone-500'
              } hidden sm:inline`}
            >
              {item.label}
            </span>
            {i < items.length - 1 && <span className="w-6 sm:w-10 h-px bg-stone-200" />}
          </li>
        )
      })}
    </ol>
  )
}

/* ── Step 1: Rooms + lead Passenger ── */
function RoomsStep(props: {
  rooms: RoomSelection
  setRoom: (t: RoomType, v: number) => void
  leadGivenNames: string
  leadSurname: string
  leadEmail: string
  leadPhone: string
  setLeadGivenNames: (s: string) => void
  setLeadSurname: (s: string) => void
  setLeadEmail: (s: string) => void
  setLeadPhone: (s: string) => void
  people: number
  cost: number
  deposit: number
  remaining: number
  onNext: () => void
}) {
  const {
    rooms,
    setRoom,
    leadGivenNames,
    leadSurname,
    leadEmail,
    leadPhone,
    setLeadGivenNames,
    setLeadSurname,
    setLeadEmail,
    setLeadPhone,
    people,
    cost,
    deposit,
    remaining,
    onNext,
  } = props
  const tooMany = people > remaining
  const canContinue =
    people >= 1 && leadGivenNames.trim() !== '' && leadSurname.trim() !== ''

  const roomConfigs: { type: RoomType; label: string; perPerson: number; capacity: number }[] = [
    { type: 'quad', label: 'Quad-room bed', perPerson: ROOM_PRICE_GBP.quad, capacity: ROOM_CAPACITY.quad },
    { type: 'triple', label: 'Triple-room bed', perPerson: ROOM_PRICE_GBP.triple, capacity: ROOM_CAPACITY.triple },
    { type: 'double', label: 'Double-room bed', perPerson: ROOM_PRICE_GBP.double, capacity: ROOM_CAPACITY.double },
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Choose your beds</h2>
        <p className="text-sm text-stone-500 mb-6">
          Each selection is one bed in a shared room of that type. Prices are per person — mix and match as you wish.
        </p>
        <div className="flex flex-col gap-3">
          {roomConfigs.map(r => (
            <div
              key={r.type}
              className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 p-4"
            >
              <div className="flex-1">
                <p className="font-semibold text-stone-900">{r.label}</p>
                <p className="text-xs text-stone-500">
                  {sharingDescription(r.capacity, rooms[r.type])} · {formatGBP(r.perPerson)} per person
                </p>
              </div>
              <Stepper2
                value={rooms[r.type]}
                onChange={v => setRoom(r.type, v)}
              />
            </div>
          ))}
        </div>
        {tooMany && (
          <p className="mt-4 text-sm text-amber-700">
            You&apos;ve selected {people} spaces but only {remaining}{' '}
            {remaining === 1 ? 'is' : 'are'} available. Continue to see your options.
          </p>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Lead Passenger</h2>
        <p className="text-sm text-stone-500 mb-6">
          You&apos;ll use these details (surname + reservation number) to log into your portal.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Given names" required>
            <input
              value={leadGivenNames}
              onChange={e => setLeadGivenNames(e.target.value)}
              className={inputClass}
              placeholder="As on passport"
            />
          </Field>
          <Field label="Surname" required>
            <input
              value={leadSurname}
              onChange={e => setLeadSurname(e.target.value)}
              className={inputClass}
              placeholder="As on passport"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={leadEmail}
              onChange={e => setLeadEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={leadPhone}
              onChange={e => setLeadPhone(e.target.value)}
              className={inputClass}
              placeholder="07…"
            />
          </Field>
        </div>
      </section>

      <TotalsBar people={people} cost={cost} deposit={deposit} />

      <div className="flex justify-end">
        <button
          disabled={!canContinue}
          onClick={onNext}
          className={primaryBtn}
        >
          Continue to passenger details
        </button>
      </div>
    </div>
  )
}

/* ── Number stepper ── */
function Stepper2({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        className="w-9 h-9 rounded-full border border-stone-300 text-stone-700 font-semibold disabled:opacity-40 hover:border-[#C4A348] hover:text-[#C4A348] transition"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="w-8 text-center font-semibold text-stone-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 rounded-full border border-stone-300 text-stone-700 font-semibold hover:border-[#C4A348] hover:text-[#C4A348] transition"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

/* ── Step 2: Passenger details ── */
function PassengersStep({
  passengers,
  update,
  onBack,
  onNext,
  canContinue,
}: {
  passengers: Passenger[]
  update: (i: number, patch: Partial<Passenger>) => void
  onBack: () => void
  onNext: () => void
  canContinue: boolean
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
        Enter each person&apos;s details <strong>exactly as shown on their passport</strong>.
        Travel dates: <strong>{DEPARTURE_DATE}</strong> to <strong>{RETURN_DATE}</strong>.
      </div>

      {passengers.map((p, i) => {
        const roomLabel = `${cap(p.room_type)}-room bed`
        const flagged = p.passport_expiry && passportNeedsRenewal(p.passport_expiry)
        const dobInvalid = p.date_of_birth && !dobIsValid(p.date_of_birth)
        return (
          <section key={i} className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-[#C4A348] font-bold uppercase tracking-widest">
                  Person {i + 1}
                </p>
                <p className="text-sm text-stone-500">{roomLabel}</p>
              </div>
              <select
                value={p.person_type}
                onChange={e => update(i, { person_type: e.target.value as 'adult' | 'infant' })}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm bg-white"
              >
                <option value="adult">Adult</option>
                <option value="infant">Infant (0–2 yrs)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Given names" required>
                <input
                  value={p.given_names}
                  onChange={e => update(i, { given_names: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Surname" required>
                <input
                  value={p.surname}
                  onChange={e => update(i, { surname: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Date of birth" required>
                <input
                  type="date"
                  value={p.date_of_birth}
                  onChange={e => update(i, { date_of_birth: e.target.value })}
                  min="1900-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputClass}
                />
              </Field>
              <Field label="Passport expiry" required>
                <input
                  type="date"
                  value={p.passport_expiry}
                  onChange={e => update(i, { passport_expiry: e.target.value })}
                  min={new Date().toISOString().slice(0, 10)}
                  className={inputClass}
                />
              </Field>
            </div>
            {dobInvalid && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                <strong>Invalid date of birth.</strong> Please enter a date between 1 January 1900 and today.
              </div>
            )}
            {flagged && (
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                <strong>Passport renewal required.</strong> This passport expires before{' '}
                <strong>{PASSPORT_VALIDITY_CUTOFF}</strong> (6 months after the return date).
                You&apos;ll need a renewed passport at least <strong>60 days before flying</strong>.
                You can continue and renew later, or go back and remove this person.
              </div>
            )}
          </section>
        )
      })}

      <div className="flex items-center justify-between mt-2">
        <button onClick={onBack} className={secondaryBtn}>
          ← Back
        </button>
        <button disabled={!canContinue} onClick={onNext} className={primaryBtn}>
          Review booking
        </button>
      </div>
    </div>
  )
}

/* ── Step 3: Review ── */
function ReviewStep({
  rooms,
  passengers,
  leadGivenNames,
  leadSurname,
  leadEmail,
  leadPhone,
  cost,
  deposit,
  flaggedCount,
  pending,
  submitError,
  onBack,
  onSubmit,
  onCancel,
}: {
  rooms: RoomSelection
  passengers: Passenger[]
  leadGivenNames: string
  leadSurname: string
  leadEmail: string
  leadPhone: string
  cost: number
  deposit: number
  flaggedCount: number
  pending: boolean
  submitError: string | null
  onBack: () => void
  onSubmit: () => void
  onCancel: () => void
}) {
  const [showTerms, setShowTerms] = useState(false)
  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Booking summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
          <SummaryRow label="Lead Passenger" value={`${leadGivenNames} ${leadSurname}`} />
          {leadEmail && <SummaryRow label="Email" value={leadEmail} />}
          {leadPhone && <SummaryRow label="Phone" value={leadPhone} />}
          <SummaryRow label="Beds" value={summaryRooms(rooms)} />
          <SummaryRow label="Total people" value={`${passengers.length}`} />
          <SummaryRow label="Package total" value={formatGBP(cost)} />
          <SummaryRow label="Deposit due now" value={formatGBP(deposit)} emphasis />
        </dl>
      </section>

      {flaggedCount > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">
            {flaggedCount} passport{flaggedCount === 1 ? '' : 's'} need renewal.
          </p>
          <p>
            You can continue and renew <strong>at least 60 days before flying</strong>,
            or go back and remove the affected person(s).
          </p>
        </div>
      )}

      <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Passengers</h2>
        <ul className="divide-y divide-stone-100">
          {passengers.map((p, i) => (
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

      <div className="rounded-xl bg-[#2C1F0E] text-stone-200 p-5 sm:p-6 text-sm leading-relaxed">
        <p className="text-[#C4A348] font-semibold uppercase tracking-widest text-xs mb-2">
          What happens next
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>We generate your reservation number on the next page.</li>
          <li>You transfer the <strong>{formatGBP(deposit)}</strong> deposit to our account using the reservation number as the reference.</li>
          <li>You have <strong>24 hours</strong> to complete the transfer before the booking is released.</li>
          <li>Once we confirm receipt, your place is secured.</li>
        </ol>
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
        <div className="flex items-center gap-3">
          <button onClick={onBack} disabled={pending} className={secondaryBtn}>
            ← Edit
          </button>
          <button onClick={onCancel} disabled={pending} className="text-sm text-stone-500 hover:text-red-600 transition">
            Cancel booking
          </button>
        </div>
        <button onClick={() => setShowTerms(true)} disabled={pending} className={primaryBtn}>
          {pending ? 'Reserving your place…' : 'Confirm & get bank details'}
        </button>
      </div>

      {showTerms && (
        <BookingTermsModal
          deposit={deposit}
          onConfirm={() => { setShowTerms(false); onSubmit() }}
          onCancel={onCancel}
        />
      )}
    </div>
  )
}

/* ── Not enough places modal ── */
function NotEnoughDialog({
  remaining,
  leadName,
  leadEmail,
  leadPhone,
  onClose,
  onProceedWith,
}: {
  remaining: number
  leadName: string
  leadEmail: string
  leadPhone: string
  onClose: () => void
  onProceedWith: () => void
}) {
  const [mode, setMode] = useState<'choice' | 'waiting'>(remaining === 0 ? 'waiting' : 'choice')
  const [name, setName] = useState(leadName)
  const [email, setEmail] = useState(leadEmail)
  const [phone, setPhone] = useState(leadPhone)
  const [people, setPeople] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submitWaiting() {
    setSubmitting(true)
    setErr(null)
    const r = await joinWaitingList({
      name,
      email,
      phone: phone || undefined,
      peopleRequested: people,
    })
    setSubmitting(false)
    if (r.ok) setDone(true)
    else setErr(r.error || 'Could not save your request.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {done ? (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">You&apos;re on the list</h3>
            <p className="text-sm text-stone-600 mb-5">
              We&apos;ll be in touch if a place opens up. You can close this window.
            </p>
            <button onClick={onClose} className={primaryBtn}>Close</button>
          </>
        ) : mode === 'choice' ? (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Not enough spaces left
            </h3>
            <p className="text-sm text-stone-600 mb-5">
              Only <strong>{remaining}</strong>{' '}
              {remaining === 1 ? 'space is' : 'spaces are'} currently available — another
              booking may have just come through. Would you like to proceed with{' '}
              <strong>{remaining}</strong> or join the waiting list?
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={onProceedWith} className={primaryBtn}>
                Proceed with {remaining} {remaining === 1 ? 'space' : 'spaces'}
              </button>
              <button onClick={() => setMode('waiting')} className={secondaryBtn}>
                Join waiting list
              </button>
              <button onClick={onClose} className="text-sm text-stone-400 hover:text-stone-600 mt-1">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              {remaining === 0 ? 'This trip is fully booked' : 'Join the waiting list'}
            </h3>
            {remaining === 0 && (
              <p className="text-sm text-stone-500 mb-4">
                Enter your details and we&apos;ll contact you if a space becomes available.
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Field label="Name" required>
                <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Email" required>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Phone" required>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
              </Field>
              <Field label="How many spaces">
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={people}
                  onChange={e => setPeople(Math.max(1, parseInt(e.target.value || '1')))}
                  className={inputClass}
                />
              </Field>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <div className="flex gap-2 mt-2">
                {remaining > 0 && (
                  <button onClick={() => setMode('choice')} className={secondaryBtn}>
                    ← Back
                  </button>
                )}
                <button
                  onClick={submitWaiting}
                  disabled={submitting || !name.trim() || !email.trim() || !phone.trim()}
                  className={primaryBtn}
                >
                  {submitting ? 'Submitting…' : 'Join waiting list'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Partial spaces dialog ── */
function PartialSpacesDialog({
  requested,
  remaining,
  leadName,
  leadEmail,
  leadPhone,
  onProceed,
  onClose,
}: {
  requested: number
  remaining: number
  leadName: string
  leadEmail: string
  leadPhone: string
  onProceed: () => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<'choice' | 'waiting'>('choice')
  const [name, setName] = useState(leadName)
  const [email, setEmail] = useState(leadEmail)
  const [phone, setPhone] = useState(leadPhone)
  const [people, setPeople] = useState(requested)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submitWaiting() {
    setSubmitting(true)
    setErr(null)
    const r = await joinWaitingList({ name, email, phone: phone || undefined, peopleRequested: people })
    setSubmitting(false)
    if (r.ok) setDone(true)
    else setErr(r.error || 'Could not save your request.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {done ? (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">You&apos;re on the list</h3>
            <p className="text-sm text-stone-600 mb-5">
              We&apos;ll be in touch if a place opens up.
            </p>
            <button onClick={onClose} className={primaryBtn}>Close</button>
          </>
        ) : mode === 'choice' ? (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Not enough spaces for your group
            </h3>
            <p className="text-sm text-stone-600 mb-5">
              You&apos;ve selected <strong>{requested} {requested === 1 ? 'space' : 'spaces'}</strong> but
              only <strong>{remaining} {remaining === 1 ? 'is' : 'are'}</strong> currently available.
              Would you like to proceed with <strong>{remaining}</strong> or join the waiting list?
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={onProceed} className={primaryBtn}>
                Proceed with {remaining} {remaining === 1 ? 'space' : 'spaces'}
              </button>
              <button onClick={() => setMode('waiting')} className={secondaryBtn}>
                Join waiting list
              </button>
              <button onClick={onClose} className="text-sm text-stone-400 hover:text-stone-600 mt-1">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Join the waiting list</h3>
            <div className="flex flex-col gap-3">
              <Field label="Name" required>
                <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Email" required>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Phone" required>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
              </Field>
              <Field label="How many spaces">
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={people}
                  onChange={e => setPeople(Math.max(1, parseInt(e.target.value || '1')))}
                  className={inputClass}
                />
              </Field>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <div className="flex gap-2 mt-2">
                <button onClick={() => setMode('choice')} className={secondaryBtn}>
                  ← Back
                </button>
                <button
                  onClick={submitWaiting}
                  disabled={submitting || !name.trim() || !email.trim() || !phone.trim()}
                  className={primaryBtn}
                >
                  {submitting ? 'Submitting…' : 'Join waiting list'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Inline waiting list form (shown when trip is fully booked) ── */
function WaitingListInlineForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [people, setPeople] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setErr(null)
    const r = await joinWaitingList({ name, email, phone: phone || undefined, peopleRequested: people })
    setSubmitting(false)
    if (r.ok) setDone(true)
    else setErr(r.error || 'Could not save your request.')
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
        <p className="text-lg font-semibold text-stone-900 mb-2">You&apos;re on the list</p>
        <p className="text-sm text-stone-500">
          We&apos;ll be in touch if a space becomes available.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
      <h2 className="text-lg font-semibold text-stone-900 mb-1">Join the waiting list</h2>
      <p className="text-sm text-stone-500 mb-6">
        Enter your details below and we&apos;ll contact you if a space becomes available.
      </p>
      <div className="flex flex-col gap-4">
        <Field label="Full name" required>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className={inputClass}
            placeholder="Your full name"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone" required>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={inputClass}
              placeholder="07…"
            />
          </Field>
        </div>
        <Field label="Number of spaces required">
          <input
            type="number"
            min={1}
            max={25}
            value={people}
            onChange={e => setPeople(Math.max(1, parseInt(e.target.value || '1')))}
            className={inputClass}
          />
        </Field>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          onClick={submit}
          disabled={submitting || !name.trim() || !email.trim() || !phone.trim()}
          className={primaryBtn}
        >
          {submitting ? 'Submitting…' : 'Join waiting list'}
        </button>
      </div>
    </div>
  )
}

/* ── Booking terms modal ── */
function BookingTermsModal({
  deposit,
  onConfirm,
  onCancel,
}: {
  deposit: number
  onConfirm: () => void
  onCancel: () => void
}) {
  const policies = [
    {
      title: 'Deposit & refund policy',
      body: `A non-refundable deposit of ${formatGBP(deposit)} is required to secure your place. Once payment has been received, this deposit cannot be returned under any circumstances.`,
    },
    {
      title: 'Final payment',
      body: 'The remaining balance must be paid in full no later than 8 weeks before the departure date. Failure to settle the balance by this deadline may result in the cancellation of your reservation. For amendments or any concerns regarding your travel arrangements, please contact us at tours@guidance.org as early as possible.',
    },
    {
      title: 'No-show policy',
      body: 'Any passenger who does not travel without providing prior written notice will not be entitled to a refund of any amounts paid.',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="bg-[#2C1F0E] px-6 py-5">
          <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest mb-1">Important</p>
          <h3 className="text-white text-xl font-bold">Before you confirm</h3>
          <p className="text-stone-400 text-sm mt-1">Please review the following before proceeding.</p>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3 max-h-[55vh] overflow-y-auto">
          {policies.map(p => (
            <div key={p.title} className="rounded-xl bg-stone-50 border border-stone-200 p-4">
              <p className="font-semibold text-stone-900 text-sm mb-1">{p.title}</p>
              <p className="text-sm text-stone-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-5 border-t border-stone-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-stone-500 hover:text-red-600 transition text-left"
          >
            Cancel booking
          </button>
          <button onClick={onConfirm} className={primaryBtn}>
            I understand — confirm booking
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Small pieces ── */
function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-stone-700 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <>
      <dt className="text-stone-500">{label}</dt>
      <dd className={emphasis ? 'font-bold text-[#C4A348] sm:text-right' : 'text-stone-900 sm:text-right'}>
        {value}
      </dd>
    </>
  )
}

function TotalsBar({
  people,
  cost,
  deposit,
}: {
  people: number
  cost: number
  deposit: number
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#2C1F0E] to-[#3d2c16] text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#C4A348]">Total people</p>
        <p className="text-2xl font-bold">{people}</p>
      </div>
      <div className="h-8 w-px bg-white/20 hidden sm:block" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-stone-400">Package total</p>
        <p className="text-2xl font-bold">{formatGBP(cost)}</p>
      </div>
      <div className="h-8 w-px bg-white/20 hidden sm:block" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-stone-400">
          Deposit now ({formatGBP(DEPOSIT_PER_PERSON_GBP)} × {people})
        </p>
        <p className="text-2xl font-bold text-[#C4A348]">{formatGBP(deposit)}</p>
      </div>
    </div>
  )
}

function summaryRooms(rooms: RoomSelection): string {
  const parts: string[] = []
  if (rooms.quad) parts.push(`${rooms.quad} quad-room ${rooms.quad === 1 ? 'bed' : 'beds'}`)
  if (rooms.triple) parts.push(`${rooms.triple} triple-room ${rooms.triple === 1 ? 'bed' : 'beds'}`)
  if (rooms.double) parts.push(`${rooms.double} double-room ${rooms.double === 1 ? 'bed' : 'beds'}`)
  return parts.join(', ') || '—'
}

function dobIsValid(dob: string): boolean {
  if (!dob) return false
  const today = new Date().toISOString().slice(0, 10)
  return dob >= '1900-01-01' && dob < today
}

function sharingDescription(capacity: number, selected: number): string {
  if (selected === 0) {
    const others = capacity - 1
    return `Shared with ${others} other${others === 1 ? '' : 's'}`
  }
  const fullRooms = Math.floor(selected / capacity)
  const partial = selected % capacity
  const parts: string[] = []
  if (fullRooms > 0) parts.push(`${fullRooms} full room${fullRooms === 1 ? '' : 's'}`)
  if (partial > 0) {
    const strangers = capacity - partial
    parts.push(`${partial === 1 ? '1 bed' : `${partial} beds`} shared with ${strangers} other${strangers === 1 ? '' : 's'}`)
  }
  return parts.join(' · ')
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const inputClass =
  'rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/20 outline-none transition'

const primaryBtn =
  'inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50 disabled:cursor-not-allowed'

const secondaryBtn =
  'inline-flex items-center justify-center px-5 py-3 rounded-full bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200 transition disabled:opacity-50'
