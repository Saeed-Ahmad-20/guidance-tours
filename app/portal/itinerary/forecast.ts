// Daily forecast for Madinah and Makkah from Open-Meteo (free, no key). The response is cached
// for 12 hours, so the page refreshes the forecast at most twice a day. Open-Meteo forecasts
// about 16 days ahead, so days further out simply have no forecast yet.

import type { PrayerCity } from './itinerary-data'

export type PeriodForecast = { temp: number; rainChance: number; summary: string; icon: string }
export type DayForecast = { day: PeriodForecast; night: PeriodForecast }

const COORDS: Record<PrayerCity, { lat: number; lon: number }> = {
  Madinah: { lat: 24.4672, lon: 39.6111 },
  Makkah: { lat: 21.4225, lon: 39.8262 },
}

const REVALIDATE_SECONDS = 12 * 60 * 60

// WMO weather codes, grouped.
function describe(code: number): { summary: string; icon: string } {
  if (code === 0) return { summary: 'Clear skies', icon: '☀️' }
  if (code <= 2) return { summary: 'Mostly sunny', icon: '🌤️' }
  if (code === 3) return { summary: 'Cloudy', icon: '☁️' }
  if (code === 45 || code === 48) return { summary: 'Foggy', icon: '🌫️' }
  if (code >= 51 && code <= 57) return { summary: 'Light drizzle', icon: '🌦️' }
  if (code >= 61 && code <= 67) return { summary: 'Rain', icon: '🌧️' }
  if (code >= 80 && code <= 82) return { summary: 'Showers', icon: '🌦️' }
  if (code >= 95) return { summary: 'Thunderstorms', icon: '⛈️' }
  return { summary: 'Mixed conditions', icon: '🌤️' }
}

// Daytime is 06:00 to 17:59 and night is 18:00 to 05:59 (the evening and the early hours of the same date).
const isDay = (hour: number) => hour >= 6 && hour < 18

type Hour = { temp: number; rain: number; code: number }

// Daytime uses the warmest hour and night the coolest. The weather shown is the worst code of the period.
function period(hours: Hour[], pick: 'max' | 'min'): PeriodForecast | null {
  if (hours.length === 0) return null
  const temps = hours.map(h => h.temp)
  const temp = pick === 'max' ? Math.max(...temps) : Math.min(...temps)
  const code = Math.max(...hours.map(h => h.code)) // higher WMO codes are the wetter, stormier ones
  return {
    temp: Math.round(temp),
    rainChance: Math.round(Math.max(...hours.map(h => h.rain))),
    ...describe(code),
  }
}

type CityForecast = { days: Record<string, DayForecast>; fetchedAt: string | null }

async function cityForecast(city: PrayerCity, from: string, to: string): Promise<CityForecast> {
  const { lat, lon } = COORDS[city]
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=weather_code,temperature_2m,precipitation_probability` +
    `&timezone=Asia%2FRiyadh&start_date=${from}&end_date=${to}`
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
    if (!res.ok) return { days: {}, fetchedAt: null }
    // The response keeps the time it was first fetched, so it shows when the cached forecast was made.
    const date = res.headers.get('date')
    const fetchedAt = date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : null
    const h = (await res.json()).hourly as {
      time: string[]
      weather_code: (number | null)[]
      temperature_2m: (number | null)[]
      precipitation_probability: (number | null)[]
    }
    const byDate: Record<string, { day: Hour[]; night: Hour[] }> = {}
    h.time.forEach((t, i) => {
      const temp = h.temperature_2m[i]
      const code = h.weather_code[i]
      if (temp == null || code == null) return
      const [date, clock] = t.split('T')
      const entry = (byDate[date] ??= { day: [], night: [] })
      entry[isDay(Number(clock.slice(0, 2))) ? 'day' : 'night'].push({ temp, code, rain: h.precipitation_probability[i] ?? 0 })
    })
    const out: Record<string, DayForecast> = {}
    for (const [date, { day, night }] of Object.entries(byDate)) {
      const d = period(day, 'max')
      const n = period(night, 'min')
      if (d && n) out[date] = { day: d, night: n }
    }
    return { days: out, fetchedAt }
  } catch {
    return { days: {}, fetchedAt: null }
  }
}

export type Forecasts = {
  byCity: Record<PrayerCity, Record<string, DayForecast>>
  updatedAt: string | null // when the forecast was last fetched (ISO)
}

export async function loadForecasts(from: string, to: string): Promise<Forecasts> {
  const [madinah, makkah] = await Promise.all([cityForecast('Madinah', from, to), cityForecast('Makkah', from, to)])
  const times = [madinah.fetchedAt, makkah.fetchedAt].filter((t): t is string => Boolean(t)).sort()
  return { byCity: { Madinah: madinah.days, Makkah: makkah.days }, updatedAt: times[0] ?? null }
}

// For example "23 Oct 2026, 14:05 UK time".
export function formatUpdated(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })
  return `${date}, ${time} UK time`
}
