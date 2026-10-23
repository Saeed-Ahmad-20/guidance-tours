// Works out which lead passenger should be handed each hotel key card.
//
// A "planned room" is a group of passengers who share a room (the admin's room allocations, or, for
// anyone not yet placed, their own booking's beds). The hotel's real room numbers are interchangeable
// within a room type, so they can be handed out in any order. To keep a booking's cards together, each
// room goes to the lead of the booking with most people in it, rooms with the same lead are given
// consecutive room numbers, and the biggest bookings are served first.

export type RoomType = 'quad' | 'triple' | 'double'

export type PlannedMember = { name: string; infant: boolean; reservationId: string }
export type PlannedRoom = { key: string; type: RoomType; members: PlannedMember[] }
// A booking, or several bookings travelling together that are handled as one.
export type KeyBooking = {
  id: string
  code: string // for a group, every booking code joined with " + "
  leadName: string
  leadPhone: string | null
  size: number
  alsoWith?: string[] // names of the other bookings' leads, for a group
}

export type CardAssignment = {
  number: string
  type: RoomType
  members: PlannedMember[]
}

export type LeadHandout = {
  booking: KeyBooking
  cards: CardAssignment[]
}

export type KeyCardPlan = {
  handouts: LeadHandout[]
  // Rooms that did not get a card because fewer cards were entered than rooms planned.
  missing: { type: RoomType; rooms: PlannedRoom[] }[]
  // Room numbers entered beyond the rooms planned.
  spare: { type: RoomType; numbers: string[] }[]
}

const TYPES: RoomType[] = ['quad', 'triple', 'double']

// "412", "1204", "B12": numbers first by their digits, then as text.
const byNumber = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true })

// Splits "412, 413 415\n420" into room numbers, dropping repeats.
export function parseRoomNumbers(text: string): string[] {
  return [...new Set(text.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean))].sort(byNumber)
}

export function planKeyCards(
  rooms: PlannedRoom[],
  bookings: KeyBooking[],
  numbers: Record<RoomType, string[]>
): KeyCardPlan {
  const booking = new Map(bookings.map(b => [b.id, b]))
  const cardsByLead = new Map<string, CardAssignment[]>()
  const missing: KeyCardPlan['missing'] = []
  const spare: KeyCardPlan['spare'] = []

  // The booking with the most people in the room collects its card.
  const holderOf = (room: PlannedRoom): KeyBooking => {
    const counts = new Map<string, number>()
    for (const m of room.members) counts.set(m.reservationId, (counts.get(m.reservationId) ?? 0) + 1)
    return [...counts.keys()]
      .map(id => booking.get(id)!)
      .filter(Boolean)
      .sort(
        (a, b) =>
          (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || b.size - a.size || a.code.localeCompare(b.code)
      )[0]
  }

  for (const type of TYPES) {
    const ofType = rooms.filter(r => r.type === type && r.members.length > 0)
    const nums = numbers[type]

    const roomsByHolder = new Map<string, PlannedRoom[]>()
    for (const room of ofType) {
      const h = holderOf(room)
      if (!h) continue
      roomsByHolder.set(h.id, [...(roomsByHolder.get(h.id) ?? []), room])
    }

    // Leads with the most rooms first, so the largest groups get the longest runs of consecutive rooms.
    const sequence = [...roomsByHolder.entries()]
      .sort(([a], [b]) => {
        const ba = booking.get(a)!
        const bb = booking.get(b)!
        return (
          roomsByHolder.get(b)!.length - roomsByHolder.get(a)!.length ||
          bb.size - ba.size ||
          ba.code.localeCompare(bb.code)
        )
      })
      .flatMap(([id, list]) => list.map(room => ({ id, room })))

    sequence.forEach(({ id, room }, i) => {
      if (i >= nums.length) return
      cardsByLead.set(id, [...(cardsByLead.get(id) ?? []), { number: nums[i], type, members: room.members }])
    })

    if (sequence.length > nums.length) missing.push({ type, rooms: sequence.slice(nums.length).map(s => s.room) })
    if (nums.length > sequence.length) spare.push({ type, numbers: nums.slice(sequence.length) })
  }

  const handouts = [...cardsByLead.entries()]
    .map(([id, cards]) => ({
      booking: booking.get(id)!,
      cards: cards.sort((a, b) => byNumber(a.number, b.number)),
    }))
    .sort((a, b) => byNumber(a.cards[0].number, b.cards[0].number))

  return { handouts, missing, spare }
}
