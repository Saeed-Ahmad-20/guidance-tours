import { supabaseAdmin } from './supabase-admin'
import { ROOM_PRICE_GBP, RoomType, ageGroup, formatTourLabel } from './booking'
import { ACTIVE_STATUSES } from './rooms'
import type { FinanceRow, FinanceStatus } from './finance-calc'

export type FinanceData = {
  tour: { id: string; label: string; departureDate: string | null }
  rows: FinanceRow[]
}

export async function loadFinanceData(tourId: string): Promise<FinanceData | null> {
  const db = supabaseAdmin()

  const { data: tour } = await db
    .from('tours')
    .select('id, slug, departure_date')
    .eq('id', tourId)
    .maybeSingle()
  if (!tour) return null
  const tourRow = tour as { id: string; slug: string; departure_date: string | null }

  const { data: reservations } = await db
    .from('reservations')
    .select('id, reservation_code, lead_given_names, lead_surname, status, total_cost_gbp, created_at')
    .eq('tour_id', tourId)
    .in('status', ACTIVE_STATUSES)
    .order('created_at', { ascending: true })

  const reservationRows = (reservations ?? []) as Array<{
    id: string
    reservation_code: string
    lead_given_names: string
    lead_surname: string
    status: FinanceStatus
    total_cost_gbp: number
    created_at: string
  }>
  const reservationIds = reservationRows.map(r => r.id)
  const reservationById = new Map(reservationRows.map(r => [r.id, r]))

  const { data: passengers } = reservationIds.length
    ? await db
        .from('reservation_passengers')
        .select(
          'id, reservation_id, position, given_names, surname, person_type, room_type, date_of_birth, price_override_gbp'
        )
        .in('reservation_id', reservationIds)
        .order('position', { ascending: true })
    : { data: [] }

  const passengerRows = (passengers ?? []) as Array<{
    id: string
    reservation_id: string
    position: number
    given_names: string
    surname: string
    person_type: 'adult' | 'infant'
    room_type: RoomType
    date_of_birth: string
    price_override_gbp: number | null
  }>

  const referenceISO = tourRow.departure_date ?? new Date().toISOString().slice(0, 10)

  const byReservation = new Map<string, typeof passengerRows>()
  for (const p of passengerRows) {
    const list = byReservation.get(p.reservation_id) ?? []
    list.push(p)
    byReservation.set(p.reservation_id, list)
  }

  const rows: FinanceRow[] = []
  for (const [reservationId, pax] of byReservation) {
    const reservation = reservationById.get(reservationId)
    if (!reservation) continue
    // Passengers with an explicit price_override_gbp (set when a reservation
    // ends up with mixed pricing, e.g. one person under a different promo
    // code than the rest) are charged that figure directly. Everyone else
    // prorates the *remaining* total — what's left after subtracting any
    // overrides — by their standard room-type price, so a promo-adjusted or
    // manually edited total still splits fairly and the whole reservation
    // sums back to its real total.
    const weightOf = (p: (typeof pax)[number]) => ROOM_PRICE_GBP[p.room_type]
    const overridden = pax.filter(p => p.price_override_gbp != null)
    const remaining = pax.filter(p => p.price_override_gbp == null)
    const overrideSum = overridden.reduce((s, p) => s + (p.price_override_gbp ?? 0), 0)
    const remainingTotal = reservation.total_cost_gbp - overrideSum
    const totalWeight = remaining.reduce((s, p) => s + weightOf(p), 0)
    for (const p of pax) {
      const amountCharged =
        p.price_override_gbp != null
          ? p.price_override_gbp
          : totalWeight > 0
          ? Math.round(((weightOf(p) / totalWeight) * remainingTotal) * 100) / 100
          : 0
      rows.push({
        id: p.id,
        reservationId,
        reservationCode: reservation.reservation_code,
        leadName: `${reservation.lead_given_names} ${reservation.lead_surname}`,
        name: `${p.given_names} ${p.surname}`,
        personType: p.person_type,
        ageGroup: ageGroup(p.date_of_birth, referenceISO),
        roomType: p.room_type,
        status: reservation.status,
        reservationCreatedAt: reservation.created_at,
        position: p.position,
        amountCharged,
      })
    }
  }

  return {
    tour: {
      id: tourRow.id,
      label: formatTourLabel(tourRow.slug),
      departureDate: tourRow.departure_date,
    },
    rows,
  }
}
