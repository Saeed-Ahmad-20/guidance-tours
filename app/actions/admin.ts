'use server'

import { cookies, headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'
import { supabaseAdmin } from '../lib/supabase-admin'
import { sendDepositConfirmed, sendStatusReverted } from '../lib/emails'
import {
  ADMIN_COOKIE,
  getAdminUser,
  signAdminSession,
} from '../lib/admin-session'
import { ROOM_PRICE_GBP, passportNeedsRenewal } from '../lib/booking'

const isProd = process.env.NODE_ENV === 'production'

const loginAttempts = new Map<string, { count: number; firstAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8

async function clientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0].trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}

function recordAttempt(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAt: now })
    return true
  }
  entry.count++
  return entry.count <= MAX_ATTEMPTS
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip)
}

function safeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export type AdminLoginResult = { ok: true } | { ok: false; error: string }

export async function adminLogin(formData: FormData): Promise<AdminLoginResult> {
  const username = ((formData.get('username') as string | null) ?? '').trim()
  const password = (formData.get('password') as string | null) ?? ''

  const ip = await clientIp()
  if (!recordAttempt(ip)) {
    return { ok: false, error: 'Too many attempts. Please try again later.' }
  }

  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD
  if (!expectedUser || !expectedPass) {
    return { ok: false, error: 'Admin credentials are not configured.' }
  }

  const userOk = safeEqualStr(username, expectedUser)
  const passOk = safeEqualStr(password, expectedPass)
  if (!userOk || !passOk) {
    return { ok: false, error: 'Invalid username or password.' }
  }

  clearAttempts(ip)
  const { value, maxAge } = signAdminSession(username)
  const store = await cookies()
  store.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
  return { ok: true }
}

export async function adminLogout() {
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
  amountReceived?: number
): Promise<AdminActionResult> {
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()
  const { data: current, error: readErr } = await db
    .from('reservations')
    .select('status, reservation_code, lead_given_names, lead_email, total_people, deposit_amount_gbp')
    .eq('id', reservationId)
    .maybeSingle()
  if (readErr || !current) return { ok: false, error: 'Booking not found.' }

  const row = current as {
    status: string
    reservation_code: string
    lead_given_names: string
    lead_email: string | null
    total_people: number
    deposit_amount_gbp: number
  }
  if (row.status === 'confirmed') return { ok: false, error: 'Already confirmed.' }
  if (row.status === 'expired' || row.status === 'cancelled')
    return { ok: false, error: `Cannot confirm a ${row.status} booking.` }

  const isPartial = amountReceived !== undefined && amountReceived < row.deposit_amount_gbp

  const { error } = await db
    .from('reservations')
    .update(
      isPartial
        ? { status: 'pending_payment', deposit_received_gbp: amountReceived, admin_note: null }
        : { status: 'confirmed', confirmed_at: new Date().toISOString(), confirmed_by: admin, deposit_received_gbp: null, admin_note: null }
    )
    .eq('id', reservationId)
    .in('status', ['pending_payment', 'transfer_submitted'])

  if (error) {
    console.error('confirmDeposit error:', error.message)
    return { ok: false, error: 'Could not update booking.' }
  }

  void sendDepositConfirmed({
    to: row.lead_email,
    leadGivenNames: row.lead_given_names,
    reservationCode: row.reservation_code,
    totalPeople: row.total_people,
    depositAmountGBP: row.deposit_amount_gbp,
    amountReceivedGBP: amountReceived,
  })

  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${reservationId}`)
  return { ok: true }
}

export async function revertToPending(
  reservationId: string,
  adminNote?: string
): Promise<AdminActionResult> {
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

  const ttlHours = Number(process.env.BOOKING_TTL_HOURS ?? 30)
  const newExpiry = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()

  const { error } = await db
    .from('reservations')
    .update({
      status: 'pending_payment',
      transfer_submitted_at: null,
      confirmed_at: null,
      confirmed_by: null,
      deposit_received_gbp: null,
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
  void sendStatusReverted({
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
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()
  const { error } = await db
    .from('reservations')
    .update({
      lead_email: email.trim() || null,
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
    given_names: data.given_names.trim(),
    surname: data.surname.trim(),
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

export async function cancelBooking(reservationId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return { ok: false, error: 'Not authorised.' }

  const db = supabaseAdmin()
  const { error } = await db
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .in('status', ['pending_payment', 'transfer_submitted', 'confirmed'])

  if (error) {
    console.error('cancelBooking error:', error.message)
    return { ok: false, error: 'Could not cancel booking.' }
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${reservationId}`)
  return { ok: true }
}

export async function removeWaitingListEntry(id: string): Promise<AdminActionResult> {
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
