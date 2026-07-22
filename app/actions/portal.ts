'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '../lib/supabase-admin'
import { sendDepositSubmitted } from '../lib/emails'
import { checkRateLimit, clientIp, resetRateLimit } from '../lib/rate-limit'
import { assertSameOrigin } from '../lib/csrf'
import { isValidEmail } from '../lib/booking'
import {
  PORTAL_COOKIE,
  signPortalSession,
  verifyPortalSession,
} from '../lib/portal-session'

const isProd = process.env.NODE_ENV === 'production'

export type PortalLoginResult =
  | { ok: true }
  | { ok: false; error: string }

export async function portalLogin(formData: FormData): Promise<PortalLoginResult> {
  await assertSameOrigin()
  const rawCode = (formData.get('reservation_code') as string | null)?.trim() ?? ''
  const rawSurname = (formData.get('surname') as string | null)?.trim() ?? ''

  if (!rawCode || !rawSurname) {
    return { ok: false, error: 'Please enter your reservation number and surname.' }
  }

  // Reservation code is 8 chars case-sensitive. Basic shape check avoids obvious abuse.
  if (rawCode.length !== 8 || !/^[A-Za-z0-9]{8}$/.test(rawCode)) {
    return { ok: false, error: 'Reservation number is not valid.' }
  }

  const ip = await clientIp()
  if (!(await checkRateLimit('portalLogin', ip, 12, 15 * 60 * 1000))) {
    return { ok: false, error: 'Too many attempts. Please try again later.' }
  }

  const db = supabaseAdmin()

  // Run expiry sweep so a just-expired booking cannot sign in as "pending".
  await db.rpc('expire_old_reservations')

  const { data, error } = await db
    .from('reservations')
    .select('id, lead_surname, status')
    .eq('reservation_code', rawCode)
    .maybeSingle()

  if (error) {
    console.error('portalLogin error:', error.message)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
  if (!data) {
    return { ok: false, error: 'No booking matches those details.' }
  }

  const row = data as { id: string; lead_surname: string; status: string }

  if (row.lead_surname.trim().toLowerCase() !== rawSurname.toLowerCase()) {
    return { ok: false, error: 'No booking matches those details.' }
  }

  await resetRateLimit('portalLogin', ip)
  const { value, maxAge } = await signPortalSession(row.id)
  const store = await cookies()
  store.set(PORTAL_COOKIE, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge,
  })

  return { ok: true }
}

export async function portalLogout() {
  await assertSameOrigin()
  const store = await cookies()
  store.delete(PORTAL_COOKIE)
  revalidatePath('/portal')
}

export type UpdateContactResult = { ok: true } | { ok: false; error: string }

export async function updateLeadContact(email: string, phone: string): Promise<UpdateContactResult> {
  await assertSameOrigin()
  const store = await cookies()
  const cookie = store.get(PORTAL_COOKIE)?.value
  const rid = await verifyPortalSession(cookie)
  if (!rid) return { ok: false, error: 'Your session has expired. Please log in again.' }

  const trimmedEmail = email.trim()
  if (trimmedEmail && !isValidEmail(trimmedEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }

  const db = supabaseAdmin()
  const { error } = await db
    .from('reservations')
    .update({
      lead_email: trimmedEmail || null,
      lead_phone: phone.trim() || null,
    })
    .eq('id', rid)

  if (error) {
    console.error('updateLeadContact error:', error.message)
    return { ok: false, error: 'Could not update contact details.' }
  }

  revalidatePath('/portal')
  return { ok: true }
}

export type MarkDepositResult =
  | { ok: true }
  | { ok: false; error: string }

export async function markDepositSent(): Promise<MarkDepositResult> {
  await assertSameOrigin()
  const store = await cookies()
  const cookie = store.get(PORTAL_COOKIE)?.value
  const rid = await verifyPortalSession(cookie)
  if (!rid) return { ok: false, error: 'Your session has expired. Please log in again.' }

  const db = supabaseAdmin()
  await db.rpc('expire_old_reservations')

  const { data: current, error: readErr } = await db
    .from('reservations')
    .select(
      'status, reservation_code, lead_given_names, lead_surname, lead_email, lead_phone, total_people, deposit_amount_gbp, deposit_received_gbp'
    )
    .eq('id', rid)
    .maybeSingle()

  if (readErr || !current) return { ok: false, error: 'Booking not found.' }
  const row = current as {
    status: string
    reservation_code: string
    lead_given_names: string
    lead_surname: string
    lead_email: string | null
    lead_phone: string | null
    total_people: number
    deposit_amount_gbp: number
    deposit_received_gbp: number | null
  }
  const status = row.status

  if (status === 'expired') {
    return {
      ok: false,
      error:
        'This booking has expired because the deposit window passed. Please make a new booking.',
    }
  }
  if (status === 'confirmed') {
    return { ok: false, error: 'This booking is already confirmed.' }
  }
  if (status === 'cancelled') {
    return { ok: false, error: 'This booking was cancelled.' }
  }
  const isPartialTransfer =
    status === 'transfer_submitted' &&
    row.deposit_received_gbp !== null &&
    row.deposit_received_gbp < row.deposit_amount_gbp
  if (status === 'transfer_submitted' && !isPartialTransfer) {
    return { ok: false, error: 'Your transfer is already being reviewed.' }
  }

  const { error } = await db
    .from('reservations')
    .update({
      status: 'transfer_submitted',
      transfer_submitted_at: new Date().toISOString(),
    })
    .eq('id', rid)
    .in('status', ['pending_payment', 'transfer_submitted'])

  if (error) {
    console.error('markDepositSent error:', error.message)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }

  await sendDepositSubmitted({
    reservationId: rid,
    reservationCode: row.reservation_code,
    leadName: `${row.lead_given_names} ${row.lead_surname}`.trim(),
    leadEmail: row.lead_email,
    leadPhone: row.lead_phone,
    totalPeople: row.total_people,
    depositAmountGBP: row.deposit_amount_gbp,
  })

  revalidatePath('/portal')
  return { ok: true }
}
