// October Umrah 2026 itinerary. To add depth to a day, add entries to its
// `events` (and optionally a `notes` paragraph) — the page renders whatever
// is here.

export type Flight = {
  number: string
  from: { code: string; city: string; time: string; date: string }
  to: { code: string; city: string; time: string; date: string }
}

export type ItineraryEvent =
  | { kind: 'flight'; time: string; flight: Flight }
  | { kind: 'train'; time: string; title: string; detail?: string }
  | { kind: 'check-in' | 'check-out'; time?: string; hotel: string; city: string }
  | { kind: 'note'; time?: string; title: string; detail?: string }

export type ItineraryDay = {
  date: string // YYYY-MM-DD
  title: string
  city: 'Travel' | 'Madinah' | 'Makkah'
  stay?: string
  notes?: string
  events: ItineraryEvent[]
}

export const AIRLINE = 'EgyptAir'

export const BAGGAGE = { hold: '2 × 23kg', cabin: '7kg' }

export const HOTELS = [
  {
    city: 'Madinah',
    name: 'Elaf Taiba',
    from: 'Sun 26 Oct',
    to: 'Sat 31 Oct',
    nights: 6,
    extras: 'Breakfast included',
    website: 'https://www.elafhotels.com/elaf-taiba',
    mapQuery: 'Elaf Taiba Hotel Madinah',
  },
  {
    city: 'Makkah',
    name: 'The Address, Jabal Omar',
    from: 'Sat 31 Oct',
    to: 'Wed 4 Nov',
    nights: 4,
    extras: 'Breakfast included',
    website: 'https://www.addresshotels.com/en/hotels/address-jabal-omar-makkah/',
    mapQuery: 'Address Jabal Omar Makkah',
  },
]

export const hotelMapUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const hotelByName = (name: string) => HOTELS.find(h => h.name === name)

const OUT_1: Flight = {
  number: 'MS782',
  from: { code: 'MAN', city: 'Manchester', time: '13:30', date: 'Sun 25 Oct' },
  to: { code: 'CAI', city: 'Cairo', time: '21:50', date: 'Sun 25 Oct' },
}
const OUT_2: Flight = {
  number: 'MS675',
  from: { code: 'CAI', city: 'Cairo', time: '00:20', date: 'Mon 26 Oct' },
  to: { code: 'MED', city: 'Madinah', time: '02:15', date: 'Mon 26 Oct' },
}
const RET_1: Flight = {
  number: 'MS674',
  from: { code: 'JED', city: 'Jeddah', time: '05:40', date: 'Wed 4 Nov' },
  to: { code: 'CAI', city: 'Cairo', time: '07:00', date: 'Wed 4 Nov' },
}
const RET_2: Flight = {
  number: 'MS781',
  from: { code: 'CAI', city: 'Cairo', time: '08:55', date: 'Wed 4 Nov' },
  to: { code: 'MAN', city: 'Manchester', time: '12:30', date: 'Wed 4 Nov' },
}

export const FLIGHTS = { outbound: [OUT_1, OUT_2], inbound: [RET_1, RET_2] }

export const ITINERARY: ItineraryDay[] = [
  {
    date: '2026-10-25',
    title: 'Depart Manchester',
    city: 'Travel',
    events: [
      { kind: 'flight', time: '13:30', flight: OUT_1 },
      { kind: 'note', time: '21:50', title: 'Arrive Cairo — connect to Madinah' },
    ],
  },
  {
    date: '2026-10-26',
    title: 'Arrive in Madinah',
    city: 'Madinah',
    stay: 'Elaf Taiba',
    events: [
      { kind: 'flight', time: '00:20', flight: OUT_2 },
      { kind: 'check-in', hotel: 'Elaf Taiba', city: 'Madinah' },
    ],
  },
  { date: '2026-10-27', title: 'Madinah', city: 'Madinah', stay: 'Elaf Taiba', events: [] },
  { date: '2026-10-28', title: 'Madinah', city: 'Madinah', stay: 'Elaf Taiba', events: [] },
  { date: '2026-10-29', title: 'Madinah', city: 'Madinah', stay: 'Elaf Taiba', events: [] },
  { date: '2026-10-30', title: 'Madinah', city: 'Madinah', stay: 'Elaf Taiba', events: [] },
  {
    date: '2026-10-31',
    title: 'Madinah to Makkah',
    city: 'Makkah',
    stay: 'The Address, Jabal Omar',
    events: [
      { kind: 'check-out', hotel: 'Elaf Taiba', city: 'Madinah' },
      { kind: 'train', time: '12:50', title: 'High-speed train', detail: 'Madinah → Makkah' },
      { kind: 'check-in', hotel: 'The Address, Jabal Omar', city: 'Makkah' },
    ],
  },
  { date: '2026-11-01', title: 'Makkah', city: 'Makkah', stay: 'The Address, Jabal Omar', events: [] },
  { date: '2026-11-02', title: 'Makkah', city: 'Makkah', stay: 'The Address, Jabal Omar', events: [] },
  { date: '2026-11-03', title: 'Makkah', city: 'Makkah', stay: 'The Address, Jabal Omar', events: [] },
  {
    date: '2026-11-04',
    title: 'Return home',
    city: 'Travel',
    notes: 'Early start — the first flight leaves Jeddah at 05:40.',
    events: [
      { kind: 'check-out', hotel: 'The Address, Jabal Omar', city: 'Makkah' },
      { kind: 'flight', time: '05:40', flight: RET_1 },
      { kind: 'flight', time: '08:55', flight: RET_2 },
      { kind: 'note', time: '12:30', title: 'Arrive Manchester' },
    ],
  },
]
