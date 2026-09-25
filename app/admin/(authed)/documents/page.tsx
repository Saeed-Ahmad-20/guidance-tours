import Link from 'next/link'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { getTravelDocumentSignedUrl } from '../../../lib/travel-documents'

export const dynamic = 'force-dynamic'

type Pax = { id: string; reservation_id: string; given_names: string; surname: string; position: number }
type Doc = { id: string; passenger_id: string | null; doc_type: string; storage_path: string }

export default async function AdminDocumentsOverview() {
  const db = supabaseAdmin()
  const { data: res } = await db
    .from('reservations')
    .select('id, reservation_code, lead_surname')
    .in('status', ['pending_payment', 'transfer_submitted', 'confirmed'])
    .order('lead_surname', { ascending: true })
  const reservations = (res ?? []) as Array<{ id: string; reservation_code: string; lead_surname: string }>
  const ids = reservations.map(r => r.id)

  const [{ data: pax }, { data: docs }] = await Promise.all([
    db.from('reservation_passengers').select('id, reservation_id, given_names, surname, position').in('reservation_id', ids),
    db.from('passenger_documents').select('id, passenger_id, doc_type, storage_path').in('reservation_id', ids),
  ])
  const docRows = await Promise.all(
    ((docs ?? []) as Doc[]).map(async d => ({ ...d, url: await getTravelDocumentSignedUrl(d.storage_path) }))
  )
  const docsFor = (pid: string, type: string) => docRows.filter(d => d.passenger_id === pid && d.doc_type === type)

  const rows = reservations.flatMap(r =>
    ((pax ?? []) as Pax[])
      .filter(p => p.reservation_id === r.id)
      .sort((a, b) => a.position - b.position)
      .map(p => ({ r, p, flight: docsFor(p.id, 'flight_ticket'), visa: docsFor(p.id, 'e_visa') }))
  )
  const complete = rows.filter(x => x.flight.length > 0 && x.visa.length > 0).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Travel documents</h1>
        <p className="text-sm text-stone-500 mt-1">
          {complete} of {rows.length} passengers have both a flight ticket and a visa. Open each one
          to check the name matches the passenger.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-stone-500 border-b border-stone-200">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Passenger</th>
              <th className="text-left font-semibold px-4 py-3">Booking</th>
              <th className="text-left font-semibold px-4 py-3">Flight ticket</th>
              <th className="text-left font-semibold px-4 py-3">Visa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map(({ r, p, flight, visa }) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5 text-stone-900 whitespace-nowrap">
                  {p.given_names} {p.surname}
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/admin/bookings/${r.id}`} className="font-mono text-[#8a6e1f] hover:underline">
                    {r.reservation_code}
                  </Link>
                </td>
                <DocCell docs={flight} />
                <DocCell docs={visa} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DocCell({ docs }: { docs: Array<{ id: string; url: string | null }> }) {
  if (docs.length === 0) {
    return <td className="px-4 py-2.5 text-red-600 font-semibold">Missing</td>
  }
  return (
    <td className="px-4 py-2.5 whitespace-nowrap">
      {docs.map((d, i) => (
        <a
          key={d.id}
          href={d.url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="text-emerald-700 font-semibold hover:underline mr-3"
        >
          ✓ View{docs.length > 1 ? ` ${i + 1}` : ''}
        </a>
      ))}
      {docs.length > 1 && <span className="text-xs text-amber-700">duplicate?</span>}
    </td>
  )
}
