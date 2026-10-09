import Image from 'next/image'
import Link from 'next/link'
import { webinarEmbedUrl } from '../../lib/portal-content'
import { portalBasePath, requirePortalSession } from '../../lib/portal-session'
import { SITES, siteMapUrl, type CitySites } from './sites-data'

export const dynamic = 'force-dynamic'

// Full class strings so Tailwind can see them. Madinah leans green, Makkah gold.
const THEME: Record<
  CitySites['city'],
  {
    banner: string
    eyebrow: string
    card: string
    badge: string
    year: string
    heading: string
    panel: string
    marker: string
    primary: string
    outline: string
  }
> = {
  Madinah: {
    banner: 'from-emerald-900 to-emerald-950',
    eyebrow: 'text-emerald-300',
    card: 'border-l-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800',
    year: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    heading: 'text-emerald-800',
    panel: 'bg-emerald-50 border-emerald-100',
    marker: 'marker:text-emerald-600',
    primary: 'bg-emerald-700 hover:bg-emerald-800',
    outline: 'border-emerald-600 text-emerald-800 hover:bg-emerald-50',
  },
  Makkah: {
    banner: 'from-[#2C1F0E] to-[#1a130a]',
    eyebrow: 'text-[#C4A348]',
    card: 'border-l-[#C4A348]',
    badge: 'bg-amber-100 text-amber-900',
    year: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
    heading: 'text-[#8a6e1f]',
    panel: 'bg-amber-50 border-amber-100',
    marker: 'marker:text-[#C4A348]',
    primary: 'bg-[#C4A348] hover:bg-[#b2932e]',
    outline: 'border-[#C4A348] text-[#8a6e1f] hover:bg-amber-50',
  },
}

export default async function PortalHistoricalSitesPage() {
  await requirePortalSession()
  const base = await portalBasePath()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <section className="rounded-2xl bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] p-6 sm:p-8">
        <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest">Sites of the Seerah</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">Historical Sites</h1>
        <p className="text-sm text-stone-300 mt-2 leading-relaxed">
          Places connected to the life of the Prophet ﷺ in Madinah and Makkah, listed in order of significance and
          priority for visiting. Tap a site to read its history.
        </p>
      </section>

      {SITES.map(({ city, intro, podcast, sites }) => {
        const t = THEME[city]
        return (
          <section key={city} className="mt-10">
            <div className={`rounded-2xl bg-gradient-to-br ${t.banner} p-5 sm:p-6 mb-4`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-white">{city}</h2>
                <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-white/10 text-white">
                  {sites.length} sites
                </span>
              </div>
              <p className="text-sm text-stone-200/90 mt-2 leading-relaxed">{intro}</p>
            </div>

            {podcast && <PodcastCard podcast={podcast} city={city} />}

            <div className="flex flex-col gap-3">
              {sites.map((site, n) => (
                <details
                  key={site.name}
                  className={`group bg-white rounded-2xl border border-stone-200 border-l-4 ${t.card} overflow-hidden`}
                >
                  <summary className="flex items-center gap-4 p-4 sm:p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${t.badge}`}
                      aria-label={`Priority ${n + 1}`}
                    >
                      {n + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <p className="font-semibold text-stone-900">{site.name}</p>
                        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 whitespace-nowrap ${t.year}`}>
                          {site.year}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 mt-0.5">{site.summary}</p>
                    </div>
                    <span
                      aria-hidden
                      className={`shrink-0 text-xl transition-transform group-open:rotate-180 ${t.heading}`}
                    >
                      ⌄
                    </span>
                  </summary>

                  <div className="px-4 sm:px-5 pb-5 border-t border-stone-100">
                    {site.image && (
                      <figure className="mt-4">
                        <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-stone-100">
                          <Image
                            src={site.image.src}
                            alt={site.name}
                            fill
                            sizes="(min-width: 768px) 672px, 100vw"
                            className="object-cover"
                          />
                        </div>
                        <figcaption className="text-[11px] text-stone-400 mt-1.5">
                          Photo:{' '}
                          <a href={site.image.href} target="_blank" rel="noreferrer" className="hover:underline">
                            {site.image.credit}
                          </a>{' '}
                          via Wikimedia Commons
                        </figcaption>
                      </figure>
                    )}

                    <h3 className={`text-xs font-bold uppercase tracking-widest mt-5 ${t.heading}`}>History</h3>
                    <div className="mt-2 flex flex-col gap-3">
                      {site.history.map((para, i) => (
                        <p key={i} className="text-sm text-stone-600 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>

                    <div className={`mt-5 rounded-xl border p-4 ${t.panel}`}>
                      <h3 className={`text-xs font-bold uppercase tracking-widest ${t.heading}`}>Key Points</h3>
                      <ul className={`mt-2 flex flex-col gap-1.5 list-disc pl-5 ${t.marker}`}>
                        {site.keyFacts.map((fact, i) => (
                          <li key={i} className="text-sm text-stone-700 leading-relaxed">
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-5">
                      {site.more && (
                        <Link
                          href={`${base}/haramayn#${site.more.anchor}`}
                          className={`inline-flex items-center px-4 py-2 rounded-full border font-semibold text-sm transition ${t.outline}`}
                        >
                          {site.more.label} →
                        </Link>
                      )}
                      <a
                        href={siteMapUrl(site.mapQuery)}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center px-4 py-2 rounded-full text-white font-semibold text-sm transition ${t.primary}`}
                      >
                        Open in Google Maps ↗
                      </a>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )
      })}

      <p className="text-xs text-stone-400 text-center mt-10">
        Summaries are for general guidance. Your guides will share more detail on the day.
      </p>
    </div>
  )
}

function PodcastCard({ podcast, city }: { podcast: NonNullable<CitySites['podcast']>; city: CitySites['city'] }) {
  const t = THEME[city]
  const embed = webinarEmbedUrl(podcast.url)
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${t.banner} overflow-hidden mb-4`}>
      {embed && (
        <div className="aspect-video bg-black">
          <iframe
            src={embed}
            title={podcast.title}
            className="w-full h-full"
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
      <div className="p-4 sm:p-5">
        <p className={`text-xs font-bold uppercase tracking-widest ${t.eyebrow}`}>Podcast · {city}</p>
        <p className="font-semibold text-white mt-1">{podcast.title}</p>
        <p className="text-xs text-stone-300 mt-0.5">{podcast.host}</p>
        <a
          href={podcast.url}
          target="_blank"
          rel="noreferrer"
          className={`mt-3 inline-block text-sm font-semibold hover:underline ${t.eyebrow}`}
        >
          Watch on YouTube ↗
        </a>
      </div>
    </div>
  )
}
