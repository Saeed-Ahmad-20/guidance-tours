import { supabaseAdmin } from './supabase-admin'
import type { KeyBooking, PlannedRoom, RoomType } from './key-cards'

// Every confirmed booking, for finding one by the name of anyone on it.
export type BookingPerson = { code: string; leadName: string; names: string[] }

export type TravelGroup = { id: string; parts: { code: string; leadName: string }[] }

// The confirmed passengers of a tour, grouped into the rooms they share. Rooms the admin has grouped come
// first; anyone not yet placed shares their own booking's bed group.
export async function loadKeyCardData(tourId: string): Promise<{
  rooms: PlannedRoom[]
  bookings: KeyBooking[]
  groups: TravelGroup[]
  people: BookingPerson[]
  groupingReady: boolean
  ungrouped: number
}> {
  const db = supabaseAdmin()

  const columns = 'id, reservation_code, lead_given_names, lead_surname, lead_phone'
  const first = await db
    .from('reservations')
    .select(`${columns}, travel_group`)
    .eq('tour_id', tourId)
    .eq('status', 'confirmed')
  // Until the travel_groups migration has been applied, carry on without linking.
  const groupingReady = !first.error
  const resData: unknown[] | null = first.error
    ? (await db.from('reservations').select(columns).eq('tour_id', tourId).eq('status', 'confirmed')).data
    : first.data
  const reservations = ((resData ?? []) as Array<{
    id: string
    reservation_code: string
    lead_given_names: string
    lead_surname: string
    lead_phone: string | null
    travel_group?: string | null
  }>).map(r => ({ ...r, travel_group: r.travel_group ?? null }))

  const { data: paxData } = reservations.length
    ? await db
        .from('reservation_passengers')
        .select('id, reservation_id, given_names, surname, person_type, room_type, room_index, room_allocation_id')
        .in('reservation_id', reservations.map(r => r.id))
        .order('position', { ascending: true })
    : { data: [] }
  const passengers = (paxData ?? []) as Array<{
    id: string
    reservation_id: string
    given_names: string
    surname: string
    person_type: 'adult' | 'infant'
    room_type: RoomType
    room_index: number
    room_allocation_id: string | null
  }>

  const sizes = new Map<string, number>()
  for (const p of passengers) sizes.set(p.reservation_id, (sizes.get(p.reservation_id) ?? 0) + 1)

  // Bookings sharing a travel group are handled as one: the biggest booking's lead collects the cards.
  const groupOf = new Map(reservations.map(r => [r.id, r.travel_group ?? r.id]))
  const members = new Map<string, typeof reservations>()
  for (const r of reservations) members.set(groupOf.get(r.id)!, [...(members.get(groupOf.get(r.id)!) ?? []), r])

  const bookings: KeyBooking[] = [...members.entries()].map(([id, list]) => {
    const sorted = [...list].sort((a, b) => (sizes.get(b.id) ?? 0) - (sizes.get(a.id) ?? 0) || a.reservation_code.localeCompare(b.reservation_code))
    const lead = sorted[0]
    const name = (r: (typeof reservations)[number]) => `${r.lead_given_names} ${r.lead_surname}`.trim()
    return {
      id,
      code: sorted.map(r => r.reservation_code).join(' + '),
      leadName: name(lead),
      leadPhone: lead.lead_phone,
      size: sorted.reduce((n, r) => n + (sizes.get(r.id) ?? 0), 0),
      alsoWith: sorted.length > 1 ? sorted.slice(1).map(name) : undefined,
    }
  })

  const groups: TravelGroup[] = [...members.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([id, list]) => ({
      id,
      parts: list.map(r => ({ code: r.reservation_code, leadName: `${r.lead_given_names} ${r.lead_surname}`.trim() })),
    }))

  const people: BookingPerson[] = reservations.map(r => ({
    code: r.reservation_code,
    leadName: `${r.lead_given_names} ${r.lead_surname}`.trim(),
    names: passengers.filter(p => p.reservation_id === r.id).map(p => `${p.given_names} ${p.surname}`.trim()),
  }))

  const rooms = new Map<string, PlannedRoom>()
  for (const p of passengers) {
    const key = p.room_allocation_id ?? `${p.reservation_id}:${p.room_type}:${p.room_index}`
    const room = rooms.get(key) ?? { key, type: p.room_type, members: [] }
    room.members.push({
      name: `${p.given_names} ${p.surname}`.trim(),
      infant: p.person_type === 'infant',
      reservationId: groupOf.get(p.reservation_id) ?? p.reservation_id,
    })
    rooms.set(key, room)
  }

  return {
    rooms: [...rooms.values()],
    bookings,
    groups,
    people,
    groupingReady,
    ungrouped: passengers.filter(p => !p.room_allocation_id).length,
  }
}
