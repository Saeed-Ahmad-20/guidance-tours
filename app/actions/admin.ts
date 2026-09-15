'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createHash, timingSafeEqual } from 'node:crypto'
import { supabaseAdmin } from '../lib/supabase-admin'
import {
  sendAdminMessage,
  sendBookingCancelled,
  sendDepositConfirmed,
  sendStatusReverted,
} from '../lib/emails'
import {
  ADMIN_COOKIE,
  getAdminUser,
  signAdminSession,
} from '../lib/admin-session'
import {
  BOOKING_TTL_HOURS,
  ROOM_CAPACITY,
  ROOM_PRICE_GBP,
  RoomType,
  cap,
  isValidDateOfBirth,
  isValidEmail,
  passportNeedsRenewal,
} from '../lib/booking'
import { checkRateLimit, clientIp, resetRateLimit } from '../lib/rate-limit'
import { assertSameOrigin } from '../lib/csrf'
import { getAdminCredentials } from '../lib/env'

const isProd = process.env.NODE_ENV === 'production'

// Compare via SHA-256 digests so the buffers are always 32 bytes — this
// removes the length-leak from a raw timingSafeEqual call (different-length
// inputs returned in O(1), exposing whether the username/password length
// matched before any byte comparison ran).
function safeEqualStr(a: string, b: string): boolean {
  const ah = createHash('sha256').update(a).digest()
  const bh = createHash('sha256').update(b).digest()
  return timingSafeEqual(ah, bh)
}

export type AdminLoginResult = { ok: true } | { ok: false; error: string }

export async function adminLogin(formData: FormData): Promise<AdminLoginResult> {
  await assertSameOrigin()

  const username = ((formData.get('username') as string | null) ?? '').trim()
  const password = (formData.get('password') as string | null) ?? ''

  const ip = await clientIp()
  if (!(await checkRateLimit('adminLogin', ip, 8, 15 * 60 * 1000))) {
    return { ok: false, error: 'Too many attempts. Please try again later.' }
  }

  let expectedUser: string
  let expectedPass: string
  try {
    const creds = getAdminCredentials()
    expectedUser = creds.username
    expectedPass = creds.password
  } catch {
    return { ok: false, error: 'Admin credentials are not configured.' }
  }

  // Always run both compares so attackers cannot tell from response timing
  // whether the username or the password was the failing field.
  const userOk = safeEqualStr(username, expectedUser)
  const passOk = safeEqualStr(password, expectedPass)
  if (!userOk || !passOk) {
    return { ok: false, error: 'Invalid username or password.' }
  }

  await resetRateLimit('adminLogin', ip)
  const { value, maxAge } = await signAdminSession(username)
  const store = await cookies()
  store.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge,
  })
  return { ok: true }
}

export async function adminLogout() {
  await assertSameOrigin()
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  revalidatePath('/admin')
}

async function requireAdmin(): Promise<string> {
  const user = await getAdminUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export type AdminActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function confirmDeposit(
  reservationId: string,
  amountReceived: number
): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()
  const { data: current, error: readErr } = await db
    .from('reservations')
    .select('status, reservation_code, lead_given_names, lead_email, total_people, total_cost_gbp, deposit_amount_gbp, amount_received_gbp')
    .eq('id', reservationId)
    .maybeSingle()
  if (readErr || !current) return { ok: false, error: 'Booking not found.' }

  const row = current as {
    status: string
    reservation_code: string
    lead_given_names: string
    lead_email: string | null
    total_people: number
    total_cost_gbp: number
    deposit_amount_gbp: number
    amount_received_gbp: number
  }
  if (row.status === 'expired' || row.status === 'cancelled')
    return { ok: false, error: `Cannot confirm a ${row.status} booking.` }

  const newTotal = Math.min(row.total_cost_gbp, Math.max(0, amountReceived))
  if (newTotal <= row.amount_received_gbp) {
    return { ok: false, error: 'Amount must be greater than the amount already received.' }
  }

  const wasConfirmed = row.status === 'confirmed'
  const isPartial = !wasConfirmed && newTotal < row.deposit_amount_gbp

  const partialExpiry = new Date(
    Date.now() + BOOKING_TTL_HOURS * 60 * 60 * 1000
  ).toISOString()

  const { error } = await db
    .from('reservations')
    .update(
      wasConfirmed
        ? {
            amount_received_gbp: newTotal,
            last_claimed_amount_gbp: null,
            last_claimed_at: null,
          }
        : isPartial
        ? {
            status: 'pending_payment',
            amount_received_gbp: newTotal,
            admin_note: null,
            transfer_submitted_at: null,
            expires_at: partialExpiry,
            last_claimed_amount_gbp: null,
            last_claimed_at: null,
          }
        : {
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            confirmed_by: admin,
            amount_received_gbp: newTotal,
            admin_note: null,
            last_claimed_amount_gbp: null,
            last_claimed_at: null,
          }
    )
    .eq('id', reservationId)
    .in('status', ['pending_payment', 'transfer_submitted', 'confirmed'])

  if (error) {
    console.error('confirmDeposit error:', error.message)
    return { ok: false, error: 'Could not update booking.' }
  }

  await sendDepositConfirmed({
    to: row.lead_email,
    leadGivenNames: row.lead_given_names,
    reservationCode: row.reservation_code,
    totalPeople: row.total_people,
    depositAmountGBP: row.deposit_amount_gbp,
    amountReceivedGBP: newTotal,
    isBalanceTopUp: wasConfirmed,
    totalCostGBP: row.total_cost_gbp,
  })

  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${reservationId}`)
  return { ok: true }
}

export async function revertToPending(
  reservationId: string,
  adminNote?: string
): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()
  const { data: current, error: readErr } = await db
    .from('reservations')
    .select('status, reservation_code, lead_given_names, lead_email, deposit_amount_gbp')
    .eq('id', reservationId)
    .maybeSingle()
  if (readErr || !current) return { ok: false, error: 'Booking not found.' }

  const row = current as {
    status: string
    reservation_code: string
    lead_given_names: string
    lead_email: string | null
    deposit_amount_gbp: number
  }
  if (!['transfer_submitted', 'confirmed'].includes(row.status))
    return { ok: false, error: `Cannot revert a ${row.status} booking to pending.` }

  const newExpiry = new Date(Date.now() + BOOKING_TTL_HOURS * 60 * 60 * 1000).toISOString()

  const { error } = await db
    .from('reservations')
    .update({
      status: 'pending_payment',
      transfer_submitted_at: null,
      confirmed_at: null,
      confirmed_by: null,
      last_claimed_amount_gbp: null,
      last_claimed_at: null,
      expires_at: newExpiry,
      admin_note: adminNote?.trim() || null,
    })
    .eq('id', reservationId)
    .in('status', ['transfer_submitted', 'confirmed'])

  if (error) {
    console.error('revertToPending error:', error.message)
    return { ok: false, error: 'Could not update booking.' }
  }

  const portalUrl = `${process.env.SITE_URL || 'https://www.guidancetours.co.uk'}/portal?code=${encodeURIComponent(row.reservation_code)}`
  await sendStatusReverted({
    to: row.lead_email,
    leadGivenNames: row.lead_given_names,
    reservationCode: row.reservation_code,
    targetStatus: 'pending_payment',
    adminNote: adminNote?.trim() || undefined,
    portalUrl,
  })

  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${reservationId}`)
  return { ok: true }
}

export async function adminUpdateLeadContact(
  reservationId: string,
  email: string,
  phone: string
): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const trimmedEmail = email.trim()
  if (trimmedEmail && !isValidEmail(trimmedEmail)) {
    return { ok: false, error: 'Email is not a valid address.' }
  }

  const db = supabaseAdmin()
  const { error } = await db
    .from('reservations')
    .update({
      lead_email: trimmedEmail || null,
      lead_phone: phone.trim() || null,
    })
    .eq('id', reservationId)

  if (error) {
    console.error('adminUpdateLeadContact error:', error.message)
    return { ok: false, error: 'Could not update contact details.' }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${reservationId}`)
  return { ok: true }
}

export type PassengerUpdateInput = {
  given_names: string
  surname: string
  person_type: 'adult' | 'infant'
  date_of_birth: string
  passport_expiry: string
  room_type: 'quad' | 'triple' | 'double'
}

export async function adminUpdatePassenger(
  passengerId: string,
  reservationId: string,
  data: PassengerUpdateInput
): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()

  const { data: currentP, error: fetchPErr } = await db
    .from('reservation_passengers')
    .select('room_type')
    .eq('id', passengerId)
    .eq('reservation_id', reservationId)
    .maybeSingle()

  if (fetchPErr || !currentP) return { ok: false, error: 'Passenger not found.' }

  const givenNames = data.given_names.trim()
  const surname = data.surname.trim()
  if (!givenNames || !surname) {
    return { ok: false, error: 'Name fields are required.' }
  }
  if (givenNames.length > 100 || surname.length > 100) {
    return { ok: false, error: 'Name fields must be 100 characters or fewer.' }
  }
  if (data.person_type !== 'adult' && data.person_type !== 'infant') {
    return { ok: false, error: 'Invalid person type.' }
  }
  if (data.room_type !== 'quad' && data.room_type !== 'triple' && data.room_type !== 'double') {
    return { ok: false, error: 'Invalid room type.' }
  }
  const today = new Date().toISOString().slice(0, 10)
  if (!isValidDateOfBirth(data.date_of_birth, today)) {
    return { ok: false, error: 'Enter a realistic date of birth (under 120 years old).' }
  }
  if (!data.passport_expiry || data.passport_expiry < today) {
    return { ok: false, error: 'Passport expiry must be today or later.' }
  }

  const currentRoomType = (currentP as { room_type: string }).room_type
  const passport_renewal_required = passportNeedsRenewal(data.passport_expiry)

  let room_index: number | undefined
  if (currentRoomType !== data.room_type) {
    const { data: siblings } = await db
      .from('reservation_passengers')
      .select('id')
      .eq('reservation_id', reservationId)
      .eq('room_type', data.room_type)
      .neq('id', passengerId)
    room_index = siblings?.length ?? 0
  }

  const updateData: Record<string, unknown> = {
    given_names: givenNames,
    surname,
    person_type: data.person_type,
    date_of_birth: data.date_of_birth,
    passport_expiry: data.passport_expiry,
    room_type: data.room_type,
    passport_renewal_required,
  }
  if (room_index !== undefined) updateData.room_index = room_index

  const { error: updateErr } = await db
    .from('reservation_passengers')
    .update(updateData)
    .eq('id', passengerId)
    .eq('reservation_id', reservationId)

  if (updateErr) {
    console.error('adminUpdatePassenger error:', updateErr.message)
    return { ok: false, error: 'Could not update passenger.' }
  }

  const { data: allPassengers, error: fetchErr } = await db
    .from('reservation_passengers')
    .select('room_type')
    .eq('reservation_id', reservationId)

  if (fetchErr || !allPassengers) {
    return { ok: false, error: 'Passenger updated but could not recalculate totals.' }
  }

  const rows = allPassengers as Array<{ room_type: string }>
  const quad_rooms = rows.filter(p => p.room_type === 'quad').length
  const triple_rooms = rows.filter(p => p.room_type === 'triple').length
  const double_rooms = rows.filter(p => p.room_type === 'double').length
  const total_cost_gbp =
    quad_rooms * ROOM_PRICE_GBP.quad +
    triple_rooms * ROOM_PRICE_GBP.triple +
    double_rooms * ROOM_PRICE_GBP.double

  const { error: reservErr } = await db
    .from('reservations')
    .update({ quad_rooms, triple_rooms, double_rooms, total_cost_gbp })
    .eq('id', reservationId)

  if (reservErr) {
    console.error('adminUpdatePassenger reservation update error:', reservErr.message)
    return { ok: false, error: 'Passenger updated but could not recalculate totals.' }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${reservationId}`)
  return { ok: true }
}

export async function cancelBooking(
  reservationId: string,
  adminNote?: string
): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const trimmedNote = adminNote?.trim()
  if (trimmedNote && trimmedNote.length > 1000) {
    return { ok: false, error: 'Cancellation note must be 1000 characters or fewer.' }
  }

  const db = supabaseAdmin()
  const { data: current, error: fetchErr } = await db
    .from('reservations')
    .select('reservation_code, lead_given_names, lead_email, status')
    .eq('id', reservationId)
    .maybeSingle()

  if (fetchErr) {
    console.error('cancelBooking lookup error:', fetchErr.message)
  } else if (!current) {
    console.warn('cancelBooking: reservation not found, id=', reservationId)
  }

  const { error } = await db
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      admin_note: trimmedNote || null,
    })
    .eq('id', reservationId)
    .in('status', ['pending_payment', 'transfer_submitted', 'confirmed'])

  if (error) {
    console.error('cancelBooking error:', error.message)
    return { ok: false, error: 'Could not cancel booking.' }
  }

  if (current) {
    const row = current as {
      reservation_code: string
      lead_given_names: string
      lead_email: string | null
      status: string
    }
    if (['pending_payment', 'transfer_submitted', 'confirmed'].includes(row.status)) {
      await sendBookingCancelled({
        to: row.lead_email,
        leadGivenNames: row.lead_given_names,
        reservationCode: row.reservation_code,
        adminNote: trimmedNote || undefined,
      })
    }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${reservationId}`)
  return { ok: true }
}

export async function messageCustomer(
  reservationId: string,
  message: string
): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const trimmed = message.trim()
  if (!trimmed) return { ok: false, error: 'Message cannot be empty.' }
  if (trimmed.length > 2000) return { ok: false, error: 'Message must be 2000 characters or fewer.' }

  const db = supabaseAdmin()
  const { data: current, error: readErr } = await db
    .from('reservations')
    .select('status, reservation_code, lead_given_names, lead_email')
    .eq('id', reservationId)
    .maybeSingle()
  if (readErr || !current) return { ok: false, error: 'Booking not found.' }

  const row = current as {
    status: string
    reservation_code: string
    lead_given_names: string
    lead_email: string | null
  }
  if (row.status === 'expired' || row.status === 'cancelled') {
    return { ok: false, error: `Cannot message customer on a ${row.status} booking.` }
  }

  const { error } = await db
    .from('reservations')
    .update({ admin_note: trimmed })
    .eq('id', reservationId)

  if (error) {
    console.error('messageCustomer error:', error.message)
    return { ok: false, error: 'Could not save message.' }
  }

  await sendAdminMessage({
    to: row.lead_email,
    leadGivenNames: row.lead_given_names,
    reservationCode: row.reservation_code,
    message: trimmed,
  })

  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${reservationId}`)
  return { ok: true }
}

export async function removeWaitingListEntry(id: string): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()
  const { error } = await db.from('waiting_list').delete().eq('id', id)
  if (error) {
    console.error('removeWaitingListEntry error:', error.message)
    return { ok: false, error: 'Could not remove entry.' }
  }

  revalidatePath('/admin')
  return { ok: true }
}

// --- Room allocations -------------------------------------------------
// A physical room a passenger's bed is assigned to. Separate from
// room_type/room_index on reservation_passengers, which only describe the
// bed the customer booked — not which real room it ends up in, since beds
// of the same type from different bookings can share a room.

function isRoomType(v: unknown): v is RoomType {
  return v === 'quad' || v === 'triple' || v === 'double'
}

export type RoomActionResult = { ok: true; id: string } | { ok: false; error: string }

export async function createRoomAllocation(
  tourId: string,
  roomType: RoomType,
  label: string
): Promise<RoomActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }
  if (!isRoomType(roomType)) return { ok: false, error: 'Invalid room type.' }

  const trimmed = label.trim()
  if (!trimmed) return { ok: false, error: 'Room name is required.' }
  if (trimmed.length > 60) return { ok: false, error: 'Room name must be 60 characters or fewer.' }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('room_allocations')
    .insert({ tour_id: tourId, room_type: roomType, label: trimmed })
    .select('id')
    .single()

  if (error || !data) {
    console.error('createRoomAllocation error:', error?.message)
    return { ok: false, error: 'Could not create room.' }
  }

  revalidatePath('/admin/rooms')
  return { ok: true, id: (data as { id: string }).id }
}

export async function renameRoomAllocation(
  roomAllocationId: string,
  label: string
): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const trimmed = label.trim()
  if (!trimmed) return { ok: false, error: 'Room name is required.' }
  if (trimmed.length > 60) return { ok: false, error: 'Room name must be 60 characters or fewer.' }

  const db = supabaseAdmin()
  const { error } = await db
    .from('room_allocations')
    .update({ label: trimmed })
    .eq('id', roomAllocationId)

  if (error) {
    console.error('renameRoomAllocation error:', error.message)
    return { ok: false, error: 'Could not rename room.' }
  }

  revalidatePath('/admin/rooms')
  return { ok: true }
}

export async function deleteRoomAllocation(roomAllocationId: string): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()
  // Members are unassigned automatically (room_allocation_id references this
  // table with ON DELETE SET NULL) rather than blocked from deletion here.
  const { error } = await db.from('room_allocations').delete().eq('id', roomAllocationId)
  if (error) {
    console.error('deleteRoomAllocation error:', error.message)
    return { ok: false, error: 'Could not delete room.' }
  }

  revalidatePath('/admin/rooms')
  return { ok: true }
}

export async function assignPassengerToRoom(
  passengerId: string,
  roomAllocationId: string | null
): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()

  const { data: passenger, error: pErr } = await db
    .from('reservation_passengers')
    .select('id, room_type')
    .eq('id', passengerId)
    .maybeSingle()
  if (pErr || !passenger) return { ok: false, error: 'Passenger not found.' }
  const passengerRoomType = (passenger as { room_type: RoomType }).room_type

  if (roomAllocationId) {
    const { data: room, error: rErr } = await db
      .from('room_allocations')
      .select('id, room_type')
      .eq('id', roomAllocationId)
      .maybeSingle()
    if (rErr || !room) return { ok: false, error: 'Room not found.' }
    if ((room as { room_type: string }).room_type !== passengerRoomType) {
      return { ok: false, error: 'That room is a different bed type.' }
    }

    const { count, error: cErr } = await db
      .from('reservation_passengers')
      .select('id', { count: 'exact', head: true })
      .eq('room_allocation_id', roomAllocationId)
      .neq('id', passengerId)
    if (cErr) return { ok: false, error: 'Could not check room capacity.' }
    if ((count ?? 0) >= ROOM_CAPACITY[passengerRoomType]) {
      return { ok: false, error: 'That room is already full.' }
    }
  }

  const { error } = await db
    .from('reservation_passengers')
    .update({ room_allocation_id: roomAllocationId })
    .eq('id', passengerId)

  if (error) {
    console.error('assignPassengerToRoom error:', error.message)
    return { ok: false, error: 'Could not assign passenger.' }
  }

  revalidatePath('/admin/rooms')
  return { ok: true }
}

const ROOM_TYPES: RoomType[] = ['quad', 'triple', 'double']

// Redistributes every passenger into rooms across every bed type for the
// tour in one go — clearing any existing assignments first, so this can be
// re-run as many times as needed for a fresh suggestion (e.g. after manual
// tweaks the admin wants to discard) rather than only ever filling gaps.
// It fills existing rooms' spare capacity before creating new ones, and
// keeps each booking's own passengers together in one room where they fit —
// splitting only when a single booking has more beds of one type than one
// room holds. A passenger can only ever join a room of the bed type they
// booked, so this still runs the bin-packing separately per type under the
// hood — it's just no longer something the admin has to trigger three times.
// It's a starting point the admin can then hand-rearrange, not a final answer.
export async function autoAllocateRooms(tourId: string): Promise<AdminActionResult> {
  await assertSameOrigin()
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()

  for (const roomType of ROOM_TYPES) {
    const result = await autoAllocateRoomType(db, tourId, roomType)
    if (!result.ok) return result
  }

  revalidatePath('/admin/rooms')
  return { ok: true }
}

async function autoAllocateRoomType(
  db: ReturnType<typeof supabaseAdmin>,
  tourId: string,
  roomType: RoomType
): Promise<AdminActionResult> {
  const capacity = ROOM_CAPACITY[roomType]

  const { data: reservations, error: resErr } = await db
    .from('reservations')
    .select('id')
    .eq('tour_id', tourId)
    .in('status', ['pending_payment', 'transfer_submitted', 'confirmed'])
    .order('created_at', { ascending: true })
  if (resErr) return { ok: false, error: 'Could not load bookings.' }
  const reservationIds = ((reservations ?? []) as Array<{ id: string }>).map(r => r.id)
  if (reservationIds.length === 0) return { ok: true }

  const { data: existingRooms, error: roomsErr } = await db
    .from('room_allocations')
    .select('id')
    .eq('tour_id', tourId)
    .eq('room_type', roomType)
  if (roomsErr) return { ok: false, error: 'Could not load rooms.' }

  const { data: passengers, error: paxErr } = await db
    .from('reservation_passengers')
    .select('id, reservation_id')
    .in('reservation_id', reservationIds)
    .eq('room_type', roomType)
    .order('position', { ascending: true })
  if (paxErr) return { ok: false, error: 'Could not load passengers.' }

  const paxRows = (passengers ?? []) as Array<{ id: string; reservation_id: string }>
  if (paxRows.length === 0) return { ok: true }

  // Clear existing assignments so this redistributes everyone from scratch
  // every time it runs, rather than only ever filling gaps left by people
  // who were never assigned.
  const { error: resetErr } = await db
    .from('reservation_passengers')
    .update({ room_allocation_id: null })
    .in(
      'id',
      paxRows.map(p => p.id)
    )
  if (resetErr) return { ok: false, error: 'Could not reset existing assignments.' }

  const bins: Array<{ id: string; remaining: number }> = ((existingRooms ?? []) as Array<{ id: string }>).map(
    r => ({ id: r.id, remaining: capacity })
  )

  // Group by reservation, but walk reservations in booking order (the same
  // order reservationIds was fetched in) rather than whatever order the
  // passenger rows happened to come back in — position is only meaningful
  // within a single booking, so ordering the passenger query by it does not
  // keep one booking's people contiguous across the whole result set.
  const paxByReservation = new Map<string, string[]>()
  for (const p of paxRows) {
    const list = paxByReservation.get(p.reservation_id) ?? []
    list.push(p.id)
    paxByReservation.set(p.reservation_id, list)
  }

  let roomCounter = (existingRooms ?? []).length + 1
  const plannedAssignments: Array<{ passengerId: string; roomId: string }> = []

  for (const reservationId of reservationIds) {
    const passengerIds = paxByReservation.get(reservationId)
    if (!passengerIds || passengerIds.length === 0) continue

    let remaining = passengerIds
    while (remaining.length > 0) {
      // Prefer a room that can take everyone still left in this booking in
      // one go — the tightest such fit — over the first room with any free
      // bed, so a booking only ever gets split across rooms when it
      // genuinely has more beds of this type than a single room holds.
      const wholeFit = bins
        .filter(b => b.remaining >= remaining.length)
        .sort((a, b) => a.remaining - b.remaining)[0]
      let bin = wholeFit
      if (!bin) {
        const label = `${cap(roomType)} Room ${roomCounter++}`
        const { data: created, error: createErr } = await db
          .from('room_allocations')
          .insert({ tour_id: tourId, room_type: roomType, label })
          .select('id')
          .single()
        if (createErr || !created) return { ok: false, error: 'Could not create room during auto-allocation.' }
        bin = { id: (created as { id: string }).id, remaining: capacity }
        bins.push(bin)
      }
      const take = remaining.slice(0, bin.remaining)
      for (const passengerId of take) plannedAssignments.push({ passengerId, roomId: bin.id })
      bin.remaining -= take.length
      remaining = remaining.slice(take.length)
    }
  }

  const byRoom = new Map<string, string[]>()
  for (const a of plannedAssignments) {
    const list = byRoom.get(a.roomId) ?? []
    list.push(a.passengerId)
    byRoom.set(a.roomId, list)
  }

  for (const [roomId, passengerIds] of byRoom) {
    const { error } = await db
      .from('reservation_passengers')
      .update({ room_allocation_id: roomId })
      .in('id', passengerIds)
    if (error) {
      console.error('autoAllocateRooms assign error:', error.message)
      return { ok: false, error: 'Could not assign some passengers.' }
    }
  }

  return { ok: true }
}
