import { supabaseAdmin } from './supabase-admin'
import { ROOM_CAPACITY, RoomType, formatTourLabel } from './booking'

export const ROOM_TYPES: RoomType[] = ['quad', 'triple', 'double']
export const ACTIVE_STATUSES = ['pending_payment', 'transfer_submitted', 'confirmed']

export type PassengerCard = {
  id: string
  name: string
  personType: 'adult' | 'infant'
  reservationCode: string
  leadName: string
}

export type RoomCard = {
  id: string
  label: string
  capacity: number
  members: PassengerCard[]
}

export type RoomsByType = Record<RoomType, { rooms: RoomCard[]; unassigned: PassengerCard[] }>

export type RoomsData = {
  tour: { id: string; label: string }
  byType: RoomsByType
}

export async function loadRoomsData(tourId: string): Promise<RoomsData | null> {
  const db = supabaseAdmin()

  const { data: tour } = await db
    .from('tours')
    .select('id, slug')
    .eq('id', tourId)
    .maybeSingle()
  if (!tour) return null

  const [{ data: reservations }, { data: roomAllocations }] = await Promise.all([
    db
      .from('reservations')
      .select('id, reservation_code, lead_given_names, lead_surname, status')
      .eq('tour_id', tourId)
      .in('status', ACTIVE_STATUSES)
      .order('created_at', { ascending: true }),
    db
      .from('room_allocations')
      .select('id, room_type, label, created_at')
      .eq('tour_id', tourId)
      .order('created_at', { ascending: true }),
  ])

  const reservationRows = (reservations ?? []) as Array<{
    id: string
    reservation_code: string
    lead_given_names: string
    lead_surname: string
    status: string
  }>
  const reservationIds = reservationRows.map(r => r.id)
  const reservationById = new Map(reservationRows.map(r => [r.id, r]))

  const { data: passengers } = reservationIds.length
    ? await db
        .from('reservation_passengers')
        .select('id, reservation_id, given_names, surname, person_type, room_type, room_allocation_id, position')
        .in('reservation_id', reservationIds)
        .order('position', { ascending: true })
    : { data: [] }

  const passengerRows = (passengers ?? []) as Array<{
    id: string
    reservation_id: string
    given_names: string
    surname: string
    person_type: 'adult' | 'infant'
    room_type: RoomType
    room_allocation_id: string | null
  }>

  const toCard = (p: (typeof passengerRows)[number]): PassengerCard => {
    const reservation = reservationById.get(p.reservation_id)
    return {
      id: p.id,
      name: `${p.given_names} ${p.surname}`,
      personType: p.person_type,
      reservationCode: reservation?.reservation_code ?? '—',
      leadName: reservation ? `${reservation.lead_given_names} ${reservation.lead_surname}` : '—',
    }
  }

  const roomRows = (roomAllocations ?? []) as Array<{
    id: string
    room_type: RoomType
    label: string
    created_at: string
  }>

  const byType: RoomsByType = {
    quad: { rooms: [], unassigned: [] },
    triple: { rooms: [], unassigned: [] },
    double: { rooms: [], unassigned: [] },
  }

  for (const type of ROOM_TYPES) {
    byType[type].rooms = roomRows
      .filter(r => r.room_type === type)
      .map(r => ({
        id: r.id,
        label: r.label,
        capacity: ROOM_CAPACITY[type],
        members: passengerRows.filter(p => p.room_type === type && p.room_allocation_id === r.id).map(toCard),
      }))
    byType[type].unassigned = passengerRows
      .filter(p => p.room_type === type && !p.room_allocation_id)
      .map(toCard)
  }

  return {
    tour: { id: (tour as { id: string; slug: string }).id, label: formatTourLabel((tour as { slug: string }).slug) },
    byType,
  }
}
