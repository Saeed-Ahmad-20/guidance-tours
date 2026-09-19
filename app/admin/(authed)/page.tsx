import Link from 'next/link'
import { supabaseAdmin } from '../../lib/supabase-admin'
import { ageGroup, effectiveDepositGBP, formatTourLabel } from '../../lib/booking'
import BookingsList, {
  type BookingPassenger,
  type BookingRow,
} from './bookings-list'
import WaitingListManager from './waiting-list-manager'
import PaymentStatsToggle from './payment-stats-toggle'
import CustomerDirectory, { type CustomerRow } from './customer-directory'

export const dynamic = 'force-dynamic'

type WaitingRow = {
  id: string
  name: string
  email: string
  phone: string | null
  people_requested: number
  created_at: string
}

type TourGroup = {
  tour: {
    id: string
    slug: string
    label: string
    totalPlaces: number
    departureDate: string | null
  }
  taken: number
  bookings: BookingRow[]
  waiting: WaitingRow[]
}

type Dashboard = {
  groups: TourGroup[]
  customers: CustomerRow[]
  tours: { id: string; label: string }[]
}

async function loadDashboard(): Promise<Dashboard> {
  const db = supabaseAdmin()
  await db.rpc('expire_old_reservations')

  const [{ data: tours }, bookings, waiting, passengers, roomAllocations] = await Promise.all([
    db
      .from('tours')
      .select('id, slug, total_places, departure_date')
      .order('departure_date', { ascending: false }),
    db
      .from('reservations')
      .select(
        'id, tour_id, reservation_code, lead_given_names, lead_surname, lead_email, lead_phone, total_people, total_cost_gbp, deposit_amount_gbp, amount_received_gbp, last_claimed_amount_gbp, last_claimed_at, quad_rooms, triple_rooms, double_rooms, status, created_at, expires_at, transfer_submitted_at, confirmed_at'
      )
      .order('created_at', { ascending: false }),
    db
      .from('waiting_list')
      .select('id, tour_id, name, email, phone, people_requested, created_at')
      .order('created_at', { ascending: true }),
    db
      .from('reservation_passengers')
      .select(
        'id, reservation_id, position, given_names, surname, person_type, room_type, room_allocation_id, date_of_birth, passport_expiry, passport_renewal_required, passport_photo_uploaded_at'
      )
      .order('position', { ascending: true }),
    db.from('room_allocations').select('id, label'),
  ])

  const passengersByReservation = new Map<string, BookingPassenger[]>()
  for (const row of (passengers.data ?? []) as Array<
    BookingPassenger & { reservation_id: string }
  >) {
    const list = passengersByReservation.get(row.reservation_id) ?? []
    list.push(row)
    passengersByReservation.set(row.reservation_id, list)
  }

  const allBookings = ((bookings.data ?? []) as Array<BookingRow & { tour_id: string }>).map(b => ({
    ...b,
    passengers: passengersByReservation.get(b.id) ?? [],
  }))
  const allWaiting = (waiting.data ?? []) as Array<WaitingRow & { tour_id: string }>
  const tourRows = (tours ?? []) as Array<{
    id: string
    slug: string
    total_places: number
    departure_date: string | null
  }>

  const placesTaken = await Promise.all(
    tourRows.map(t => db.rpc('get_places_taken', { p_tour_slug: t.slug }))
  )

  const tourLabelById = new Map(tourRows.map(t => [t.id, formatTourLabel(t.slug)]))
  const tourDepartureById = new Map(tourRows.map(t => [t.id, t.departure_date]))
  const roomLabelById = new Map(
    ((roomAllocations.data ?? []) as Array<{ id: string; label: string }>).map(r => [r.id, r.label])
  )
  const todayISO = new Date().toISOString().slice(0, 10)

  const customers: CustomerRow[] = allBookings.flatMap(b =>
    b.passengers.map(p => ({
      id: p.id,
      reservationId: b.id,
      reservationCode: b.reservation_code,
      tourId: b.tour_id,
      tourLabel: tourLabelById.get(b.tour_id) ?? '—',
      leadName: `${b.lead_given_names} ${b.lead_surname}`,
      leadEmail: b.lead_email,
      leadPhone: b.lead_phone,
      name: `${p.given_names} ${p.surname}`,
      personType: p.person_type,
      // Age band as of the tour's departure — the age that actually matters
      // for trip planning — separate from person_type, which the customer
      // self-selects at booking time for bed/pricing purposes.
      ageGroup: ageGroup(p.date_of_birth, tourDepartureById.get(b.tour_id) ?? todayISO),
      roomType: p.room_type,
      roomLabel: p.room_allocation_id ? roomLabelById.get(p.room_allocation_id) ?? null : null,
      dateOfBirth: p.date_of_birth,
      passportExpiry: p.passport_expiry,
      passportRenewalRequired: p.passport_renewal_required,
      passportPhotoUploadedAt: p.passport_photo_uploaded_at,
      status: b.status,
      createdAt: b.created_at,
    }))
  )

  const groups = tourRows.map((t, i) => ({
    tour: {
      id: t.id,
      slug: t.slug,
      label: formatTourLabel(t.slug),
      totalPlaces: t.total_places,
      departureDate: t.departure_date,
    },
    taken: Number(placesTaken[i].data ?? 0),
    bookings: allBookings.filter(b => b.tour_id === t.id),
    waiting: allWaiting.filter(w => w.tour_id === t.id),
  }))

  return {
    groups,
    customers,
    tours: tourRows.map(t => ({ id: t.id, label: formatTourLabel(t.slug) })),
  }
}

export default async function AdminDashboard() {
  const { groups, customers, tours } = await loadDashboard()

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Bookings overview, by tour</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">
          All customers
          <span className="ml-2 text-xs font-normal text-stone-400">{customers.length} total</span>
        </h2>
        <CustomerDirectory customers={customers} tours={tours} />
      </section>

      {groups.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-5">
          No tours found.
        </p>
      ) : (
        groups.map(group => <TourSection key={group.tour.id} group={group} />)
      )}

      <p className="text-xs text-stone-400 text-center mt-4">
        <Link href="/" className="hover:text-[#C4A348]">← Public site</Link>
      </p>
    </div>
  )
}

function TourSection({ group }: { group: TourGroup }) {
  const { tour, taken, bookings, waiting } = group
  const remaining = Math.max(0, tour.totalPlaces - taken)

  const counts = {
    pending: bookings.filter(b => b.status === 'pending_payment').length,
    awaiting: bookings.filter(b => b.status === 'transfer_submitted').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    expired: bookings.filter(b => b.status === 'expired').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    claims: bookings.filter(b => b.last_claimed_amount_gbp != null).length,
  }

  const activeBookings = bookings.filter(
    b => b.status === 'pending_payment' || b.status === 'transfer_submitted' || b.status === 'confirmed'
  )
  const depositsReceived = activeBookings.reduce(
    (s, b) => s + Math.min(b.amount_received_gbp, effectiveDepositGBP(b.total_cost_gbp, b.deposit_amount_gbp)),
    0
  )
  const depositsOutstanding = activeBookings.reduce(
    (s, b) => s + Math.max(0, effectiveDepositGBP(b.total_cost_gbp, b.deposit_amount_gbp) - b.amount_received_gbp),
    0
  )
  const totalReceived = activeBookings.reduce((s, b) => s + b.amount_received_gbp, 0)
  const totalOutstanding = activeBookings.reduce(
    (s, b) => s + Math.max(0, b.total_cost_gbp - b.amount_received_gbp),
    0
  )

  // Places taken (above) only counts against public capacity — promo-code
  // bookings are a separate allocation that don't compete with it, so the
  // true number of beds committed can be higher. Admins need to see that
  // real total for catering/rooming, not just the public-capacity figure.
  const totalPlacesIncludingDiscount = activeBookings.reduce((s, b) => s + b.total_people, 0)

  const passportStats = activeBookings.reduce(
    (acc, b) => {
      const pax = b.passengers ?? []
      acc.total += pax.length
      acc.uploaded += pax.filter(p => p.passport_photo_uploaded_at).length
      return acc
    },
    { total: 0, uploaded: 0 }
  )

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">{tour.label}</h2>
          {tour.departureDate && (
            <p className="text-xs text-stone-500 mt-0.5">Departs {formatDate(tour.departureDate)}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/finance/${tour.id}`}
            className="text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-full px-4 py-2 hover:border-stone-400 transition"
          >
            Financial breakdown →
          </Link>
          <Link
            href={`/admin/rooms/${tour.id}`}
            className="text-xs font-semibold bg-stone-900 text-white rounded-full px-4 py-2 hover:bg-stone-800 transition"
          >
            Room allocations →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <Stat label="Places taken" value={`${taken} / ${tour.totalPlaces}`} tone="stone" />
        <Stat label="Total places (incl. discount)" value={`${totalPlacesIncludingDiscount}`} tone="stone" />
        <Stat label="Remaining" value={`${remaining}`} tone="gold" />
        <Stat label="Claims to review" value={`${counts.claims}`} tone={counts.claims > 0 ? 'blue' : 'stone'} />
        <Stat label="Awaiting admin action" value={`${counts.awaiting}`} tone={counts.awaiting > 0 ? 'blue' : 'stone'} />
        <Stat
          label="Passports uploaded"
          value={`${passportStats.uploaded} / ${passportStats.total}`}
          tone={passportStats.uploaded < passportStats.total ? 'amber' : 'green'}
        />
        <Stat label="Waiting list" value={`${waiting.reduce((s, w) => s + w.people_requested, 0)}`} tone="stone" />
      </div>

      <PaymentStatsToggle
        depositsReceived={depositsReceived}
        depositsOutstanding={depositsOutstanding}
        totalReceived={totalReceived}
        totalOutstanding={totalOutstanding}
      />

      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-3">Bookings</h3>
        <BookingsList bookings={bookings} counts={counts} departureDate={tour.departureDate} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-3">Waiting list</h3>
        <WaitingListManager initial={waiting} />
      </div>
    </section>
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
