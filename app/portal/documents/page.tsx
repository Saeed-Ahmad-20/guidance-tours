import { supabaseAdmin } from '../../lib/supabase-admin'
import { requirePortalSession } from '../../lib/portal-session'
import { getTravelDocumentSignedUrl } from '../../lib/travel-documents'
import { TRAVEL_DOC_TYPE_LABELS, type TravelDocType } from '../../lib/portal-content'

export const dynamic = 'force-dynamic'

type DocRow = {
  id: string
  passenger_id: string | null
  doc_type: TravelDocType
  label: string
  storage_path: string
  mime_type: string
  created_at: string
}

export default async function PortalDocumentsPage() {
  const { rid, pid, lead } = await requirePortalSession()
  const db = supabaseAdmin()

  // The lead passenger sees every document on the booking; everyone else
  // sees only their own plus whole-booking documents.
  let docsQuery = db
    .from('passenger_documents')
    .select('id, passenger_id, doc_type, label, storage_path, mime_type, created_at')
    .eq('reservation_id', rid)
  if (!lead) docsQuery = docsQuery.or(`passenger_id.is.null,passenger_id.eq.${pid}`)
  let paxQuery = db
    .from('reservation_passengers')
    .select('id, given_names, surname')
    .eq('reservation_id', rid)
  if (!lead) paxQuery = paxQuery.eq('id', pid)

  const [{ data: docs }, { data: passengers }] = await Promise.all([
    docsQuery.order('created_at', { ascending: true }),
    paxQuery.order('position', { ascending: true }),
  ])

  const rows = await Promise.all(
    ((docs ?? []) as DocRow[]).map(async d => ({
      ...d,
      url: await getTravelDocumentSignedUrl(d.storage_path),
    }))
  )
  const people = (passengers ?? []) as Array<{ id: string; given_names: string; surname: string }>

  const groups = [
    { key: 'booking', title: 'Whole booking', docs: rows.filter(d => !d.passenger_id) },
    ...people.map(p => ({
      key: p.id,
      title: `${p.given_names} ${p.surname}`,
      docs: rows.filter(d => d.passenger_id === p.id),
    })),
  ].filter(g => g.docs.length > 0)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-stone-900">Travel documents</h1>
      <p className="text-sm text-stone-500 mt-1 mb-6">
        Your flight tickets, train tickets and e-visas appear here as soon as our team issues them.
      </p>

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
          <p className="font-semibold text-stone-900">Nothing here yet</p>
          <p className="text-sm text-stone-500 mt-1">
            We&apos;ll upload your tickets and e-visas closer to departure. We&apos;ll let you know
            when they&apos;re ready.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(g => (
            <section key={g.key} className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6">
              <h2 className="font-semibold text-stone-900 mb-3">{g.title}</h2>
              <ul className="divide-y divide-stone-100">
                {g.docs.map(d => (
                  <li key={d.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="text-stone-900 truncate">{d.label}</p>
                      <p className="text-xs text-stone-500">
                        {TRAVEL_DOC_TYPE_LABELS[d.doc_type]} ·{' '}
                        {d.mime_type === 'application/pdf' ? 'PDF' : 'Image'}
                      </p>
                    </div>
                    {d.url ? (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center px-4 py-2 rounded-full bg-[#C4A348] text-white font-semibold text-xs hover:bg-[#b2932e] transition"
                      >
                        Open ↗
                      </a>
                    ) : (
                      <span className="shrink-0 text-xs text-stone-400">Unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
