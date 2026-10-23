import { supabaseAdmin } from '../../../lib/supabase-admin'
import { formatTourLabel } from '../../../lib/booking'
import ContactsExport, { type ContactRow } from './contacts-export'

export const dynamic = 'force-dynamic'

type Reservation = {
  id: string
  tour_id: string
  reservation_code: string
  lead_email: string | null
  lead_phone: string | null
}
type Passenger = {
  id: string
  reservation_id: string
  position: number
  given_names: string
  surname: string
  email: string | null
  phone: string | null
}

export default async function AdminContactsPage() {
  const db = supabaseAdmin()
  const [{ data: tours }, { data: reservations }, { data: passengers }] = await Promise.all([
    db.from('tours').select('id, slug').order('departure_date', { ascending: false }),
    db
      .from('reservations')
      .select('id, tour_id, reservation_code, lead_email, lead_phone')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false }),
    db
      .from('reservation_passengers')
      .select('id, reservation_id, position, given_names, surname, email, phone')
      .order('position', { ascending: true }),
  ])

  const tourRows = (tours ?? []) as Array<{ id: string; slug: string }>
  const tourLabel = new Map(tourRows.map(t => [t.id, formatTourLabel(t.slug)]))
  const byId = new Map(((reservations ?? []) as Reservation[]).map(r => [r.id, r]))

  // The lead passenger is the first on the booking, and their contact is the booking's contact.
  const leadId = new Map<string, string>()
  for (const p of (passengers ?? []) as Passenger[]) {
    if (!leadId.has(p.reservation_id)) leadId.set(p.reservation_id, p.id)
  }

  const rows: ContactRow[] = ((passengers ?? []) as Passenger[]).flatMap(p => {
    const r = byId.get(p.reservation_id)
    if (!r) return []
    const isLead = leadId.get(r.id) === p.id
    return [
      {
        id: p.id,
        givenNames: p.given_names,
        surname: p.surname,
        email: p.email ?? (isLead ? r.lead_email : null),
        phone: p.phone ?? (isLead ? r.lead_phone : null),
        reservationCode: r.reservation_code,
        tourId: r.tour_id,
        tourLabel: tourLabel.get(r.tour_id) ?? '—',
        isLead,
      },
    ]
  })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Contacts</h1>
        <p className="text-sm text-stone-500 mt-1">
          Every confirmed passenger’s own email and phone number. Tick the people you want, or filter and save everyone shown, then
          open the downloaded file on your phone to add them to your contacts.
        </p>
      </div>
      <ContactsExport rows={rows} tours={tourRows.map(t => ({ id: t.id, label: formatTourLabel(t.slug) }))} />
    </div>
  )
}
