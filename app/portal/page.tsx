import { supabaseAdmin } from '../lib/supabase-admin'
import { getPortalSession, publicSiteHref } from '../lib/portal-session'
import { BOOKING_DISPLAY_TTL_HOURS, BOOKING_TTL_HOURS } from '../lib/booking'
import { getPassportPhotoSignedUrl } from '../lib/passport-storage'
import LoginForm from './login-form'
import PortalStatus, { type PortalReservation, type PortalRoom } from './status'

export const dynamic = 'force-dynamic'

const BUFFER_MS =
  Math.max(0, BOOKING_TTL_HOURS - BOOKING_DISPLAY_TTL_HOURS) * 60 * 60 * 1000

async function loadReservation(rid: string): Promise<PortalReservation | null> {
  const db = supabaseAdmin()
  await db.rpc('expire_old_reservations')

  const { data, error } = await db
    .from('reservations')
    .select(
      'id, reservation_code, lead_given_names, lead_surname, lead_email, lead_phone, total_people, total_cost_gbp, deposit_amount_gbp, status, created_at, expires_at, transfer_submitted_at, confirmed_at, admin_note, amount_received_gbp, last_claimed_amount_gbp, last_claimed_at'
    )
    .eq('id', rid)
    .maybeSingle()
  if (error || !data) return null

  const { data: passengers } = await db
    .from('reservation_passengers')
    .select('id, given_names, surname, person_type, room_type, room_index, passport_expiry, passport_renewal_required, passport_photo_uploaded_at, passport_photo_path')
    .eq('reservation_id', rid)
    .order('position', { ascending: true })

  const row = data as Omit<PortalReservation, 'passengers' | 'display_expires_at'>
  const displayExpiresAt = new Date(
    new Date(row.expires_at).getTime() - BUFFER_MS
  ).toISOString()

  const rawPassengers = (passengers ?? []) as Array<{
    id: string
    given_names: string
    surname: string
    person_type: 'adult' | 'infant'
    room_type: 'quad' | 'triple' | 'double'
    room_index: number
    passport_expiry: string
    passport_renewal_required: boolean
    passport_photo_uploaded_at: string | null
    passport_photo_path: string | null
  }>

  const withPhotoUrls = await Promise.all(
    rawPassengers.map(async p => ({
      ...p,
      passport_photo_url: p.passport_photo_path
        ? await getPassportPhotoSignedUrl(p.passport_photo_path)
        : null,
      passport_photo_is_pdf: p.passport_photo_path?.toLowerCase().endsWith('.pdf') ?? false,
    }))
  )

  return {
    ...row,
    display_expires_at: displayExpiresAt,
    passengers: withPhotoUrls as PortalReservation['passengers'],
  }
}

// Roommates can come from other bookings, so only their names leave the server.
async function loadRooms(
  visible: PortalReservation['passengers'],
  youId: string
): Promise<PortalRoom[]> {
  const db = supabaseAdmin()
  const { data: own } = await db
    .from('reservation_passengers')
    .select('id, room_allocation_id')
    .in('id', visible.map(p => p.id))
  const roomIdByPassenger = new Map(
    ((own ?? []) as Array<{ id: string; room_allocation_id: string | null }>).map(p => [p.id, p.room_allocation_id])
  )
  const roomIds = [...new Set(visible.map(p => roomIdByPassenger.get(p.id)).filter((id): id is string => Boolean(id)))]
  if (roomIds.length === 0) return []

  const { data: members } = await db
    .from('reservation_passengers')
    .select('id, given_names, surname, room_allocation_id')
    .in('room_allocation_id', roomIds)
  const rows = (members ?? []) as Array<{ id: string; given_names: string; surname: string; room_allocation_id: string }>

  return roomIds.map(roomId => ({
    id: roomId,
    occupants: visible.filter(p => roomIdByPassenger.get(p.id) === roomId).map(p => p.id),
    members: rows
      .filter(m => m.room_allocation_id === roomId)
      .map(m => ({
        name: `${m.given_names} ${m.surname}`.replace(/\s+/g, ' ').trim(),
        isYou: m.id === youId,
      }))
      .sort((a, b) => Number(b.isYou) - Number(a.isYou) || a.name.localeCompare(b.name)),
  }))
}

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const session = await getPortalSession()
  const bookHref = await publicSiteHref('/umrah-2026/book')

  if (!session) {
    return <LoginForm prefilledCode={code ?? ''} bookHref={bookHref} />
  }

  const reservation = await loadReservation(session.rid)
  const me = reservation?.passengers.find(p => p.id === session.pid)
  if (!reservation || !me) {
    return <LoginForm prefilledCode={code ?? ''} bookHref={bookHref} error="Your session is no longer valid. Please log in again." />
  }

  // Everything passed to PortalStatus is serialised to the browser, so a
  // non-lead passenger must only receive what their own view needs.
  const visible: PortalReservation = session.lead
    ? reservation
    : {
        ...reservation,
        passengers: [me],
        lead_email: null,
        lead_phone: null,
        admin_note: null,
        total_people: 0,
        total_cost_gbp: 0,
        deposit_amount_gbp: 0,
        amount_received_gbp: 0,
        last_claimed_amount_gbp: null,
        last_claimed_at: null,
        created_at: '',
        expires_at: '',
        display_expires_at: '',
        transfer_submitted_at: null,
        confirmed_at: null,
      }

  const rooms = await loadRooms(visible.passengers, me.id)

  return (
    <PortalStatus
      reservation={visible}
      rooms={rooms}
      viewer={{ isLead: session.lead, name: `${me.given_names} ${me.surname}`.trim() }}
    />
  )
}
