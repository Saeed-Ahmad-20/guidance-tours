import { supabaseAdmin } from '../../../lib/supabase-admin'
import WebinarManager, { type AdminWebinar } from './webinar-manager'

export const dynamic = 'force-dynamic'

export default async function AdminWebinarsPage() {
  const { data } = await supabaseAdmin()
    .from('webinars')
    .select('id, title, description, video_url, recorded_on')
    .order('recorded_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Webinars</h1>
        <p className="text-sm text-stone-500 mt-1">
          Recorded webinars listed here are shown to every passenger signed in to the portal.
          YouTube and Vimeo links play inline; other links open in a new tab.
        </p>
      </div>
      <WebinarManager webinars={(data ?? []) as AdminWebinar[]} />
    </div>
  )
}
