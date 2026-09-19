import type { AgeGroup, RoomType } from './booking'

// Pure calculation helpers only — no server-only imports — so this module
// can be shared between the client-side breakdown table and the server-side
// Excel export route without either one pulling in the Supabase admin client.

export type FinanceStatus = 'pending_payment' | 'transfer_submitted' | 'confirmed'

export type FinanceRow = {
  id: string
  reservationId: string
  reservationCode: string
  leadName: string
  name: string
  personType: 'adult' | 'infant'
  ageGroup: AgeGroup
  roomType: RoomType
  status: FinanceStatus
  reservationCreatedAt: string
  position: number
  amountCharged: number
}

export type Assumptions = {
  adultTier1Count: number
  adultTier1Price: number
  adultTier2Price: number
  youthFlightPrice: number
  infantFlightPrice: number
  groundDouble: number
  groundTriple: number
  groundQuad: number
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  adultTier1Count: 30,
  adultTier1Price: 835,
  adultTier2Price: 940,
  youthFlightPrice: 860,
  infantFlightPrice: 0,
  groundDouble: 803,
  groundTriple: 651,
  groundQuad: 574,
}

export type ComputedFinanceRow = FinanceRow & {
  flightCost: number
  flightTierLabel: string
  groundCost: number
  actualCost: number
  margin: number
}

const GROUND_COST_KEY: Record<RoomType, keyof Assumptions> = {
  double: 'groundDouble',
  triple: 'groundTriple',
  quad: 'groundQuad',
}

// Flight tiers are assigned in booking order (reservation created_at, then
// passenger position) since there's no stored field for which actual flight
// booking batch a passenger was ticketed on — the first `adultTier1Count`
// adults booked get the first rate, every adult after that gets the second.
// This is an assumption the admin can correct by adjusting the count/prices.
export function computeFinanceRows(rows: FinanceRow[], a: Assumptions): ComputedFinanceRow[] {
  const ordered = [...rows].sort((x, y) => {
    if (x.reservationCreatedAt !== y.reservationCreatedAt) {
      return x.reservationCreatedAt < y.reservationCreatedAt ? -1 : 1
    }
    return x.position - y.position
  })

  let adultsSeen = 0
  return ordered.map(r => {
    let flightCost: number
    let flightTierLabel: string
    if (r.ageGroup === 'adult') {
      adultsSeen += 1
      const isTier1 = adultsSeen <= a.adultTier1Count
      flightCost = isTier1 ? a.adultTier1Price : a.adultTier2Price
      flightTierLabel = isTier1 ? `Adult (first ${a.adultTier1Count})` : 'Adult (additional)'
    } else if (r.ageGroup === 'youth') {
      flightCost = a.youthFlightPrice
      flightTierLabel = 'Youth'
    } else {
      flightCost = a.infantFlightPrice
      flightTierLabel = 'Infant'
    }
    const groundCost = a[GROUND_COST_KEY[r.roomType]]
    const actualCost = flightCost + groundCost
    const margin = Math.round((r.amountCharged - actualCost) * 100) / 100
    return { ...r, flightCost, flightTierLabel, groundCost, actualCost, margin }
  })
}

const ASSUMPTION_KEYS = [
  'adultTier1Count',
  'adultTier1Price',
  'adultTier2Price',
  'youthFlightPrice',
  'infantFlightPrice',
  'groundDouble',
  'groundTriple',
  'groundQuad',
] as const satisfies readonly (keyof Assumptions)[]

export function assumptionsToQuery(a: Assumptions): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of ASSUMPTION_KEYS) params.set(key, String(a[key]))
  return params
}

export function assumptionsFromQuery(params: URLSearchParams): Assumptions {
  const result = { ...DEFAULT_ASSUMPTIONS }
  for (const key of ASSUMPTION_KEYS) {
    const raw = params.get(key)
    if (raw === null) continue
    const n = Number(raw)
    if (Number.isFinite(n) && n >= 0) result[key] = n
  }
  return result
}

export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  infant: 'Infant (0–2)',
  youth: 'Youth (2–15)',
  adult: 'Adult (15+)',
}

export const STATUS_LABEL: Record<FinanceStatus, string> = {
  pending_payment: 'Awaiting transfer',
  transfer_submitted: 'Awaiting confirmation',
  confirmed: 'Confirmed',
}
