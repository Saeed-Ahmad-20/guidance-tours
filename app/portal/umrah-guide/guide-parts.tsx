import Image from 'next/image'
import type { Dua, UmrahPart } from './umrah-guide-data'

// The accordion of parts and steps, shared by the Umrah Guide and The Beloved’s Home.
export function GuideParts({ parts }: { parts: UmrahPart[] }) {
  return (
    <div className="flex flex-col gap-4 mt-8">
      {parts.map((part, p) => (
        <details
          key={part.id}
          id={part.id}
          className="group/part scroll-mt-32 bg-white rounded-2xl border border-stone-200 border-l-4 border-l-[#C4A348] overflow-hidden"
        >
          <summary className="flex items-center gap-4 p-5 sm:p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-gradient-to-r from-amber-50 to-white">
            <span
              className="shrink-0 w-9 h-9 rounded-full bg-[#2C1F0E] text-[#C4A348] text-sm font-bold flex items-center justify-center"
              aria-hidden
            >
              {p + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-stone-900">{part.title}</h3>
              <p className="text-xs font-semibold mt-0.5 text-[#8a6e1f]">{part.blurb}</p>
            </div>
            <span
              aria-hidden
              className="shrink-0 text-2xl transition-transform group-open/part:rotate-180 text-[#8a6e1f]"
            >
              ⌄
            </span>
          </summary>

          <div className="px-4 sm:px-6 pb-6 border-t border-stone-100 pt-5 flex flex-col gap-3">
            {part.steps.map((step, i) => (
              <details key={step.heading} className="group/step rounded-xl border overflow-hidden bg-amber-50/60 border-amber-100">
                <summary className="flex items-center gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#C4A348] text-white"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <h4 className="flex-1 font-semibold text-stone-900">{step.heading}</h4>
                  <span aria-hidden className="shrink-0 text-xl transition-transform group-open/step:rotate-180 text-[#8a6e1f]">
                    ⌄
                  </span>
                </summary>
                <div className="px-4 pb-5 border-t border-amber-100 pt-4 flex flex-col gap-3 bg-white">
                  {step.images && (
                    <div className={`grid gap-3 ${step.images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                      {step.images.map(image => (
                        <figure key={image.src} className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={1100}
                            height={825}
                            sizes="(min-width: 768px) 340px, 100vw"
                            className="w-full h-auto max-h-80 object-contain"
                          />
                          <figcaption className="px-3 py-2 text-xs text-stone-500 border-t border-stone-200 bg-white">
                            {image.alt}
                            {image.credit && (
                              <>
                                {' · '}
                                <a href={image.href} target="_blank" rel="noreferrer" className="hover:underline">
                                  {image.credit}
                                </a>
                              </>
                            )}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                  {step.paragraphs?.map((para, j) => (
                    <p key={j} className="text-sm text-stone-600 leading-relaxed">
                      {para}
                    </p>
                  ))}
                  {step.bullets && (
                    <ul className="flex flex-col gap-2">
                      {step.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-stone-600 leading-relaxed">
                          <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C4A348] shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.duas?.map(dua => <DuaCard key={dua.label} dua={dua} />)}
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

function DuaCard({ dua }: { dua: Dua }) {
  return (
    <div className="rounded-xl border-l-4 border-[#C4A348] bg-amber-50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-[#8a6e1f]">{dua.label}</p>
      <p dir="rtl" lang="ar" className="mt-3 text-xl leading-loose text-stone-900 text-right">
        {dua.arabic}
      </p>
      <p className="mt-3 text-sm italic text-stone-700 leading-relaxed">{dua.transliteration}</p>
      <p className="mt-2 text-sm text-stone-600 leading-relaxed">{dua.translation}</p>
    </div>
  )
}
