import Image from 'next/image'
import { requirePortalSession } from '../../lib/portal-session'
import { HARAMAYN, type HaramSection } from './haramayn-data'
import OpenOnHash from './open-on-hash'

export const dynamic = 'force-dynamic'

const CITIES: { city: HaramSection['city']; blurb: string }[] = [
  { city: 'Makkah', blurb: 'The sacred city, home to the Ka’bah.' },
  { city: 'Madinah', blurb: 'The city of the Prophet ﷺ, where he rests.' },
]

// Full class strings so Tailwind can see them. Makkah leans gold, Madinah green.
const THEME: Record<
  HaramSection['city'],
  {
    banner: string
    eyebrow: string
    pill: string
    card: string
    summaryBg: string
    heading: string
    intro: string
    badge: string
    topic: string
    topicBody: string
  }
> = {
  Makkah: {
    banner: 'from-[#2C1F0E] to-[#1a130a]',
    eyebrow: 'text-[#C4A348]',
    pill: 'border-amber-200 bg-amber-50 text-amber-900 hover:border-[#C4A348]',
    card: 'border-l-[#C4A348]',
    summaryBg: 'bg-gradient-to-r from-amber-50 to-white',
    heading: 'text-[#8a6e1f]',
    intro: 'bg-amber-50 border-[#C4A348] text-stone-700',
    badge: 'bg-[#C4A348] text-white',
    topic: 'bg-amber-50/60 border-amber-100',
    topicBody: 'border-amber-100',
  },
  Madinah: {
    banner: 'from-emerald-900 to-emerald-950',
    eyebrow: 'text-emerald-300',
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-500',
    card: 'border-l-emerald-600',
    summaryBg: 'bg-gradient-to-r from-emerald-50 to-white',
    heading: 'text-emerald-800',
    intro: 'bg-emerald-50 border-emerald-600 text-stone-700',
    badge: 'bg-emerald-700 text-white',
    topic: 'bg-emerald-50/60 border-emerald-100',
    topicBody: 'border-emerald-100',
  },
}

export default async function PortalHaramaynPage() {
  await requirePortalSession()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <OpenOnHash />

      <section className="rounded-2xl bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] p-6 sm:p-8">
        <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest">The two sanctuaries</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">The Haramayn</h1>
        <p className="text-sm text-stone-300 mt-2 leading-relaxed">
          Masjid al-Haram and the Ka’bah in Makkah, and Masjid an-Nabawi and the Rawdah in Madinah.
        </p>
        <nav className="flex flex-wrap gap-2 mt-5" aria-label="Jump to section">
          {HARAMAYN.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`px-3.5 py-1.5 rounded-full border text-sm font-medium transition ${THEME[s.city].pill}`}
            >
              {s.title}
            </a>
          ))}
        </nav>
      </section>

      <div className="flex flex-col gap-12 mt-10">
        {CITIES.map(({ city, blurb }) => {
          const t = THEME[city]
          return (
            <section key={city}>
              <div className={`rounded-2xl bg-gradient-to-br ${t.banner} p-5 sm:p-6 mb-5`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${t.eyebrow}`}>The sanctuary of</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">{city}</h2>
                <p className="text-sm text-stone-200/90 mt-2">{blurb}</p>
              </div>

              <div className="flex flex-col gap-4">
                {HARAMAYN.filter(s => s.city === city).map(section => (
                  <details
                    key={section.id}
                    id={section.id}
                    className={`group/section scroll-mt-32 bg-white rounded-2xl border border-stone-200 border-l-4 ${t.card} overflow-hidden`}
                  >
                    <summary
                      className={`flex items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden ${t.summaryBg}`}
                    >
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-stone-900">{section.title}</h3>
                        <p className={`text-xs font-semibold mt-0.5 ${t.heading}`}>
                          {section.topics.length} topics
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className={`shrink-0 text-2xl transition-transform group-open/section:rotate-180 ${t.heading}`}
                      >
                        ⌄
                      </span>
                    </summary>

                    <div className="px-4 sm:px-6 pb-6 border-t border-stone-100 pt-5">
                      <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-stone-100">
                        <Image
                          src={section.image.src}
                          alt={section.title}
                          fill
                          sizes="(min-width: 768px) 704px, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1.5">
                        Photo:{' '}
                        <a href={section.image.href} target="_blank" rel="noreferrer" className="hover:underline">
                          {section.image.credit}
                        </a>{' '}
                        via Wikimedia Commons
                      </p>
                      <p className={`text-sm mt-4 leading-relaxed rounded-r-xl border-l-4 p-4 ${t.intro}`}>
                        {section.intro}
                      </p>

                      <div className="flex flex-col gap-3 mt-5">
                        {section.topics.map((topic, i) => (
                          <details
                            key={topic.heading}
                            className={`group/topic rounded-xl border overflow-hidden ${t.topic}`}
                          >
                            <summary className="flex items-center gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                              <span
                                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${t.badge}`}
                                aria-hidden
                              >
                                {i + 1}
                              </span>
                              <h4 className="flex-1 font-semibold text-stone-900">{topic.heading}</h4>
                              <span
                                aria-hidden
                                className={`shrink-0 text-xl transition-transform group-open/topic:rotate-180 ${t.heading}`}
                              >
                                ⌄
                              </span>
                            </summary>
                            <div className={`px-4 pb-5 border-t pt-4 flex flex-col gap-3 bg-white ${t.topicBody}`}>
                              {topic.paragraphs.map((para, j) => (
                                <p key={j} className="text-sm text-stone-600 leading-relaxed">
                                  {para}
                                </p>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
