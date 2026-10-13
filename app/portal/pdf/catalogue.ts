// Turns the portal's content (itinerary, historical sites, Haramayn) into plain, serialisable items that the PDF page lets
// people pick from and turn into a PDF. Built on the server so the content only
// reaches signed-in passengers.

import { HARAMAYN } from '../haramayn/haramayn-data'
import {
  AIRLINE,
  BAGGAGE,
  FLIGHTS,
  HOTELS,
  ITINERARY,
  PRAYER_LABELS,
  PRAYER_NOTE,
  WEATHER,
  WEATHER_NOTE,
  hotelMapUrl,
  prayersForDay,
  type Flight,
  type ItineraryEvent,
} from '../itinerary/itinerary-data'
import { SITES, siteMapUrl } from '../historical-sites/sites-data'
import { BELOVEDS_HOME } from '../beloveds-home/beloveds-home-data'
import { DUAS } from '../duas/duas-data'
import { UMRAH_GUIDE, type UmrahPart } from '../umrah-guide/umrah-guide-data'
import type { TravelDocType } from '../../lib/portal-content'

// `tag` lets the PDF options switch whole kinds of content on and off.
export type PdfBlock =
  | { t: 'h'; text: string }
  | { t: 'lead'; text: string }
  | { t: 'p'; text: string }
  | { t: 'bullets'; items: string[]; tag?: 'keypoints' }
  | { t: 'link'; label: string; url: string; tag?: 'map' }
  | { t: 'img'; src: string; caption: string }
  | { t: 'ar'; text: string } // Arabic, drawn as an image since the PDF fonts can't shape it

export type PdfImage = { src: string; credit: string }

export type CatalogueItem = {
  id: string
  title: string
  note?: string // short helper text shown in the picker
  year?: string
  image?: PdfImage
  // Haramayn topics are printed under their section heading.
  section?: { id: string; title: string; intro: string; image?: PdfImage }
  blocks: PdfBlock[]
}

export type CatalogueGroup = {
  id: string
  title: string
  description?: string
  items: CatalogueItem[]
}

const flightLine = (f: Flight) =>
  `${f.number}: ${f.from.city} (${f.from.code}) to ${f.to.city} (${f.to.code}), departs ${f.from.time}, arrives ${f.to.time}, ${f.from.date}`

function eventLine(e: ItineraryEvent): string {
  const time = 'time' in e && e.time ? `${e.time}  ` : ''
  switch (e.kind) {
    case 'flight':
      return `${time}${flightLine(e.flight)}`.replace(/, (Sun|Mon|Tue|Wed|Thu|Fri|Sat) \d+ \w+$/, '')
    case 'train':
      return `${time}${e.title}${e.detail ? `: ${e.detail}` : ''}`
    case 'check-in':
      return `${time}Check in: ${e.hotel}, ${e.city}`
    case 'check-out':
      return `${time}Check out: ${e.hotel}, ${e.city}`
    default:
      return `${time}${e.title}${e.detail ? `: ${e.detail}` : ''}`
  }
}

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

function tripGroup(): CatalogueGroup {
  return {
    id: 'trip',
    title: 'Your Trip',
    description: 'Flights, hotels and the day-by-day plan.',
    items: [
      {
        id: 'trip-flights',
        title: 'Flights and Baggage',
        note: `${AIRLINE} · outbound and return`,
        blocks: [
          { t: 'h', text: 'Outbound' },
          { t: 'bullets', items: FLIGHTS.outbound.map(flightLine) },
          { t: 'h', text: 'Return' },
          { t: 'bullets', items: FLIGHTS.inbound.map(flightLine) },
          {
            t: 'p',
            text: `Airline: ${AIRLINE}. Baggage (included): ${BAGGAGE.hold} hold and ${BAGGAGE.cabin} cabin.`,
          },
        ],
      },
      {
        id: 'trip-hotels',
        title: 'Hotels',
        note: HOTELS.map(h => h.name).join(' · '),
        blocks: HOTELS.flatMap<PdfBlock>(h => [
          { t: 'h', text: `${h.city}: ${h.name}` },
          { t: 'p', text: `${h.from} to ${h.to} · ${h.nights} nights · ${h.extras}` },
          { t: 'link', label: 'Hotel website', url: h.website },
          { t: 'link', label: 'View on Google Maps', url: hotelMapUrl(h.mapQuery), tag: 'map' },
        ]),
      },
      {
        id: 'trip-weather',
        title: 'Weather in Madinah and Makkah',
        note: 'What to expect',
        blocks: [
          ...(Object.keys(WEATHER) as (keyof typeof WEATHER)[]).flatMap<PdfBlock>(city => [
            { t: 'h', text: city },
            {
              t: 'bullets',
              items: [
                `Typical daytime high ${WEATHER[city].day}, night low ${WEATHER[city].night}`,
                WEATHER[city].summary,
                WEATHER[city].rain,
              ],
            },
          ]),
          { t: 'p', text: WEATHER_NOTE },
        ],
      },
      {
        id: 'trip-days',
        title: 'Day-by-Day Itinerary',
        note: `${ITINERARY.length} days, with prayer times`,
        blocks: [
          { t: 'p', text: PRAYER_NOTE },
          ...ITINERARY.flatMap<PdfBlock>((d, i) => [
            { t: 'h', text: `Day ${i + 1} · ${dayLabel(d.date)} · ${d.title}` },
            ...(d.notes ? [{ t: 'p', text: d.notes } as PdfBlock] : []),
            ...(d.events.length ? [{ t: 'bullets', items: d.events.map(eventLine) } as PdfBlock] : []),
            ...prayersForDay(d.date).map<PdfBlock>(({ city, times }) => ({
              t: 'p',
              text: `Prayer times, ${city}: ${PRAYER_LABELS.map(n => `${n} ${times[n]}`).join(' · ')}`,
            })),
          ]),
        ],
      },
    ],
  }
}

function sitesGroups(): CatalogueGroup[] {
  return SITES.map(({ city, intro, sites }) => ({
    id: `sites-${city.toLowerCase()}`,
    title: `Historical Sites: ${city}`,
    description: intro,
    items: sites.map((s, i) => ({
      id: `sites-${city.toLowerCase()}-${i}`,
      title: s.name,
      note: s.summary,
      year: s.year,
      image: s.image && { src: s.image.src, credit: `${s.image.credit} via Wikimedia Commons` },
      blocks: [
        { t: 'lead', text: s.summary },
        { t: 'h', text: 'History' },
        ...s.history.map<PdfBlock>(text => ({ t: 'p', text })),
        { t: 'h', text: 'Key Points' },
        { t: 'bullets', items: s.keyFacts, tag: 'keypoints' },
        { t: 'link', label: 'Open in Google Maps', url: siteMapUrl(s.mapQuery), tag: 'map' },
      ],
    })),
  }))
}

function haramaynGroups(): CatalogueGroup[] {
  // Madinah's sections first, to match the trip.
  const ordered = [...HARAMAYN].sort((a, b) => (a.city === b.city ? 0 : a.city === 'Madinah' ? -1 : 1))
  return ordered.map(section => ({
    id: `haramayn-${section.id}`,
    title: `The Haramayn: ${section.title}`,
    description: section.intro,
    items: section.topics.map((topic, i) => ({
      id: `haramayn-${section.id}-${i}`,
      title: topic.heading,
      section: {
        id: section.id,
        title: section.title,
        intro: section.intro,
        image: { src: section.image.src, credit: `${section.image.credit} via Wikimedia Commons` },
      },
      blocks: topic.paragraphs.map<PdfBlock>(text => ({ t: 'p', text })),
    })),
  }))
}

function duaGroup(): CatalogueGroup {
  return {
    id: 'duas',
    title: 'Duas for Your Journey',
    description: 'Du’as for Makkah and Madinah, and when to read each one.',
    items: DUAS.map(section => ({
      id: `duas-${section.id}`,
      title: section.title,
      section: { id: section.id, title: section.title, intro: section.blurb },
      blocks: [
        ...(section.duas ?? []).flatMap<PdfBlock>(d => [
          { t: 'h', text: d.label },
          { t: 'p', text: `When and why: ${d.when}` },
          { t: 'ar', text: d.arabic },
          { t: 'p', text: d.transliteration },
          { t: 'p', text: d.translation },
        ]),
        ...(section.bullets ? [{ t: 'bullets', items: section.bullets } as PdfBlock] : []),
      ],
    })),
  }
}

function guideGroups(parts: UmrahPart[], prefix: string, label: string): CatalogueGroup[] {
  return parts.map(part => ({
    id: `${prefix}-${part.id}`,
    title: `${label}: ${part.title}`,
    description: part.blurb,
    items: part.steps.map((step, i) => ({
      id: `${prefix}-${part.id}-${i}`,
      title: step.heading,
      section: { id: part.id, title: part.title, intro: part.blurb },
      blocks: [
        ...(step.images ?? []).map<PdfBlock>(i => ({ t: 'img', src: i.src, caption: i.credit ? `${i.alt} (${i.credit})` : i.alt })),
        ...(step.paragraphs ?? []).map<PdfBlock>(text => ({ t: 'p', text })),
        ...(step.bullets ? [{ t: 'bullets', items: step.bullets } as PdfBlock] : []),
        ...(step.duas ?? []).flatMap<PdfBlock>(d => [
          { t: 'h', text: d.label },
          { t: 'ar', text: d.arabic },
          { t: 'p', text: d.transliteration },
          { t: 'p', text: d.translation },
        ]),
      ],
    })),
  }))
}

export function buildCatalogue(): CatalogueGroup[] {
  return [
    // In the order of the trip: Madinah first, then Makkah.
    tripGroup(),
    ...guideGroups(BELOVEDS_HOME, 'beloved', 'The Beloved’s Home'),
    ...guideGroups(UMRAH_GUIDE, 'umrah', 'Umrah Guide'),
    duaGroup(),
    ...haramaynGroups(),
    ...sitesGroups(),
  ]
}

// A travel document the signed-in passenger may attach to their PDF. The url is
// a short-lived signed link, fetched by the browser when the PDF is made.
export type AttachableDoc = {
  id: string
  type: TravelDocType
  label: string
  typeLabel: string
  person: string
  mime: string
  url: string
}
