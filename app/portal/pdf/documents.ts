import 'server-only'
import { supabaseAdmin } from '../../lib/supabase-admin'
import type { PortalSession } from '../../lib/portal-session'
import { getTravelDocumentSignedUrl } from '../../lib/travel-documents'
import { TRAVEL_DOC_TYPE_LABELS, type TravelDocType } from '../../lib/portal-content'
import type { AttachableDoc } from './catalogue'

type DocRow = {
  id: string
  passenger_id: string | null
  doc_type: TravelDocType
  label: string
  storage_path: string
  mime_type: string
}

// Same visibility rule as the Travel Documents tab: the lead passenger sees
// every document on the booking, everyone else only their own plus
// whole-booking documents.
export async function loadAttachableDocuments({ rid, pid, lead }: PortalSession): Promise<AttachableDoc[]> {
  const db = supabaseAdmin()

  let docsQuery = db
    .from('passenger_documents')
    .select('id, passenger_id, doc_type, label, storage_path, mime_type')
    .eq('reservation_id', rid)
  if (!lead) docsQuery = docsQuery.or(`passenger_id.is.null,passenger_id.eq.${pid}`)
  let paxQuery = db.from('reservation_passengers').select('id, given_names, surname').eq('reservation_id', rid)
  if (!lead) paxQuery = paxQuery.eq('id', pid)

  const [{ data: docs }, { data: passengers }] = await Promise.all([
    docsQuery.order('created_at', { ascending: true }),
    paxQuery.order('position', { ascending: true }),
  ])

  const names = new Map(
    ((passengers ?? []) as Array<{ id: string; given_names: string; surname: string }>).map(p => [
      p.id,
      `${p.given_names} ${p.surname}`,
    ]),
  )

  const rows = await Promise.all(
    ((docs ?? []) as DocRow[]).map(async d => {
      const url = await getTravelDocumentSignedUrl(d.storage_path)
      if (!url) return null
      return {
        id: d.id,
        label: d.label,
        typeLabel: TRAVEL_DOC_TYPE_LABELS[d.doc_type],
        person: d.passenger_id ? (names.get(d.passenger_id) ?? 'Passenger') : 'Whole Booking',
        mime: d.mime_type,
        url,
      } satisfies AttachableDoc
    }),
  )
  return rows.filter((r): r is AttachableDoc => r !== null)
}
