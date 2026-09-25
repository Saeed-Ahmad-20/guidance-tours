'use client'

import { useState, useTransition } from 'react'
import { setChecklistItem } from '../../actions/portal'
import type { ChecklistItem, ChecklistSection } from './checklist-items'

type AutoState = Record<NonNullable<ChecklistItem['auto']>, boolean>

export default function ChecklistView({
  sections,
  initialChecked,
  auto,
}: {
  sections: ChecklistSection[]
  initialChecked: string[]
  auto: AutoState
}) {
  const [checked, setChecked] = useState(() => new Set(initialChecked))
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const isDone = (i: ChecklistItem) => (i.auto ? auto[i.auto] : checked.has(i.key))
  const all = sections.flatMap(s => s.items)
  const done = all.filter(isDone).length
  const pct = Math.round((done / all.length) * 100)

  function toggle(key: string) {
    const next = !checked.has(key)
    const update = (on: boolean) =>
      setChecked(prev => {
        const s = new Set(prev)
        if (on) s.add(key)
        else s.delete(key)
        return s
      })
    update(next)
    setError(null)
    startTransition(async () => {
      const r = await setChecklistItem(key, next)
      if (!r.ok) {
        update(!next)
        setError(r.error)
      }
    })
  }

  return (
    <>
      <div className="sticky top-[6.75rem] z-10 bg-stone-50/95 backdrop-blur py-3 -mx-1 px-1">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-stone-900">
            {done} of {all.length} done
          </span>
          <span className="text-stone-500">{pct}%</span>
        </div>
        <div
          className="h-2 rounded-full bg-stone-200 mt-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-[#C4A348] transition-all" style={{ width: `${pct}%` }} />
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="flex flex-col gap-5 mt-3">
        {sections.map(section => {
          const sectionDone = section.items.filter(isDone).length
          return (
            <section key={section.title} className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h2 className="font-semibold text-stone-900">{section.title}</h2>
                <span className="text-xs text-stone-500">
                  {sectionDone}/{section.items.length}
                </span>
              </div>
              <ul className="divide-y divide-stone-100">
                {section.items.map(item => {
                  const on = isDone(item)
                  return (
                    <li key={item.key}>
                      <label
                        className={`flex items-start gap-3 py-3 ${item.auto ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={Boolean(item.auto)}
                          onChange={() => toggle(item.key)}
                          className="mt-0.5 h-5 w-5 shrink-0 rounded accent-[#C4A348] disabled:opacity-60"
                        />
                        <span className="min-w-0">
                          <span className={`block text-sm ${on ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                            {item.label}
                          </span>
                          {item.detail && <span className="block text-xs text-stone-500 mt-0.5">{item.detail}</span>}
                          {item.auto && (
                            <span className={`block text-xs mt-0.5 ${on ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {on ? 'Done — updated automatically' : 'Not done yet — this ticks itself once it’s in the portal'}
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
