'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '../lib/supabase-admin'
import { sendDepositSubmitted } from '../lib/emails'
import { checkRateLimit, clientIp, resetRateLimit } from '../lib/rate-limit'
import { assertSameOrigin } from '../lib/csrf'
import { isValidEmail } from '../lib/booking'
import { uploadPassportPhotoToDrive } from '../lib/google-drive'
import { uploadPassportPhotoToStorage } from '../lib/passport-storage'
import {
  PORTAL_COOKIE,
  getPortalSession,
  signPortalSession,
} from '../lib/portal-session'
import { CHECKLIST_KEYS } from '../portal/checklist/checklist-items'

const isProd = process.env.NODE_ENV === 'production'

export async function setChecklistItem(
  itemKey: string,
  checked: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertSameOrigin()
  const session = await getPortalSession()
  if (!session) return { ok: false, error: 'Your session has expired. Please log in again.' }
  if (!CHECKLIST_KEYS.has(itemKey)) return { ok: false, error: 'Unknown checklist item.' }

  const table = supabaseAdmin().from('passenger_checklist')
  const { error } = checked
    ? await table.upsert(
        { passenger_id: session.pid, item_key: itemKey },
        { onConflict: 'passenger_id,item_key', ignoreDuplicates: true }
      )
    : await table.delete().eq('passenger_id', session.pid).eq('item_key', itemKey)

  if (error) {
    console.error('setChecklistItem error:', error.message)
    return { ok: false, error: 'Could not save. Please try again.' }
  }
  return { ok: true }
}

export type PortalLoginResult =
  | { ok: true }
  | { ok: false; error: string }

export async function portalLogin(formData: FormData): Promise<PortalLoginResult> {
  await assertSameOrigin()
  const rawCode = (formData.get('reservation_code') as string | null)?.trim() ?? ''
  const rawSurname = (formData.get('surname') as string | null)?.trim() ?? ''
  const rawDob = (formData.get('date_of_birth') as string | null)?.trim() ?? ''

  if (!rawCode || !rawSurname || !rawDob) {
    return { ok: false, error: 'Please enter your reservation number, surname and date of birth.' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDob)) {
    return { ok: false, error: 'Please enter a valid date of birth.' }
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
    .select('id')
    .eq('reservation_code', rawCode)
    .maybeSingle()

  if (error) {
    console.error('portalLogin error:', error.message)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
  const noMatch = { ok: false as const, error: 'No passenger matches those details.' }
  if (!data) return noMatch
  const rid = (data as { id: string }).id

  const { data: passengers, error: paxErr } = await db
    .from('reservation_passengers')
    .select('id, surname, date_of_birth, position')
    .eq('reservation_id', rid)
    .order('position', { ascending: true })
  if (paxErr || !passengers || passengers.length === 0) return noMatch

  const rows = passengers as Array<{ id: string; surname: string; date_of_birth: string; position: number }>
  const surname = rawSurname.toLowerCase()
  const matches = rows.filter(
    p => p.surname.trim().toLowerCase() === surname && p.date_of_birth === rawDob
  )
  if (matches.length !== 1) return noMatch

  await resetRateLimit('portalLogin', ip)
  const { value, maxAge } = await signPortalSession({
    rid,
    pid: matches[0].id,
    // The lead passenger is always the first passenger on the booking.
    lead: matches[0].id === rows[0].id,
  })
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
  revalidatePath('/portal', 'layout')
}

export type UpdateContactResult = { ok: true } | { ok: false; error: string }

export async function updateLeadContact(email: string, phone: string): Promise<UpdateContactResult> {
  await assertSameOrigin()
  const session = await getPortalSession()
  if (!session) return { ok: false, error: 'Your session has expired. Please log in again.' }
  if (!session.lead) return { ok: false, error: 'Only the lead passenger can change contact details.' }
  const rid = session.rid

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

export async function markPaymentSent(amountClaimedGbp: number): Promise<MarkDepositResult> {
  await assertSameOrigin()
  const session = await getPortalSession()
  if (!session) return { ok: false, error: 'Your session has expired. Please log in again.' }
  if (!session.lead) return { ok: false, error: 'Only the lead passenger can record payments.' }
  const rid = session.rid

  const db = supabaseAdmin()
  await db.rpc('expire_old_reservations')

  const { data: current, error: readErr } = await db
    .from('reservations')
    .select(
      'status, reservation_code, lead_given_names, lead_surname, lead_email, lead_phone, total_people, total_cost_gbp, deposit_amount_gbp, amount_received_gbp'
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
    total_cost_gbp: number
    deposit_amount_gbp: number
    amount_received_gbp: number
  }
  const status = row.status

  if (status === 'expired') {
    return {
      ok: false,
      error:
        'This booking has expired because the deposit window passed. Please make a new booking.',
    }
  }
  if (status === 'cancelled') {
    return { ok: false, error: 'This booking was cancelled.' }
  }

  const remaining = Math.max(0, row.total_cost_gbp - row.amount_received_gbp)
  if (remaining <= 0) {
    return { ok: false, error: 'Your booking is fully paid — there is nothing outstanding.' }
  }

  const claimed = Math.min(remaining, Math.max(0, Math.floor(amountClaimedGbp) || 0))
  if (claimed <= 0) {
    return { ok: false, error: 'Enter a valid amount.' }
  }

  const updateData: Record<string, unknown> = {
    last_claimed_amount_gbp: claimed,
    last_claimed_at: new Date().toISOString(),
  }
  if (status === 'pending_payment') {
    updateData.status = 'transfer_submitted'
    updateData.transfer_submitted_at = new Date().toISOString()
  }

  const { error } = await db
    .from('reservations')
    .update(updateData)
    .eq('id', rid)
    .in('status', ['pending_payment', 'transfer_submitted', 'confirmed'])

  if (error) {
    console.error('markPaymentSent error:', error.message)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }

  await sendDepositSubmitted({
    reservationId: rid,
    reservationCode: row.reservation_code,
    leadName: `${row.lead_given_names} ${row.lead_surname}`.trim(),
    leadEmail: row.lead_email,
    leadPhone: row.lead_phone,
    totalPeople: row.total_people,
    claimedAmountGBP: claimed,
  })

  revalidatePath('/portal')
  return { ok: true }
}

const PASSPORT_PHOTO_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}
const MAX_PASSPORT_PHOTO_BYTES = 10 * 1024 * 1024

export type UploadPassportPhotoResult =
  | { ok: true }
  | { ok: false; error: string }

export async function uploadPassportPhoto(
  passengerId: string,
  formData: FormData
): Promise<UploadPassportPhotoResult> {
  await assertSameOrigin()
  const session = await getPortalSession()
  if (!session) return { ok: false, error: 'Your session has expired. Please log in again.' }
  if (!session.lead && passengerId !== session.pid) {
    return { ok: false, error: 'You can only upload your own passport.' }
  }
  const rid = session.rid

  const ip = await clientIp()
  if (!(await checkRateLimit('uploadPassportPhoto', ip, 30, 60 * 60 * 1000))) {
    return { ok: false, error: 'Too many uploads. Please try again later.' }
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Please choose a file to upload.' }
  }

  const ext = PASSPORT_PHOTO_MIME_EXT[file.type]
  if (!ext) {
    return { ok: false, error: 'Please upload a JPG, PNG, WEBP image, or a PDF.' }
  }
  if (file.size > MAX_PASSPORT_PHOTO_BYTES) {
    return { ok: false, error: 'File is too large (max 10MB).' }
  }

  const db = supabaseAdmin()

  // Name comes from our own records, never from client input, so the
  // resulting Drive filename can't be spoofed via the upload request.
  const { data: passenger, error: passengerErr } = await db
    .from('reservation_passengers')
    .select('id, given_names, surname, passport_photo_uploaded_at')
    .eq('id', passengerId)
    .eq('reservation_id', rid)
    .maybeSingle()

  if (passengerErr || !passenger) return { ok: false, error: 'Passenger not found.' }
  const p = passenger as {
    id: string
    given_names: string
    surname: string
    passport_photo_uploaded_at: string | null
  }

  // One shot only — once a photo is on file for this passenger, uploading
  // again is rejected server-side too, not just hidden in the UI.
  if (p.passport_photo_uploaded_at) {
    return { ok: false, error: 'A passport photo has already been uploaded for this passenger.' }
  }

  const safeName = `${p.given_names} ${p.surname}`
    .trim()
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
  const filename = `${safeName} passport.${ext}`
  const storagePath = `${rid}/${p.id}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    await uploadPassportPhotoToDrive({ buffer, filename, mimeType: file.type })
  } catch (err) {
    console.error('uploadPassportPhoto drive error:', err)
    return { ok: false, error: 'Could not upload the file. Please try again.' }
  }

  try {
    await uploadPassportPhotoToStorage({ path: storagePath, buffer, mimeType: file.type })
  } catch (err) {
    console.error('uploadPassportPhoto storage error:', err)
    return { ok: false, error: 'Could not upload the file. Please try again.' }
  }

  const { error: updateErr } = await db
    .from('reservation_passengers')
    .update({
      passport_photo_uploaded_at: new Date().toISOString(),
      passport_photo_path: storagePath,
    })
    .eq('id', p.id)
  if (updateErr) {
    console.error('uploadPassportPhoto db update error:', updateErr.message)
  }

  revalidatePath('/portal')
  return { ok: true }
}
