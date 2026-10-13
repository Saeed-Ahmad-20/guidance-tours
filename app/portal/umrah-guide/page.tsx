import { requirePortalSession } from '../../lib/portal-session'
import OpenOnHash from '../haramayn/open-on-hash'
import { GuideParts } from './guide-parts'
import { UMRAH_GUIDE, UMRAH_SUMMARY } from './umrah-guide-data'

export const dynamic = 'force-dynamic'

export default async function PortalUmrahGuidePage() {
  await requirePortalSession()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <OpenOnHash />

      <section className="rounded-2xl bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] p-6 sm:p-8">
        <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest">Step by step</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">Umrah Guide</h1>
        <p className="text-sm text-stone-300 mt-2 leading-relaxed">
          From preparing at home to completing your Umrah in Makkah. Open each part as you reach it.
        </p>
        <nav className="flex flex-wrap gap-2 mt-5" aria-label="Jump to part">
          {UMRAH_GUIDE.map(part => (
            <a
              key={part.id}
              href={`#${part.id}`}
              className="px-3.5 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-900 text-sm font-medium transition hover:border-[#C4A348]"
            >
              {part.title}
            </a>
          ))}
        </nav>
      </section>

      <section className="mt-8 rounded-2xl bg-white border border-stone-200 p-5 sm:p-6">
        <h2 className="font-bold text-stone-900">Umrah at a glance</h2>
        <ol className="mt-4 flex flex-col gap-2.5">
          {UMRAH_SUMMARY.map((line, i) => (
            <li key={line} className="flex items-start gap-3 text-sm text-stone-700">
              <span
                className="shrink-0 w-6 h-6 rounded-full bg-[#C4A348] text-white text-xs font-bold flex items-center justify-center"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{line}</span>
            </li>
          ))}
        </ol>
      </section>

      <GuideParts parts={UMRAH_GUIDE} />

      <p className="text-xs text-stone-400 text-center mt-10">
        This is a summary for general guidance. Your guides will explain each step in more detail on the day.
      </p>
    </div>
  )
}
