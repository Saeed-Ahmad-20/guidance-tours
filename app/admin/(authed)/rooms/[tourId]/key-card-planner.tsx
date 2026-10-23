'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { linkBookings, unlinkTravelGroup } from '../../../../actions/admin'
import type { BookingPerson, TravelGroup } from '../../../../lib/key-cards-data'
import { planKeyCards, type KeyBooking, type PlannedRoom, type RoomType } from '../../../../lib/key-cards'

const TYPES: { type: RoomType; label: string }[] = [
  { type: 'quad', label: 'Quad rooms' },
  { type: 'triple', label: 'Triple rooms' },
  { type: 'double', label: 'Double rooms' },
]

export default function KeyCardPlanner({
  tourId,
  rooms,
  bookings,
  groups,
  people,
  groupingReady,
}: {
  tourId: string
  rooms: PlannedRoom[]
  bookings: KeyBooking[]
  groups: TravelGroup[]
  people: BookingPerson[]
  groupingReady: boolean
}) {
  const storageKey = `key-cards:${tourId}`
  const [numbers, setNumbers] = useState<Record<RoomType, string[]>>({ quad: [], triple: [], double: [] })

  // Keep what has been entered, so a refresh at the hotel doesn't lose it.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null')
      const valid = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string')
      // Read after mount, so the server and browser first render the same thing.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && valid(saved.quad) && valid(saved.triple) && valid(saved.double)) setNumbers(saved)
    } catch {
      /* storage unavailable */
    }
  }, [storageKey])
  function update(type: RoomType, values: string[]) {
    const next = { ...numbers, [type]: values }
    setNumbers(next)
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }

  const entered = numbers.quad.length + numbers.triple.length + numbers.double.length
  const plan = useMemo(() => planKeyCards(rooms, bookings, numbers), [rooms, bookings, numbers])
  const planned = (type: RoomType) => rooms.filter(r => r.type === type && r.members.length > 0).length

  return (
    <div className="flex flex-col gap-5">
      {groupingReady ? (
        <TravellingTogether tourId={tourId} groups={groups} people={people} />
      ) : (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Linking bookings that travel together needs one database update first: run supabase/migrations/20261024_travel_groups.sql
          in Supabase. Everything else here works without it.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {TYPES.map(t => (
          <RoomNumberInput
            key={t.type}
            label={t.label}
            needed={planned(t.type)}
            values={numbers[t.type]}
            taken={TYPES.filter(o => o.type !== t.type).flatMap(o => numbers[o.type])}
            onChange={values => update(t.type, values)}
          />
        ))}
      </div>

      {entered === 0 ? (
        <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-5">
          Add the room numbers above. Press Enter or space after each one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {plan.missing.map(m => (
            <p key={m.type} className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
              {m.rooms.length} {m.type} room{m.rooms.length === 1 ? '' : 's'} still need a card:{' '}
              {m.rooms.map(r => r.members.map(p => p.name).join(' & ')).join(' · ')}
            </p>
          ))}

          {plan.handouts.map(h => (
            <section key={h.booking.id} className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold text-stone-900">{h.booking.leadName}</p>
                  <p className="text-xs text-stone-500">
                    Booking <span className="font-mono">{h.booking.code}</span> · {h.booking.size} people
                    {h.booking.alsoWith && ` · together with ${h.booking.alsoWith.join(' and ')}`}
                    {h.booking.leadPhone && (
                      <>
                        {' · '}
                        <a href={`tel:${h.booking.leadPhone}`} className="text-[#8a6e1f] hover:underline">
                          {h.booking.leadPhone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <p className="text-sm font-bold text-[#8a6e1f]">
                  {h.cards.length} card{h.cards.length === 1 ? '' : 's'}
                </p>
              </div>
              <ul className="mt-3 divide-y divide-stone-100">
                {h.cards.map(c => (
                  <li key={`${c.type}-${c.number}`} className="py-2.5 flex items-start gap-4 text-sm">
                    <span className="font-mono text-lg font-bold text-stone-900 w-16 shrink-0">{c.number}</span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold">{c.type}</p>
                      <p className="text-stone-700">
                        {c.members.map(m => (m.infant ? `${m.name} (infant)` : m.name)).join(', ')}
                      </p>
                      {c.members.some(m => m.reservationId !== h.booking.id) && (
                        <p className="text-xs text-amber-700 mt-0.5">Shared with another booking.</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

// One room type's key-card numbers. Each number is added on its own, and repeats and extras are refused.
function RoomNumberInput({
  label,
  needed,
  values,
  taken,
  onChange,
}: {
  label: string
  needed: number
  values: string[]
  taken: string[] // numbers already entered under the other room types
  onChange: (values: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const full = values.length >= needed
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

  function commit(text: string) {
    const next = [...values]
    let note: string | null = null
    for (const token of text.split(/[\s,;]+/).filter(Boolean)) {
      if (next.some(v => same(v, token))) note = `${token} is already entered.`
      else if (taken.some(v => same(v, token))) note = `${token} is already entered as another room type.`
      else if (next.length >= needed) note = `Only ${needed} needed.`
      else next.push(token)
    }
    if (next.length !== values.length) onChange(next)
    setMessage(note)
    setDraft('')
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col gap-2">
      <span className="text-sm font-semibold text-stone-900">{label}</span>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {values.map(v => (
            <li key={v} className="inline-flex items-center gap-1 rounded-full bg-stone-100 pl-2.5 pr-1 py-0.5 font-mono text-sm">
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => {
                  setMessage(null)
                  onChange(values.filter(x => x !== v))
                }}
                className="w-5 h-5 rounded-full text-stone-500 hover:bg-stone-200 hover:text-stone-900"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        value={draft}
        onChange={e => {
          const v = e.target.value
          // A space or comma finishes a number.
          if (/[\s,;]$/.test(v)) commit(v)
          else setDraft(v)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit(draft)
          }
        }}
        onBlur={() => draft.trim() && commit(draft)}
        disabled={full}
        enterKeyHint="done"
        placeholder={needed === 0 ? 'No rooms of this type' : full ? 'All entered' : 'Room number'}
        className="text-sm rounded-lg border border-stone-300 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#C4A348]/40 disabled:bg-stone-50 disabled:text-stone-400"
      />
      {message && <p className="text-xs text-red-600">{message}</p>}
      <span className="text-xs text-stone-500">
        {values.length} of {needed} entered
      </span>
    </div>
  )
}

// Bookings made separately that are really one party. They are handled as one when handing out cards.
function TravellingTogether({
  tourId,
  groups,
  people,
}: {
  tourId: string
  groups: TravelGroup[]
  people: BookingPerson[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<BookingPerson[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const q = query.trim().toLowerCase()
  const matches = q
    ? people
        .filter(p => !picked.some(x => x.code === p.code))
        .map(p => ({
          p,
          hit: p.names.find(n => n.toLowerCase().includes(q)) ?? (p.leadName.toLowerCase().includes(q) ? p.leadName : null),
        }))
        .filter(m => m.hit)
        .slice(0, 6)
    : []

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>, onDone?: () => void) {
    setError(null)
    startTransition(async () => {
      const r = await action()
      if (r.ok) {
        onDone?.()
        router.refresh()
      } else setError(r.error)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-stone-900">Bookings travelling together</p>
        <p className="text-xs text-stone-500 mt-0.5">
          If separate bookings are really one party, search for a passenger on each and link them. Their cards are then
          given to one lead passenger, the lead of the biggest booking.
        </p>
      </div>

      {groups.length > 0 && (
        <ul className="flex flex-col gap-2">
          {groups.map(g => (
            <li
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-50 border border-stone-200 px-3 py-2 text-sm"
            >
              <span className="text-stone-800">{g.parts.map(p => p.leadName).join(' + ')}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => unlinkTravelGroup(g.id))}
                className="text-xs font-semibold text-stone-500 hover:text-red-600 transition disabled:opacity-50"
              >
                Unlink
              </button>
            </li>
          ))}
        </ul>
      )}

      {picked.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {picked.map(p => (
            <li
              key={p.code}
              className="inline-flex items-center gap-1 rounded-full bg-[#C4A348]/15 text-[#6b5314] pl-3 pr-1 py-0.5 text-sm"
            >
              {p.leadName}
              <button
                type="button"
                aria-label={`Remove ${p.leadName}`}
                onClick={() => setPicked(picked.filter(x => x.code !== p.code))}
                className="w-5 h-5 rounded-full hover:bg-[#C4A348]/30"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Start typing a passenger’s name…"
          autoComplete="off"
          className="w-full text-sm rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C4A348]/40"
        />
        {matches.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-stone-200 bg-white shadow-lg overflow-hidden">
            {matches.map(({ p, hit }) => (
              <li key={p.code}>
                <button
                  type="button"
                  onClick={() => {
                    setPicked([...picked, p])
                    setQuery('')
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50"
                >
                  <span className="text-stone-900">{hit}</span>
                  <span className="block text-xs text-stone-500">
                    Booking of {p.leadName} · {p.names.length} {p.names.length === 1 ? 'person' : 'people'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {q && matches.length === 0 && <p className="text-xs text-stone-500 mt-1">No confirmed passenger matches.</p>}
      </div>

      <button
        type="button"
        disabled={pending || picked.length < 2}
        onClick={() =>
          run(
            () => linkBookings(tourId, picked.map(p => p.code).join(' ')),
            () => setPicked([])
          )
        }
        className="self-start text-sm font-semibold px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition disabled:opacity-40"
      >
        {pending ? 'Linking…' : picked.length < 2 ? 'Pick two or more bookings' : `Link ${picked.length} bookings`}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
