import { requirePortalSession } from '../../lib/portal-session'
import {
  AIRLINE,
  BAGGAGE,
  FLIGHTS,
  HOTELS,
  ITINERARY,
  hotelByName,
  hotelMapUrl,
  type Flight,
  type ItineraryDay,
  type ItineraryEvent,
} from './itinerary-data'

export const dynamic = 'force-dynamic'

const dayFmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' })

export default async function PortalItineraryPage() {
  await requirePortalSession()
  const first = ITINERARY[0].date
  const last = ITINERARY[ITINERARY.length - 1].date
  const nights = HOTELS.reduce((n, h) => n + h.nights, 0)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <section className="rounded-2xl bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] text-stone-200 p-6 sm:p-8">
        <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest">Your itinerary</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">October Umrah Trip</h1>
        <p className="text-sm text-stone-400 mt-1">
          {dayFmt(first, { day: 'numeric', month: 'short' })} –{' '}
          {dayFmt(last, { day: 'numeric', month: 'short', year: 'numeric' })}
          {` · ${nights} nights · Madinah & Makkah`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <FlightSummary label="Outbound" flights={FLIGHTS.outbound} />
          <FlightSummary label="Return" flights={FLIGHTS.inbound} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {HOTELS.map(h => (
            <div key={h.name} className="rounded-xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-stone-400">{h.city} hotel</p>
              <p className="font-semibold text-white mt-1">{h.name}</p>
              <p className="text-xs text-stone-400 mt-1">
                {h.from} – {h.to} · {h.nights} nights · {h.extras}
              </p>
              <div className="flex gap-4 mt-3 text-xs font-semibold">
                <a href={h.website} target="_blank" rel="noreferrer" className="text-[#C4A348] hover:underline">
                  Hotel website ↗
                </a>
                <a href={hotelMapUrl(h.mapQuery)} target="_blank" rel="noreferrer" className="text-[#C4A348] hover:underline">
                  View on map ↗
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs text-stone-400">
          <span>
            Baggage (included): <strong className="text-[#C4A348]">{BAGGAGE.hold}</strong> hold ·{' '}
            <strong className="text-[#C4A348]">{BAGGAGE.cabin}</strong> cabin
          </span>
          <span>Airline: {AIRLINE}</span>
        </div>
      </section>

      <h2 className="text-lg font-bold text-stone-900 mt-10 mb-4">Day by day</h2>
      <ol className="relative border-l-2 border-stone-200 ml-3 flex flex-col gap-5">
        {ITINERARY.map((day, i) => (
          <DayCard key={day.date} day={day} n={i + 1} />
        ))}
      </ol>

      <p className="text-xs text-stone-400 text-center mt-10">
        All times are local. More detail for each day will be added here before departure.
      </p>
    </div>
  )
}

function FlightSummary({ label, flights }: { label: string; flights: Flight[] }) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="text-xs uppercase tracking-wider text-stone-400">
        {label} · {flights[0].from.date}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {flights.map(f => (
          <li key={f.number} className="flex items-center gap-2 text-sm">
            <span className="font-mono text-xs text-[#C4A348] w-14 shrink-0">{f.number}</span>
            <span className="text-white">
              {f.from.code} {f.from.time}
            </span>
            <span className="text-stone-500">→</span>
            <span className="text-white">
              {f.to.code} {f.to.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CITY_CHIP: Record<ItineraryDay['city'], string> = {
  Travel: 'bg-stone-100 text-stone-600',
  Madinah: 'bg-emerald-50 text-emerald-800',
  Makkah: 'bg-amber-50 text-amber-800',
}

function DayCard({ day, n }: { day: ItineraryDay; n: number }) {
  return (
    <li className="ml-6">
      <span className="absolute -left-[9px] mt-5 w-4 h-4 rounded-full bg-white border-2 border-[#C4A348]" />
      <article className="bg-white rounded-2xl border border-stone-200 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
              Day {n} · {dayFmt(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            <h3 className="font-semibold text-stone-900 mt-0.5">{day.title}</h3>
          </div>
          <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${CITY_CHIP[day.city]}`}>
            {day.city}
          </span>
        </div>

        {day.notes && <p className="text-sm text-stone-600 mt-2 leading-relaxed">{day.notes}</p>}

        {day.events.length > 0 && (
          <ul className="mt-3 flex flex-col divide-y divide-stone-100">
            {day.events.map((e, i) => (
              <EventRow key={i} event={e} />
            ))}
          </ul>
        )}

        {day.stay && (
          <p className="text-xs text-stone-500 mt-3">
            Staying at <HotelLink name={day.stay} />
          </p>
        )}
      </article>
    </li>
  )
}

function HotelLink({ name }: { name: string }) {
  const hotel = hotelByName(name)
  if (!hotel) return <span className="font-medium text-stone-700">{name}</span>
  return (
    <a
      href={hotel.website}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-[#8a6e1f] underline decoration-[#C4A348]/40 underline-offset-2 hover:decoration-[#C4A348]"
    >
      {name}
    </a>
  )
}

function EventRow({ event }: { event: ItineraryEvent }) {
  const time = 'time' in event ? event.time : undefined
  let icon: string
  let title: React.ReactNode
  let detail: React.ReactNode = null

  switch (event.kind) {
    case 'flight': {
      const f = event.flight
      icon = '✈'
      title = (
        <>
          {f.from.city} → {f.to.city}{' '}
          <span className="font-mono text-xs text-stone-500">{f.number}</span>
        </>
      )
      detail = `${f.from.code} ${f.from.time} → ${f.to.code} ${f.to.time} · ${AIRLINE}`
      break
    }
    case 'train':
      icon = '🚆'
      title = event.title
      detail = event.detail
      break
    case 'check-in':
      icon = '🏨'
      title = <>Check in · <HotelLink name={event.hotel} /></>
      detail = event.city
      break
    case 'check-out':
      icon = '🧳'
      title = <>Check out · <HotelLink name={event.hotel} /></>
      detail = event.city
      break
    default:
      icon = '•'
      title = event.title
      detail = event.detail
  }

  return (
    <li className="py-2.5 flex items-start gap-3 text-sm">
      <span className="w-12 shrink-0 font-mono text-xs text-stone-500 pt-0.5">{time ?? ''}</span>
      <span className="w-5 shrink-0 text-center" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-stone-900">{title}</p>
        {detail && <p className="text-xs text-stone-500 mt-0.5">{detail}</p>}
      </div>
    </li>
  )
}
