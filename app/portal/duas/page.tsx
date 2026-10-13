import { requirePortalSession } from '../../lib/portal-session'
import OpenOnHash from '../haramayn/open-on-hash'
import { DUAS, type DuaEntry } from './duas-data'

export const dynamic = 'force-dynamic'

export default async function PortalDuasPage() {
  await requirePortalSession()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <OpenOnHash />

      <section className="rounded-2xl bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] p-6 sm:p-8">
        <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest">Makkah and Madinah</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">Duas for Your Journey</h1>
        <p className="text-sm text-stone-300 mt-2 leading-relaxed">
          Every du’a to read in both cities in one place, each with the Arabic, the meaning, and when and why to read it.
          You can also ask Allah in your own words, in any language.
        </p>
        <nav className="flex flex-wrap gap-2 mt-5" aria-label="Jump to section">
          {DUAS.map(section => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-3.5 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-900 text-sm font-medium transition hover:border-[#C4A348]"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </section>

      <div className="flex flex-col gap-4 mt-8">
        {DUAS.map((section, s) => (
          <details
            key={section.id}
            id={section.id}
            className="group/part scroll-mt-32 bg-white rounded-2xl border border-stone-200 border-l-4 border-l-[#C4A348] overflow-hidden"
          >
            <summary className="flex items-center gap-4 p-5 sm:p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-gradient-to-r from-amber-50 to-white">
              <span
                className="shrink-0 w-9 h-9 rounded-full bg-[#2C1F0E] text-[#C4A348] text-sm font-bold flex items-center justify-center"
                aria-hidden
              >
                {s + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900">{section.title}</h2>
                <p className="text-xs font-semibold mt-0.5 text-[#8a6e1f]">{section.blurb}</p>
              </div>
              <span
                aria-hidden
                className="shrink-0 text-2xl transition-transform group-open/part:rotate-180 text-[#8a6e1f]"
              >
                ⌄
              </span>
            </summary>

            <div className="px-4 sm:px-6 pb-6 border-t border-stone-100 pt-5 flex flex-col gap-4">
              {section.duas?.map(dua => <DuaCard key={dua.label} dua={dua} />)}
              {section.bullets && (
                <ul className="flex flex-col gap-3">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600 leading-relaxed">
                      <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C4A348] shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>

      <p className="text-xs text-stone-400 text-center mt-10">
        Du’a is a conversation with Allah. These words are a guide, so do not let the wording stop you from asking.
      </p>
    </div>
  )
}

function DuaCard({ dua }: { dua: DuaEntry }) {
  return (
    <article className="rounded-xl border border-amber-100 bg-amber-50/60 overflow-hidden">
      <div className="p-4 pb-0">
        <h3 className="font-semibold text-stone-900">{dua.label}</h3>
        <p className="mt-2 text-sm text-stone-700 leading-relaxed">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8a6e1f]">When and why · </span>
          {dua.when}
        </p>
      </div>
      <div className="m-4 rounded-xl border-l-4 border-[#C4A348] bg-white p-4">
        <p dir="rtl" lang="ar" className="text-xl leading-loose text-stone-900 text-right">
          {dua.arabic}
        </p>
        <p className="mt-3 text-sm italic text-stone-700 leading-relaxed">{dua.transliteration}</p>
        <p className="mt-2 text-sm text-stone-600 leading-relaxed">{dua.translation}</p>
        {dua.source && <p className="mt-3 text-xs text-stone-400">Source: {dua.source}</p>}
      </div>
    </article>
  )
}
