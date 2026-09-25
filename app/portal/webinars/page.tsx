import { supabaseAdmin } from '../../lib/supabase-admin'
import { requirePortalSession } from '../../lib/portal-session'
import { webinarEmbedUrl } from '../../lib/portal-content'

export const dynamic = 'force-dynamic'

type Webinar = {
  id: string
  title: string
  description: string | null
  video_url: string
  recorded_on: string | null
}

export default async function PortalWebinarsPage() {
  await requirePortalSession()

  const { data } = await supabaseAdmin()
    .from('webinars')
    .select('id, title, description, video_url, recorded_on')
    .order('recorded_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  const webinars = (data ?? []) as Webinar[]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-stone-900">Webinars</h1>
      <p className="text-sm text-stone-500 mt-1 mb-6">
        Recordings of our pre-departure sessions — watch them any time.
      </p>

      {webinars.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
          <p className="font-semibold text-stone-900">No recordings yet</p>
          <p className="text-sm text-stone-500 mt-1">
            Webinar recordings will appear here after each session.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {webinars.map(w => {
            const embed = webinarEmbedUrl(w.video_url)
            return (
              <article key={w.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                {embed && (
                  <div className="aspect-video bg-stone-900">
                    <iframe
                      src={embed}
                      title={w.title}
                      className="w-full h-full"
                      loading="lazy"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <h2 className="font-semibold text-stone-900">{w.title}</h2>
                  {w.recorded_on && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      Recorded{' '}
                      {new Date(w.recorded_on).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </p>
                  )}
                  {w.description && (
                    <p className="text-sm text-stone-600 mt-3 whitespace-pre-wrap leading-relaxed">
                      {w.description}
                    </p>
                  )}
                  {!embed && (
                    <a
                      href={w.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center px-5 py-2.5 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition"
                    >
                      Watch recording ↗
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
