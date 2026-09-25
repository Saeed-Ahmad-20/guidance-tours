import { supabaseAdmin } from '../../lib/supabase-admin'
import { requirePortalSession } from '../../lib/portal-session'
import { CHECKLIST } from './checklist-items'
import ChecklistView from './checklist-view'

export const dynamic = 'force-dynamic'

export default async function PortalChecklistPage() {
  const { pid } = await requirePortalSession()
  const db = supabaseAdmin()

  const [{ data: ticks }, { data: me }, { data: docs }] = await Promise.all([
    db.from('passenger_checklist').select('item_key').eq('passenger_id', pid),
    db.from('reservation_passengers').select('given_names, passport_photo_uploaded_at').eq('id', pid).single(),
    db.from('passenger_documents').select('doc_type').eq('passenger_id', pid),
  ])

  const firstName = (me as { given_names: string } | null)?.given_names.trim().split(/\s+/)[0]
  const types = new Set(((docs ?? []) as Array<{ doc_type: string }>).map(d => d.doc_type))
  const auto = {
    passport_uploaded: Boolean((me as { passport_photo_uploaded_at: string | null } | null)?.passport_photo_uploaded_at),
    visa_and_ticket: types.has('e_visa') && types.has('flight_ticket'),
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-stone-900">Your checklist</h1>
      <p className="text-sm text-stone-500 mt-1 mb-6">
        {firstName ? `${firstName}, tick` : 'Tick'} things off as you get ready. This list is just
        for you and saves automatically.
      </p>
      <ChecklistView
        sections={CHECKLIST}
        initialChecked={((ticks ?? []) as Array<{ item_key: string }>).map(t => t.item_key)}
        auto={auto}
      />
    </div>
  )
}
