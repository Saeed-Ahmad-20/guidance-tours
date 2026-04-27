import { cookies } from 'next/headers'
import { supabaseAdmin } from '../lib/supabase-admin'
import { PORTAL_COOKIE, verifyPortalSession } from '../lib/portal-session'
import { BOOKING_DISPLAY_TTL_HOURS, BOOKING_TTL_HOURS } from '../lib/booking'
import LoginForm from './login-form'
import PortalStatus, { type PortalReservation } from './status'

export const dynamic = 'force-dynamic'

const BUFFER_MS =
  Math.max(0, BOOKING_TTL_HOURS - BOOKING_DISPLAY_TTL_HOURS) * 60 * 60 * 1000

async function loadReservation(rid: string): Promise<PortalReservation | null> {
  const db = supabaseAdmin()
  await db.rpc('expire_old_reservations')

  const { data, error } = await db
    .from('reservations')
    .select(
      'id, reservation_code, lead_given_names, lead_surname, lead_email, lead_phone, total_people, total_cost_gbp, deposit_amount_gbp, status, created_at, expires_at, transfer_submitted_at, confirmed_at, admin_note, deposit_received_gbp'
    )
    .eq('id', rid)
    .maybeSingle()
  if (error || !data) return null

  const { data: passengers } = await db
    .from('reservation_passengers')
    .select('given_names, surname, person_type, room_type, room_index, passport_expiry, passport_renewal_required')
    .eq('reservation_id', rid)
    .order('position', { ascending: true })

  const row = data as Omit<PortalReservation, 'passengers' | 'display_expires_at'>
  const displayExpiresAt = new Date(
    new Date(row.expires_at).getTime() - BUFFER_MS
  ).toISOString()

  return {
    ...row,
    display_expires_at: displayExpiresAt,
    passengers: (passengers ?? []) as PortalReservation['passengers'],
  }
}

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const store = await cookies()
  const cookie = store.get(PORTAL_COOKIE)?.value
  const rid = verifyPortalSession(cookie)

  if (!rid) {
    return <LoginForm prefilledCode={code ?? ''} />
  }

  const reservation = await loadReservation(rid)
  if (!reservation) {
    return <LoginForm prefilledCode={code ?? ''} error="Your session is no longer valid. Please log in again." />
  }

  return <PortalStatus reservation={reservation} />
}
