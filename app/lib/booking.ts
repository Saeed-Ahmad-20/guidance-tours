import { randomBytes } from 'node:crypto'

export const TOUR_SLUG = 'umrah-2026'

// Capacity describes the size of the physical room each bed lives in; it is
// NOT a multiplier on booking counts — each unit booked = one bed = one person.
export const ROOM_CAPACITY = { quad: 4, triple: 3, double: 2 } as const
export const ROOM_PRICE_GBP = { quad: 1695, triple: 1795, double: 1895 } as const
export const DEPOSIT_PER_PERSON_GBP = 299
export const TOTAL_PLACES = 23

export const RETURN_DATE = '2026-11-04'
export const DEPARTURE_DATE = '2026-10-25'
export const PASSPORT_VALIDITY_CUTOFF = '2027-05-04'

export const BANK_DETAILS = {
  accountHolder: 'GUIDANCE HUB',
  accountNumber: '03737934',
  sortCode: '20-64-12',
} as const

export type RoomType = keyof typeof ROOM_CAPACITY
export type PersonType = 'adult' | 'infant'

export type RoomSelection = { quad: number; triple: number; double: number }

export type Passenger = {
  position: number
  room_type: RoomType
  room_index: number
  person_type: PersonType
  given_names: string
  surname: string
  date_of_birth: string
  passport_expiry: string
  passport_renewal_required: boolean
}

export function totalPeople(rooms: RoomSelection): number {
  return rooms.quad + rooms.triple + rooms.double
}

export function totalCostGBP(rooms: RoomSelection): number {
  return (
    rooms.quad * ROOM_PRICE_GBP.quad +
    rooms.triple * ROOM_PRICE_GBP.triple +
    rooms.double * ROOM_PRICE_GBP.double
  )
}

export function totalDepositGBP(rooms: RoomSelection): number {
  return totalPeople(rooms) * DEPOSIT_PER_PERSON_GBP
}

export function passportNeedsRenewal(expiryISO: string): boolean {
  return expiryISO < PASSPORT_VALIDITY_CUTOFF
}

const CODE_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateReservationCode(): string {
  const bytes = randomBytes(8)
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return out
}

// One entry per bed booked. room_index is the zero-based position of that bed
// among all beds of the same type within this booking, which is all we use it
// for (it no longer denotes a physical room assignment, since beds of the same
// type may be spread across different physical rooms).
export function buildBedLayout(rooms: RoomSelection): Array<{
  room_type: RoomType
  room_index: number
}> {
  const layout: Array<{ room_type: RoomType; room_index: number }> = []
  for (let i = 0; i < rooms.quad; i++) layout.push({ room_type: 'quad', room_index: i })
  for (let i = 0; i < rooms.triple; i++) layout.push({ room_type: 'triple', room_index: i })
  for (let i = 0; i < rooms.double; i++) layout.push({ room_type: 'double', room_index: i })
  return layout
}

export function formatGBP(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`
}
