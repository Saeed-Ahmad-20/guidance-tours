export const TOUR_SLUG = 'umrah-2026'

export const BOOKING_TTL_HOURS = Number(process.env.BOOKING_TTL_HOURS ?? 30)
export const BOOKING_DISPLAY_TTL_HOURS = Number(
  process.env.BOOKING_DISPLAY_TTL_HOURS ?? 24
)

// Capacity describes the size of the physical room each bed lives in; it is
// NOT a multiplier on booking counts — each unit booked = one bed = one person.
export const ROOM_CAPACITY = { quad: 4, triple: 3, double: 2 } as const
export const ROOM_PRICE_GBP = { quad: 1745, triple: 1845, double: 1945 } as const
export const DEPOSIT_PER_PERSON_GBP = 299

export const PROMO_CODES = {
  GHOCT2026: { quad: 1559, triple: 1636, double: 1788 },
  ADMIN2026: { quad: 0, triple: 77, double: 229 },
  // Ground-package-only rate: actual ground cost per room type (574/651/803)
  // plus a flat £150 — this code doesn't include flights.
  GROUND2026: { quad: 724, triple: 801, double: 953 },
} as const

export type PromoCode = keyof typeof PROMO_CODES

export function normalizePromoCode(code: string | undefined | null): PromoCode | null {
  const normalized = code?.trim().toUpperCase()
  return normalized && normalized in PROMO_CODES ? (normalized as PromoCode) : null
}

export function isValidPromoCode(code: string | undefined | null): boolean {
  return normalizePromoCode(code) !== null
}

export function roomPriceGBP(promoCode?: string | null): { quad: number; triple: number; double: number } {
  const normalized = normalizePromoCode(promoCode)
  return normalized ? PROMO_CODES[normalized] : ROOM_PRICE_GBP
}

export const TOTAL_PLACES = 22

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

export function totalCostGBP(rooms: RoomSelection, promoCode?: string | null): number {
  const price = roomPriceGBP(promoCode)
  return rooms.quad * price.quad + rooms.triple * price.triple + rooms.double * price.double
}

export function totalDepositGBP(rooms: RoomSelection): number {
  return totalPeople(rooms) * DEPOSIT_PER_PERSON_GBP
}

// A promo code can bring the package total below the standard per-person
// deposit (e.g. ADMIN2026), in which case there's nothing sensible to leave
// as a "balance" — the amount due upfront is the total, not the deposit.
export function effectiveDepositGBP(totalCostGBP: number, depositAmountGBP: number): number {
  return Math.min(depositAmountGBP, totalCostGBP)
}

export function passportNeedsRenewal(expiryISO: string): boolean {
  return expiryISO < PASSPORT_VALIDITY_CUTOFF
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function isValidEmail(s: string): boolean {
  return EMAIL_RE.test(s) && s.length <= 254
}

// Reject silly DOBs. The previous floor of 1900-01-01 admitted ages up to
// ~125, which is implausible for a passenger and a useful canary that the
// form is being scripted.
export const MAX_AGE_YEARS = 120

export function ageInYears(dob: string, referenceISO: string): number {
  const [y, m, d] = dob.split('-').map(Number)
  const [ry, rm, rd] = referenceISO.split('-').map(Number)
  let age = ry - y
  if (rm < m || (rm === m && rd < d)) age -= 1
  return age
}

export function isValidDateOfBirth(dob: string, todayISO: string): boolean {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false
  if (dob >= todayISO) return false
  const age = ageInYears(dob, todayISO)
  return age >= 0 && age <= MAX_AGE_YEARS
}

// Admin-only age banding, separate from the customer-facing person_type
// (adult/infant) they self-select at booking time for bed/pricing purposes —
// this is purely a DOB-derived insight for trip planning (meals, seating,
// documentation), computed as of the tour's departure date since that's the
// age that actually matters for the trip, not today's.
export type AgeGroup = 'infant' | 'youth' | 'adult'

export function ageGroup(dob: string, referenceISO: string): AgeGroup {
  const age = ageInYears(dob, referenceISO)
  if (age < 2) return 'infant'
  if (age < 15) return 'youth'
  return 'adult'
}

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Tours only have a slug in the database (e.g. "umrah-2026") — this turns
// that into a display label ("Umrah 2026") without needing a separate name
// column.
export function formatTourLabel(slug: string): string {
  return slug
    .split('-')
    .map(part => (/^\d+$/.test(part) ? part : cap(part)))
    .join(' ')
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
