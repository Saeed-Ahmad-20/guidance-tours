import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { formatGBP } from '../../../../lib/booking'
import BookingActions from './booking-actions'
import LeadContactEditor from './lead-contact-editor'
import PassengerEditor from './passenger-editor'

export const dynamic = 'force-dynamic'

type ReservationFull = {
  id: string
  reservation_code: string
  lead_given_names: string
  lead_surname: string
  lead_email: string | null
  lead_phone: string | null
  total_people: number
  total_cost_gbp: number
  deposit_amount_gbp: number
  deposit_received_gbp: number | null
  quad_rooms: number
  triple_rooms: number
  double_rooms: number
  status: 'pending_payment' | 'transfer_submitted' | 'confirmed' | 'expired' | 'cancelled'
  created_at: string
  expires_at: string
  transfer_submitted_at: string | null
  confirmed_at: string | null
  confirmed_by: string | null
  cancelled_at: string | null
  passengers: Array<{
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
  }>
}

async function loadBooking(id: string): Promise<ReservationFull | null> {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('reservations')
    .select(
      'id, reservation_code, lead_given_names, lead_surname, lead_email, lead_phone, total_people, total_cost_gbp, deposit_amount_gbp, deposit_received_gbp, quad_rooms, triple_rooms, double_rooms, status, created_at, expires_at, transfer_submitted_at, confirmed_at, confirmed_by, cancelled_at'
    )
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  const { data: passengers } = await db
    .from('reservation_passengers')
    .select(
      'id, position, given_names, surname, person_type, room_type, room_index, date_of_birth, passport_expiry, passport_renewal_required'
    )
    .eq('reservation_id', id)
    .order('position', { ascending: true })
  return {
    ...(data as Omit<ReservationFull, 'passengers'>),
    passengers: (passengers ?? []) as ReservationFull['passengers'],
  }
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await loadBooking(id)
  if (!booking) notFound()

  const hasActions = booking.status !== 'expired' && booking.status !== 'cancelled'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs text-stone-500 hover:text-[#C4A348]">
          ← Back to dashboard
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 mt-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
              Reservation
            </p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-stone-900 tracking-wider">
              {booking.reservation_code}
            </p>
          </div>
          <StatusBanner status={booking.status} depositReceivedGBP={booking.deposit_received_gbp} depositAmountGBP={booking.deposit_amount_gbp} />
        </div>
      </div>

      <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Lead Passenger</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
          <DT>Name</DT>
          <DD>
            {booking.lead_given_names} {booking.lead_surname}
          </DD>
          <DT>Email</DT>
          <DD>
            {booking.lead_email ? (
              <a href={`mailto:${booking.lead_email}`} className="text-[#C4A348] hover:underline">
                {booking.lead_email}
              </a>
            ) : (
              '—'
            )}
          </DD>
          <DT>Phone</DT>
          <DD>
            {booking.lead_phone ? (
              <a href={`tel:${booking.lead_phone}`} className="text-[#C4A348] hover:underline">
                {booking.lead_phone}
              </a>
            ) : (
              '—'
            )}
          </DD>
        </dl>
        <LeadContactEditor
          reservationId={booking.id}
          email={booking.lead_email}
          phone={booking.lead_phone}
        />
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Booking</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
          <DT>Beds</DT>
          <DD>
            {bedSummary(booking) || '—'}
          </DD>
          <DT>People</DT>
          <DD>{booking.total_people}</DD>
          <DT>Package total</DT>
          <DD>{formatGBP(booking.total_cost_gbp)}</DD>
          <DT>Deposit</DT>
          <DD className="font-semibold text-[#8a6e1f]">
            {booking.deposit_received_gbp !== null && booking.deposit_received_gbp < booking.deposit_amount_gbp ? (
              <span>
                {formatGBP(booking.deposit_amount_gbp - booking.deposit_received_gbp)}{' '}
                <span className="font-normal text-stone-500 text-xs">remaining of {formatGBP(booking.deposit_amount_gbp)}</span>
              </span>
            ) : formatGBP(booking.deposit_amount_gbp)}
          </DD>
          <DT>Created</DT>
          <DD>{formatDateTime(booking.created_at)}</DD>
          <DT>Expires</DT>
          <DD>{formatDateTime(booking.expires_at)}</DD>
          {booking.transfer_submitted_at && (
            <>
              <DT>Customer marked sent</DT>
              <DD>{formatDateTime(booking.transfer_submitted_at)}</DD>
            </>
          )}
          {booking.confirmed_at && (
            <>
              <DT>Confirmed at</DT>
              <DD>
                {formatDateTime(booking.confirmed_at)}
                {booking.confirmed_by && (
                  <span className="text-stone-500 text-xs ml-2">by {booking.confirmed_by}</span>
                )}
              </DD>
            </>
          )}
          {booking.cancelled_at && (
            <>
              <DT>Cancelled at</DT>
              <DD>{formatDateTime(booking.cancelled_at)}</DD>
            </>
          )}
        </dl>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Passengers</h2>
        <PassengerEditor reservationId={booking.id} passengers={booking.passengers} />
      </section>

      {hasActions && (
        <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-3">Actions</h2>
          <BookingActions id={booking.id} status={booking.status} depositAmountGBP={booking.deposit_amount_gbp} depositReceivedGBP={booking.deposit_received_gbp ?? undefined} />
        </section>
      )}
    </div>
  )
}

function StatusBanner({
  status,
  depositReceivedGBP,
  depositAmountGBP,
}: {
  status: ReservationFull['status']
  depositReceivedGBP?: number | null
  depositAmountGBP?: number
}) {
  const isPartialTransfer =
    status === 'pending_payment' &&
    depositReceivedGBP !== null &&
    depositReceivedGBP !== undefined &&
    depositAmountGBP !== undefined &&
    depositReceivedGBP < depositAmountGBP

  const map: Record<ReservationFull['status'], { label: string; cls: string }> = {
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
    <span className={`text-xs uppercase tracking-wider font-bold rounded-full px-3 py-1 ${cls}`}>
      {label}
    </span>
  )
}

function DT({ children }: { children: React.ReactNode }) {
  return <dt className="text-xs text-stone-500 uppercase tracking-wider">{children}</dt>
}
function DD({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <dd className={`text-stone-900 sm:text-right ${className}`}>{children}</dd>
}

function bedSummary(b: Pick<ReservationFull, 'quad_rooms' | 'triple_rooms' | 'double_rooms'>): string {
  const parts: string[] = []
  if (b.quad_rooms)
    parts.push(`${b.quad_rooms} quad-room ${b.quad_rooms === 1 ? 'bed' : 'beds'}`)
  if (b.triple_rooms)
    parts.push(`${b.triple_rooms} triple-room ${b.triple_rooms === 1 ? 'bed' : 'beds'}`)
  if (b.double_rooms)
    parts.push(`${b.double_rooms} double-room ${b.double_rooms === 1 ? 'bed' : 'beds'}`)
  return parts.join(', ')
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
