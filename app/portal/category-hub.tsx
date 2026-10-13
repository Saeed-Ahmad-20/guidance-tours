import Link from 'next/link'
import { portalBasePath, requirePortalSession } from '../lib/portal-session'
import { GROUPS } from './portal-groups'

// The overview page of a category: a summary, and a card for each page inside it.
export default async function CategoryHub({ path }: { path: string }) {
  await requirePortalSession()
  const base = await portalBasePath()
  const group = GROUPS.find(g => g.path === path)
  if (!group) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <section className="rounded-2xl bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] p-6 sm:p-8">
        <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest">Overview</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">{group.label}</h1>
        <p className="text-sm text-stone-300 mt-2 leading-relaxed">{group.intro}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        {group.tabs.map(tab => (
          <Link
            key={tab.path}
            href={`${base}${tab.path}` || '/'}
            className="group rounded-2xl bg-white border border-stone-200 border-l-4 border-l-[#C4A348] p-5 transition hover:border-[#C4A348] hover:shadow-sm"
          >
            <h2 className="font-bold text-stone-900">{tab.label}</h2>
            <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">{tab.blurb}</p>
            <span className="inline-block mt-3 text-sm font-medium text-[#8a6e1f] group-hover:underline">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
