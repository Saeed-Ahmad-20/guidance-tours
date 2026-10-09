'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { AttachableDoc, CatalogueGroup } from './catalogue'

type Category = { key: string; title: string; blurb: string; accent: string; ring: string; chip: string }

const CATEGORIES: Category[] = [
  {
    key: 'trip',
    title: 'Your Trip',
    blurb: 'Flights, hotels, the day-by-day plan and your travel documents.',
    accent: 'border-l-[#C4A348]',
    ring: 'accent-[#C4A348]',
    chip: 'bg-amber-100 text-amber-900',
  },
  {
    key: 'sites',
    title: 'Historical Sites',
    blurb: 'Places from the seerah in Madinah and Makkah.',
    accent: 'border-l-emerald-600',
    ring: 'accent-emerald-700',
    chip: 'bg-emerald-100 text-emerald-800',
  },
  {
    key: 'haramayn',
    title: 'The Haramayn',
    blurb: 'Masjid al-Haram, the Ka’bah, Masjid an-Nabawi and the Rawdah.',
    accent: 'border-l-[#8a6e1f]',
    ring: 'accent-[#8a6e1f]',
    chip: 'bg-amber-100 text-amber-900',
  },
]

const STORAGE_KEY = 'pdf-builder-v1'

type Saved = { selected: string[]; title: string; photos: boolean; keyPoints: boolean; mapLinks: boolean }

// Choices are remembered on this device (a convenience only; the page works without it).
const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}
const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function parseSaved(raw: string | null, valid: Set<string>): Partial<Saved> | null {
  if (!raw) return null
  try {
    const saved = JSON.parse(raw) as Partial<Saved>
    return {
      selected: Array.isArray(saved.selected) ? saved.selected.filter(id => valid.has(id)) : undefined,
      title: typeof saved.title === 'string' ? saved.title : undefined,
      photos: typeof saved.photos === 'boolean' ? saved.photos : undefined,
      keyPoints: typeof saved.keyPoints === 'boolean' ? saved.keyPoints : undefined,
      mapLinks: typeof saved.mapLinks === 'boolean' ? saved.mapLinks : undefined,
    }
  } catch {
    return null
  }
}

const DOC_PREFIX = 'doc-'

export default function PdfBuilder({
  groups: contentGroups,
  documents,
}: {
  groups: CatalogueGroup[]
  documents: AttachableDoc[]
}) {
  // Travel documents are listed in the "Your trip" category, after the trip items.
  const groups = useMemo<CatalogueGroup[]>(() => {
    if (documents.length === 0) return contentGroups
    const docGroup: CatalogueGroup = {
      id: 'trip-documents',
      title: 'Travel Documents',
      description: 'Attached at the end of your PDF, exactly as issued.',
      items: documents.map(d => ({
        id: `${DOC_PREFIX}${d.id}`,
        title: d.label,
        note: `${d.person} · ${d.typeLabel}`,
        blocks: [],
      })),
    }
    const at = contentGroups.findIndex(g => g.id === 'trip') + 1
    return [...contentGroups.slice(0, at), docGroup, ...contentGroups.slice(at)]
  }, [contentGroups, documents])

  const allIds = useMemo(() => groups.flatMap(g => g.items.map(i => i.id)), [groups])
  const defaultIds = useMemo(
    () => groups.filter(g => g.id === 'trip').flatMap(g => g.items.map(i => i.id)),
    [groups],
  )

  const savedRaw = useSyncExternalStore(subscribe, readSaved, () => null)
  const [draft, setDraft] = useState<Saved | null>(null)
  const state: Saved = useMemo(() => {
    if (draft) return draft
    const saved = parseSaved(savedRaw, new Set(allIds))
    return {
      selected: saved?.selected ?? defaultIds,
      title: saved?.title ?? 'My Umrah Guide',
      photos: saved?.photos ?? true,
      keyPoints: saved?.keyPoints ?? true,
      mapLinks: saved?.mapLinks ?? true,
    }
  }, [draft, savedRaw, allIds, defaultIds])
  const selected = useMemo(() => new Set(state.selected), [state.selected])
  const { title, photos, keyPoints, mapLinks } = state

  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  function update(patch: Partial<Saved>) {
    const next = { ...state, ...patch }
    setDraft(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  function toggle(ids: string[], on: boolean) {
    const next = new Set(state.selected)
    for (const id of ids) {
      if (on) next.add(id)
      else next.delete(id)
    }
    update({ selected: [...next] })
  }

  const setPhotos = (v: boolean) => update({ photos: v })
  const setKeyPoints = (v: boolean) => update({ keyPoints: v })
  const setMapLinks = (v: boolean) => update({ mapLinks: v })
  const setTitle = (v: string) => update({ title: v })
  const setSelected = (ids: Set<string>) => update({ selected: [...ids] })

  async function createPdf() {
    setError('')
    setBusy(true)
    setProgress('Preparing…')
    try {
      const { buildPdf, browserImageLoader, fileNameFor } = await import('./make-pdf')
      const chosen = contentGroups
        .map(g => ({ ...g, items: g.items.filter(i => selected.has(i.id)) }))
        .filter(g => g.items.length > 0)
      const docs = documents.filter(d => selected.has(`${DOC_PREFIX}${d.id}`))
      const name = title.trim() || 'My Umrah Guide'

      // With only documents ticked there is no guide to build: just the documents.
      const guide =
        chosen.length > 0
          ? await buildPdf(
              chosen,
              { title: name, photos, keyPoints, mapLinks, coverImage: '/images/sites/kaabah.jpg' },
              browserImageLoader,
              (done, total) => setProgress(`Building… ${done} of ${total}`),
            )
          : null

      let bytes: BlobPart = guide ? guide.output('arraybuffer') : new ArrayBuffer(0)
      let failed: string[] = []
      if (docs.length > 0) {
        setProgress('Adding your travel documents…')
        const { attachTravelDocuments } = await import('./attach-documents')
        const merged = await attachTravelDocuments(guide ? (bytes as ArrayBuffer) : null, docs, (done, total) =>
          setProgress(`Adding your travel documents… ${done} of ${total}`),
        )
        bytes = merged.bytes as BlobPart
        failed = merged.failed
      }

      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = fileNameFor(name)
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)

      if (failed.length > 0) {
        setError(
          `Your PDF was saved, but we couldn’t add: ${failed.join(', ')}. Refresh the page and try again, or download them from the Travel Documents tab.`,
        )
        setProgress('')
      } else {
        setProgress('Done. Your PDF has been saved to your device.')
      }
    } catch (e) {
      console.error(e)
      setError('Sorry, we couldn’t create the PDF. Please try again.')
      setProgress('')
    } finally {
      setBusy(false)
    }
  }

  const count = selected.size

  return (
    <div>
      {/* Quick picks */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-500 mr-1">Quick Pick</span>
        <PickButton onClick={() => setSelected(new Set(allIds))}>Everything</PickButton>
        <PickButton onClick={() => setSelected(new Set(defaultIds))}>Trip essentials</PickButton>
        <PickButton
          onClick={() =>
            setSelected(new Set(groups.filter(g => g.id.startsWith('sites-') || g.id.startsWith('haramayn-')).flatMap(g => g.items.map(i => i.id))))
          }
        >
          Sites and Haramayn
        </PickButton>
        <PickButton onClick={() => setSelected(new Set())}>Clear</PickButton>
      </div>

      {/* Content picker */}
      <div className="flex flex-col gap-5">
        {CATEGORIES.map(cat => {
          const catGroups = groups.filter(g => g.id === cat.key || g.id.startsWith(`${cat.key}-`))
          if (catGroups.length === 0) return null
          const catIds = catGroups.flatMap(g => g.items.map(i => i.id))
          const catCount = catIds.filter(id => selected.has(id)).length
          return (
            <details
              key={cat.key}
              open={cat.key === 'trip'}
              className={`group/cat bg-white rounded-2xl border border-stone-200 border-l-4 ${cat.accent} overflow-hidden`}
            >
              <summary className="flex items-center gap-4 p-4 sm:p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <TriCheckbox
                  className={cat.ring}
                  checked={catCount === catIds.length}
                  indeterminate={catCount > 0 && catCount < catIds.length}
                  onChange={on => toggle(catIds, on)}
                  label={`Select all in ${cat.title}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-stone-900">{cat.title}</p>
                  <p className="text-sm text-stone-500">{cat.blurb}</p>
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap ${cat.chip}`}>
                  {catCount} of {catIds.length}
                </span>
                <span aria-hidden className="shrink-0 text-xl text-stone-400 transition-transform group-open/cat:rotate-180">
                  ⌄
                </span>
              </summary>

              <div className="border-t border-stone-100 p-4 sm:p-5 flex flex-col gap-5">
                {catGroups.map(g => {
                  const ids = g.items.map(i => i.id)
                  const n = ids.filter(id => selected.has(id)).length
                  const showHeader = catGroups.length > 1
                  return (
                    <div key={g.id}>
                      {showHeader && (
                        <div className="flex items-center gap-3 mb-2">
                          <TriCheckbox
                            className={cat.ring}
                            checked={n === ids.length}
                            indeterminate={n > 0 && n < ids.length}
                            onChange={on => toggle(ids, on)}
                            label={`Select all in ${g.title}`}
                          />
                          <p className="text-sm font-semibold text-stone-800">{g.title}</p>
                        </div>
                      )}
                      {g.id === 'trip-documents' && (
                        <p className="text-xs text-stone-500 mb-2 pl-8">
                          These contain personal details. Keep your PDF somewhere safe.
                        </p>
                      )}
                      <ul className={`flex flex-col ${showHeader ? 'pl-8' : ''}`}>
                        {g.items.map(item => (
                          <li key={item.id}>
                            <label className="flex items-start gap-3 py-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selected.has(item.id)}
                                onChange={e => toggle([item.id], e.target.checked)}
                                className={`mt-0.5 w-4 h-4 shrink-0 ${cat.ring}`}
                              />
                              <span className="min-w-0">
                                <span className="text-sm text-stone-900">{item.title}</span>
                                {item.note && <span className="block text-xs text-stone-500 truncate">{item.note}</span>}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>

      {/* Options */}
      <section className="mt-6 rounded-2xl bg-white border border-stone-200 p-5 sm:p-6">
        <h2 className="font-bold text-stone-900">Make It Yours</h2>
        <label className="block mt-4">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">PDF Title</span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={60}
            className="mt-1.5 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C4A348] focus:ring-2 focus:ring-[#C4A348]/30"
          />
        </label>
        <div className="mt-4 flex flex-col gap-2.5">
          <Toggle checked={photos} onChange={setPhotos} label="Include photos" hint="Makes the file larger." />
          <Toggle checked={keyPoints} onChange={setKeyPoints} label="Include key points for each site" />
          <Toggle checked={mapLinks} onChange={setMapLinks} label="Include Google Maps links" hint="Links need a connection to open." />
        </div>
      </section>

      {/* Create */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 mt-6 bg-stone-50/95 backdrop-blur border-t sm:border border-stone-200 sm:rounded-2xl px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm min-w-0" aria-live="polite">
          <p className="font-semibold text-stone-900">
            {count} {count === 1 ? 'item' : 'items'} selected
          </p>
          {error ? (
            <p className="text-red-700 text-xs">{error}</p>
          ) : (
            progress && <p className="text-xs text-stone-500">{progress}</p>
          )}
        </div>
        <button
          type="button"
          onClick={createPdf}
          disabled={busy || count === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Creating…' : 'Create PDF'}
          <span aria-hidden>↓</span>
        </button>
      </div>
    </div>
  )
}

function PickButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full border border-stone-300 bg-white text-sm font-medium text-stone-700 hover:border-[#C4A348] hover:text-stone-900 transition"
    >
      {children}
    </button>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 shrink-0 accent-[#C4A348]"
      />
      <span className="text-sm text-stone-800">
        {label}
        {hint && <span className="text-stone-500"> · {hint}</span>}
      </span>
    </label>
  )
}

// A checkbox that can show a "some selected" state. It sits inside <summary>,
// so clicks must not toggle the surrounding <details>.
function TriCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
  className = '',
}: {
  checked: boolean
  indeterminate: boolean
  onChange: (on: boolean) => void
  label: string
  className?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-label={label}
      onClick={e => e.stopPropagation()}
      onChange={e => onChange(e.target.checked)}
      className={`w-4 h-4 shrink-0 ${className}`}
    />
  )
}
