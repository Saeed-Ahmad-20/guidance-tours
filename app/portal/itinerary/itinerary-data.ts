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
  | { kind: 'check-in' | 'check-out'; time?: string; after?: PrayerName; hotel: string; city: string }
  | { kind: 'note'; time?: string; after?: PrayerName; title: string; detail?: string }
  | { kind: 'prayer'; time: string; name: string }

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
    breakfast: '6:30am to 10am',
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
    breakfast: '6:30am to 10am',
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
    title: 'Departure from Manchester',
    city: 'Travel',
    events: [
      { kind: 'note', time: '10:30', title: 'Meet at Manchester Airport' },
      { kind: 'note', time: '12:45', title: 'Gather at the gate', detail: 'Your pre-flight briefing takes place here.' },
      { kind: 'flight', time: '13:30', flight: OUT_1 },
      { kind: 'note', time: '21:50', title: 'Land in Cairo', detail: 'Connecting flight to Madinah.' },
    ],
  },
  {
    date: '2026-10-26',
    title: 'Arrival in Madinah & First Salaams',
    city: 'Madinah',
    stay: 'Elaf Taiba',
    events: [
      { kind: 'flight', time: '00:20', flight: OUT_2 },
      { kind: 'check-in', hotel: 'Elaf Taiba', city: 'Madinah' },
      { kind: 'note', time: '05:45', title: 'First salaams at Al-Masjid an-Nabawi', detail: 'Our first visit to the Prophet’s ﷺ mosque.' },
    ],
  },
  {
    date: '2026-10-27',
    title: 'Guided Tour of Masjid an-Nabawi',
    city: 'Madinah',
    stay: 'Elaf Taiba',
    events: [
      { kind: 'note', time: '16:00', title: 'Guided tour of Masjid an-Nabawi', detail: 'Learn the history of the mosque and its surroundings.' },
    ],
  },
  {
    date: '2026-10-28',
    title: 'Madinah Ziyarahs',
    city: 'Madinah',
    stay: 'Elaf Taiba',
    events: [
      {
        kind: 'note',
        time: '09:00',
        title: 'Coach tour of Madinah’s ziyarah sites',
        detail: 'See the Historical Sites tab for some of the places we visit.',
      },
    ],
  },
  {
    date: '2026-10-29',
    title: 'Masjids of Madinah & Date Farm Visit',
    city: 'Madinah',
    stay: 'Elaf Taiba',
    events: [
      {
        kind: 'note',
        time: '05:45',
        title: 'Tour of Madinah’s masjids',
        detail: 'Followed by an optional walk to Masjid Quba.',
      },
      { kind: 'note', time: '19:30', title: 'Date farm visit and gathering' },
    ],
  },
  {
    date: '2026-10-30',
    title: 'Jumu’ah in Madinah',
    city: 'Madinah',
    stay: 'Elaf Taiba',
    events: [
      { kind: 'note', title: 'Free time', detail: 'Pray, rest and explore at your own pace.' },
    ],
  },
  {
    date: '2026-10-31',
    title: 'Transfer to Makkah & First Umrah',
    city: 'Makkah',
    stay: 'The Address, Jabal Omar',
    events: [
      { kind: 'note', time: '10:00', title: 'Luggage ready for collection', detail: 'Please bring your bags down to the hotel lobby.' },
      { kind: 'check-out', hotel: 'Elaf Taiba', city: 'Madinah' },
      { kind: 'note', time: '11:30', title: 'Meet in the hotel lobby', detail: 'Transfer to Madinah train station.' },
      { kind: 'train', time: '12:50', title: 'High-Speed Train', detail: 'Madinah 12:50 → Makkah 15:05 · Economy' },
      { kind: 'note', time: '15:05', title: 'Arrive Makkah', detail: 'Train tickets are in the Travel Documents tab.' },
      { kind: 'check-in', hotel: 'The Address, Jabal Omar', city: 'Makkah' },
      { kind: 'note', title: 'Our first Umrah', detail: 'Time to be confirmed.' },
    ],
  },
  {
    date: '2026-11-01',
    title: 'Masjid al-Haram Tour & Ghar-e-Hira',
    city: 'Makkah',
    stay: 'The Address, Jabal Omar',
    events: [
      { kind: 'note', time: '05:45', title: 'Guided tour of Masjid al-Haram' },
      { kind: 'note', time: '19:45', title: 'Visit Jabal al-Nour and Ghar-e-Hira' },
    ],
  },
  {
    date: '2026-11-02',
    title: 'Makkah Ziyarahs & Second Umrah',
    city: 'Makkah',
    stay: 'The Address, Jabal Omar',
    events: [
      {
        kind: 'note',
        time: '09:00',
        title: 'Coach tour of Makkah’s ziyarah sites',
        detail: 'See the Historical Sites tab for some of the places we visit.',
      },
      { kind: 'note', time: '20:00', title: 'Our second Umrah' },
    ],
  },
  {
    date: '2026-11-03',
    title: 'Farewell Tawaf & Final Seerah Session',
    city: 'Makkah',
    stay: 'The Address, Jabal Omar',
    events: [
      { kind: 'note', title: 'Free time', detail: 'Pray, rest and make the most of your last day.' },
      { kind: 'note', title: 'Farewell Tawaf', detail: 'Time to be confirmed.' },
      { kind: 'check-out', after: 'Isha', hotel: 'The Address, Jabal Omar', city: 'Makkah' },
      { kind: 'note', time: '23:30', title: 'Meet at hotel reception', detail: 'Please be packed and ready to leave.' },
    ],
  },
  {
    date: '2026-11-04',
    title: 'Return Home',
    city: 'Travel',
    notes: 'Early start — the first flight leaves Jeddah at 05:40.',
    events: [
      { kind: 'flight', time: '05:40', flight: RET_1 },
      { kind: 'flight', time: '08:55', flight: RET_2 },
      { kind: 'note', time: '12:30', title: 'Arrive Manchester' },
    ],
  },
]

// ---- Prayer times and weather -------------------------------------------------

export const PRAYER_LABELS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
export type PrayerName = (typeof PRAYER_LABELS)[number]
export type PrayerTimes = Record<PrayerName, string>
export type PrayerCity = 'Madinah' | 'Makkah'

export const PRAYER_NOTE =
  'Prayer times follow the Umm al-Qura calendar used in Saudi Arabia, in local time. Masjid timetables can differ by a minute or two, so please follow the adhan.'

// Umm al-Qura timings (Asr by the standard method), local time (UTC+3), for the
// city you are in on each day. To change the dates, regenerate these rows.
const PRAYER_TIMES: Record<string, Partial<Record<PrayerCity, PrayerTimes>>> = {
  '2026-10-26': { Madinah: { Fajr: '05:06', Sunrise: '06:25', Dhuhr: '12:06', Asr: '15:21', Maghrib: '17:46', Isha: '19:16' } },
  '2026-10-27': { Madinah: { Fajr: '05:06', Sunrise: '06:25', Dhuhr: '12:05', Asr: '15:21', Maghrib: '17:45', Isha: '19:15' } },
  '2026-10-28': { Madinah: { Fajr: '05:07', Sunrise: '06:26', Dhuhr: '12:05', Asr: '15:20', Maghrib: '17:44', Isha: '19:14' } },
  '2026-10-29': { Madinah: { Fajr: '05:07', Sunrise: '06:26', Dhuhr: '12:05', Asr: '15:20', Maghrib: '17:44', Isha: '19:14' } },
  '2026-10-30': { Madinah: { Fajr: '05:08', Sunrise: '06:27', Dhuhr: '12:05', Asr: '15:19', Maghrib: '17:43', Isha: '19:13' } },
  '2026-10-31': { Madinah: { Fajr: '05:08', Sunrise: '06:28', Dhuhr: '12:05', Asr: '15:19', Maghrib: '17:42', Isha: '19:12' }, Makkah: { Fajr: '05:06', Sunrise: '06:23', Dhuhr: '12:04', Asr: '15:21', Maghrib: '17:45', Isha: '19:15' } },
  '2026-11-01': { Makkah: { Fajr: '05:06', Sunrise: '06:24', Dhuhr: '12:04', Asr: '15:20', Maghrib: '17:45', Isha: '19:15' } },
  '2026-11-02': { Makkah: { Fajr: '05:06', Sunrise: '06:24', Dhuhr: '12:04', Asr: '15:20', Maghrib: '17:44', Isha: '19:14' } },
  '2026-11-03': { Makkah: { Fajr: '05:07', Sunrise: '06:25', Dhuhr: '12:04', Asr: '15:20', Maghrib: '17:44', Isha: '19:14' } },
}

export function prayersForDay(date: string): { city: PrayerCity; times: PrayerTimes }[] {
  const day = PRAYER_TIMES[date] ?? {}
  return (Object.keys(day) as PrayerCity[]).map(city => ({ city, times: day[city]! }))
}

const DAILY_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

// A day's events with the five daily prayers placed among them in time order. An event with no
// time of its own stays with the event before it. On a day that changes city, prayers before the
// train use the first city's times and the rest use the second's.
export function eventsWithPrayers(day: ItineraryDay): ItineraryEvent[] {
  const cities = prayersForDay(day.date)
  if (cities.length === 0) return day.events
  const switchAt = day.events.find(e => e.kind === 'train')?.time ?? '12:00'
  const pending = DAILY_PRAYERS.map(key => {
    const source = cities.length > 1 && cities[0].times[key] >= switchAt ? cities[1] : cities[0]
    // Jumu’ah takes the place of Dhuhr on a Friday.
    const friday = new Date(`${day.date}T00:00:00Z`).getUTCDay() === 5
    return { key, event: { kind: 'prayer' as const, name: friday && key === 'Dhuhr' ? 'Jumu’ah' : key, time: source.times[key] } }
  }).sort((a, b) => a.event.time.localeCompare(b.event.time))

  // Events marked `after` wait until that prayer has been placed.
  const held = (key: string) => day.events.filter(e => 'after' in e && e.after === key)
  const out: ItineraryEvent[] = []
  const flush = (upTo?: string) => {
    while (pending.length && (!upTo || pending[0].event.time <= upTo)) {
      const next = pending.shift()!
      out.push(next.event, ...held(next.key))
    }
  }
  for (const e of day.events) {
    if ('after' in e && e.after) continue
    if ('time' in e && e.time) flush(e.time)
    out.push(e)
  }
  flush()
  return out
}

// Typical conditions for 25 Oct - 4 Nov, averaged over the last ten years.
export const WEATHER_NOTE =
  'Typical conditions for 25 October to 4 November, averaged over the last ten years. Check the forecast a few days before you fly.'

export const WEATHER: Record<PrayerCity, { day: string; night: string; summary: string; rain: string }> = {
  Madinah: {
    day: '34°C',
    night: '20°C',
    summary: 'Warm, dry days with pleasant evenings, and cooler mornings around Fajr. Humidity is low, around 35%.',
    rain: 'Rain is uncommon, on about 1 day in 15, but a shower can occasionally be heavy.',
  },
  Makkah: {
    day: '35°C',
    night: '24°C',
    summary: 'Hot and more humid, around 50%, with warm nights. Highs can reach 38°C.',
    rain: 'Rain falls on about 1 day in 8, usually as a short shower or thunderstorm.',
  },
}
