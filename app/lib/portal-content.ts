export const TRAVEL_DOC_TYPES = ['flight_ticket', 'train_ticket', 'e_visa', 'other'] as const
export type TravelDocType = (typeof TRAVEL_DOC_TYPES)[number]

export const TRAVEL_DOC_TYPE_LABELS: Record<TravelDocType, string> = {
  flight_ticket: 'Flight ticket',
  train_ticket: 'Train ticket',
  e_visa: 'E-visa',
  other: 'Other document',
}

export function isTravelDocType(v: unknown): v is TravelDocType {
  return typeof v === 'string' && (TRAVEL_DOC_TYPES as readonly string[]).includes(v)
}

export const TRAVEL_DOC_MIME_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
export const MAX_TRAVEL_DOC_BYTES = 10 * 1024 * 1024

// Returns an embeddable player URL for YouTube / Vimeo links, or null when the
// link should just open in a new tab (Zoom recordings, Google Drive, etc.).
export function webinarEmbedUrl(raw: string): string | null {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  const host = u.hostname.replace(/^www\.|^m\./, '')
  const idOk = (id: string | null | undefined) => (id && /^[\w-]{6,20}$/.test(id) ? id : null)

  if (host === 'youtu.be') {
    const id = idOk(u.pathname.slice(1))
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }
  if (host === 'youtube.com') {
    const [, first, second] = u.pathname.split('/')
    const id =
      first === 'watch'
        ? idOk(u.searchParams.get('v'))
        : first === 'embed' || first === 'live' || first === 'shorts'
          ? idOk(second)
          : null
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }
  if (host === 'vimeo.com') {
    const [, id, hash] = u.pathname.split('/')
    if (!/^\d+$/.test(id ?? '')) return null
    return `https://player.vimeo.com/video/${id}${hash && /^[a-f0-9]+$/i.test(hash) ? `?h=${hash}` : ''}`
  }
  return null
}
