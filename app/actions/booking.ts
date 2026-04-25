'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '../lib/supabase-admin'
import { sendBookingCreated } from '../lib/emails'
import {
  DEPOSIT_PER_PERSON_GBP,
  Passenger,
  RoomSelection,
  TOTAL_PLACES,
  TOUR_SLUG,
  generateReservationCode,
  passportNeedsRenewal,
  totalCostGBP,
  totalPeople,
} from '../lib/booking'

const TTL_HOURS = Number(process.env.BOOKING_TTL_HOURS ?? 30)

export type AvailabilityResult = {
  total: number
  taken: number
  remaining: number
}

export async function getAvailability(): Promise<AvailabilityResult> {
  const db = supabaseAdmin()
  const { data, error } = await db.rpc('get_places_taken', { p_tour_slug: TOUR_SLUG })
  if (error) {
    console.error('getAvailability error:', error.message)
    return { total: TOTAL_PLACES, taken: 0, remaining: TOTAL_PLACES }
  }
  const taken = Number(data ?? 0)
  return { total: TOTAL_PLACES, taken, remaining: Math.max(0, TOTAL_PLACES - taken) }
}

export type CreateBookingInput = {
  rooms: RoomSelection
  leadSurname: string
  leadGivenNames: string
  leadEmail?: string
  leadPhone?: string
  passengers: Passenger[]
}

export type CreateBookingResult =
  | { ok: true; code: string }
  | { ok: false; error: 'not_enough_places'; remaining: number }
  | { ok: false; error: 'validation'; message: string }
  | { ok: false; error: 'server'; message: string }

export async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const { rooms, leadSurname, leadGivenNames, leadEmail, leadPhone, passengers } = input

  const people = totalPeople(rooms)
  if (people < 1) return { ok: false, error: 'validation', message: 'Select at least one room.' }
  if (people !== passengers.length)
    return { ok: false, error: 'validation', message: 'Passenger count does not match rooms.' }
  if (!leadSurname.trim() || !leadGivenNames.trim())
    return { ok: false, error: 'validation', message: 'Lead Passenger name is required.' }

  const today = new Date().toISOString().slice(0, 10)
  for (const p of passengers) {
    if (!p.given_names.trim() || !p.surname.trim())
      return { ok: false, error: 'validation', message: 'All passenger names are required.' }
    if (!p.date_of_birth || !p.passport_expiry)
      return { ok: false, error: 'validation', message: 'All passenger dates are required.' }
    if (p.date_of_birth < '1900-01-01' || p.date_of_birth >= today)
      return { ok: false, error: 'validation', message: 'Date of birth must be between 1 Jan 1900 and today.' }
    p.passport_renewal_required = passportNeedsRenewal(p.passport_expiry)
  }

  const cost = totalCostGBP(rooms)
  const deposit = people * DEPOSIT_PER_PERSON_GBP

  const db = supabaseAdmin()

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateReservationCode()
    const { data, error } = await db.rpc('create_reservation', {
      p_tour_slug: TOUR_SLUG,
      p_reservation_code: code,
      p_lead_surname: leadSurname.trim(),
      p_lead_given_names: leadGivenNames.trim(),
      p_lead_email: leadEmail?.trim() || null,
      p_lead_phone: leadPhone?.trim() || null,
      p_quad_rooms: rooms.quad,
      p_triple_rooms: rooms.triple,
      p_double_rooms: rooms.double,
      p_total_people: people,
      p_total_cost_gbp: cost,
      p_deposit_amount_gbp: deposit,
      p_ttl_hours: TTL_HOURS,
      p_passengers: passengers,
    })

    if (!error) {
      const row = Array.isArray(data) ? data[0] : data
      const savedCode = (row?.reservation_code as string | undefined) ?? code
      void sendBookingCreated({
        to: leadEmail?.trim() || null,
        leadGivenNames: leadGivenNames.trim(),
        reservationCode: savedCode,
        depositAmountGBP: deposit,
        totalPeople: people,
      })
      return { ok: true, code: savedCode }
    }

    const msg = error.message || ''
    if (msg.includes('NOT_ENOUGH_PLACES')) {
      const m = msg.match(/NOT_ENOUGH_PLACES:(-?\d+)/)
      const remaining = m ? Math.max(0, parseInt(m[1], 10)) : 0
      return { ok: false, error: 'not_enough_places', remaining }
    }
    if (msg.includes('reservations_reservation_code_key')) {
      continue
    }
    console.error('createBooking error:', msg)
    return { ok: false, error: 'server', message: 'Something went wrong. Please try again.' }
  }

  return { ok: false, error: 'server', message: 'Could not allocate a reservation code. Please try again.' }
}

export async function createBookingAndRedirect(input: CreateBookingInput): Promise<CreateBookingResult> {
  const result = await createBooking(input)
  if (result.ok) redirect(`/umrah-2026/book/confirmation/${result.code}`)
  return result
}

export type WaitingListInput = {
  name: string
  email: string
  phone?: string
  peopleRequested: number
}

export async function joinWaitingList(input: WaitingListInput): Promise<{ ok: boolean; error?: string }> {
  const name = input.name.trim()
  const email = input.email.trim()
  const people = Math.max(1, Math.floor(input.peopleRequested))
  if (!name || !email) return { ok: false, error: 'Name and email are required.' }

  const db = supabaseAdmin()
  const { data: tour, error: tourErr } = await db
    .from('tours')
    .select('id')
    .eq('slug', TOUR_SLUG)
    .single()
  if (tourErr || !tour) return { ok: false, error: 'Tour not found.' }

  const { error } = await db.from('waiting_list').insert({
    tour_id: (tour as { id: string }).id,
    name,
    email,
    phone: input.phone?.trim() || null,
    people_requested: people,
  })
  if (error) {
    console.error('waitingList error:', error.message)
    return { ok: false, error: 'Could not save waiting list entry.' }
  }
  return { ok: true }
}
