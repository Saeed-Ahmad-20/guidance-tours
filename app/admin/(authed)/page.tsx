import Link from 'next/link'
import { supabaseAdmin } from '../../lib/supabase-admin'
import { TOTAL_PLACES, TOUR_SLUG, formatGBP } from '../../lib/booking'
import BookingsList, {
  type BookingPassenger,
  type BookingRow,
} from './bookings-list'
import WaitingListManager from './waiting-list-manager'

export const dynamic = 'force-dynamic'

type WaitingRow = {
  id: string
  name: string
  email: string
  phone: string | null
  people_requested: number
  created_at: string
}

async function loadDashboard() {
  const db = supabaseAdmin()
  await db.rpc('expire_old_reservations')

  const [{ data: places }, bookings, waiting, passengers] = await Promise.all([
    db.rpc('get_places_taken', { p_tour_slug: TOUR_SLUG }),
    db
      .from('reservations')
      .select(
        'id, reservation_code, lead_given_names, lead_surname, lead_email, lead_phone, total_people, total_cost_gbp, deposit_amount_gbp, deposit_received_gbp, quad_rooms, triple_rooms, double_rooms, status, created_at, expires_at, transfer_submitted_at, confirmed_at'
      )
      .order('created_at', { ascending: false }),
    db
      .from('waiting_list')
      .select('id, name, email, phone, people_requested, created_at')
      .order('created_at', { ascending: true }),
    db
      .from('reservation_passengers')
      .select(
        'reservation_id, position, given_names, surname, person_type, room_type, date_of_birth, passport_expiry, passport_renewal_required'
      )
      .order('position', { ascending: true }),
  ])

  const passengersByReservation = new Map<string, BookingPassenger[]>()
  for (const row of (passengers.data ?? []) as Array<
    BookingPassenger & { reservation_id: string }
  >) {
    const list = passengersByReservation.get(row.reservation_id) ?? []
    list.push(row)
    passengersByReservation.set(row.reservation_id, list)
  }

  const bookingsWithPassengers = ((bookings.data ?? []) as BookingRow[]).map(b => ({
    ...b,
    passengers: passengersByReservation.get(b.id) ?? [],
  }))

  return {
    taken: Number(places ?? 0),
    bookings: bookingsWithPassengers,
    waiting: (waiting.data ?? []) as WaitingRow[],
  }
}

export default async function AdminDashboard() {
  const { taken, bookings, waiting } = await loadDashboard()
  const remaining = Math.max(0, TOTAL_PLACES - taken)

  const counts = {
    pending: bookings.filter(b => b.status === 'pending_payment').length,
    awaiting: bookings.filter(b => b.status === 'transfer_submitted').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    expired: bookings.filter(b => b.status === 'expired').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  const depositReceived = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((s, b) => s + b.deposit_amount_gbp, 0)
  const depositOutstanding = bookings
    .filter(b => b.status === 'pending_payment' || b.status === 'transfer_submitted')
    .reduce((s, b) => s + b.deposit_amount_gbp, 0)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Umrah 2026 bookings overview</p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Places taken" value={`${taken} / ${TOTAL_PLACES}`} tone="stone" />
        <Stat label="Remaining" value={`${remaining}`} tone="gold" />
        <Stat label="Awaiting admin action" value={`${counts.awaiting}`} tone={counts.awaiting > 0 ? 'blue' : 'stone'} />
        <Stat label="Waiting list" value={`${waiting.reduce((s, w) => s + w.people_requested, 0)}`} tone="stone" />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Stat label="Deposits received" value={formatGBP(depositReceived)} tone="green" />
        <Stat label="Deposits outstanding" value={formatGBP(depositOutstanding)} tone="amber" />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Bookings</h2>
        <BookingsList bookings={bookings} counts={counts} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Waiting list</h2>
        <WaitingListManager initial={waiting} />
      </section>

      <p className="text-xs text-stone-400 text-center mt-4">
        <Link href="/" className="hover:text-[#C4A348]">← Public site</Link>
      </p>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'stone' | 'gold' | 'blue' | 'green' | 'amber'
}) {
  const toneMap = {
    stone: 'bg-white border-stone-200 text-stone-900',
    gold: 'bg-white border-[#C4A348]/30 text-[#8a6e1f]',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  }[tone]
  return (
    <div className={`rounded-xl border p-4 ${toneMap}`}>
      <p className="text-[10px] uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

