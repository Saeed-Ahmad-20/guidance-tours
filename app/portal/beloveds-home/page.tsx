import { requirePortalSession } from '../../lib/portal-session'
import OpenOnHash from '../haramayn/open-on-hash'
import { GuideParts } from '../umrah-guide/guide-parts'
import { BELOVEDS_HOME, BELOVEDS_HOME_SUMMARY } from './beloveds-home-data'

export const dynamic = 'force-dynamic'

export default async function PortalBelovedsHomePage() {
  await requirePortalSession()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <OpenOnHash />

      <section className="rounded-2xl bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] p-6 sm:p-8">
        <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest">Madinah al-Munawwarah</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">The Beloved’s ﷺ Home</h1>
        <p className="text-sm text-stone-300 mt-2 leading-relaxed">
          The etiquette of Madinah and of visiting the Messenger of Allah ﷺ, entering Riyad al-Jannah and giving salam,
          as taught by the scholars of the four Sunni schools over the past fourteen centuries.
        </p>
        <nav className="flex flex-wrap gap-2 mt-5" aria-label="Jump to part">
          {BELOVEDS_HOME.map(part => (
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
        <h2 className="font-bold text-stone-900">The Visit at a Glance</h2>
        <ol className="mt-4 flex flex-col gap-2.5">
          {BELOVEDS_HOME_SUMMARY.map((line, i) => (
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

      <GuideParts parts={BELOVEDS_HOME} />

      <p className="text-xs text-stone-400 text-center mt-10">
        The schools differ on small details of the visit. Follow your own school and the advice of your guides,
        who will walk you through it on the day.
      </p>
    </div>
  )
}
