import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { formatTourLabel } from '../../../lib/booking'

export const dynamic = 'force-dynamic'

export default async function RoomsIndexPage() {
  const db = supabaseAdmin()
  const { data: tours } = await db
    .from('tours')
    .select('id, slug, departure_date')
    .order('departure_date', { ascending: false })

  const rows = (tours ?? []) as Array<{ id: string; slug: string; departure_date: string | null }>

  if (rows.length === 1) {
    redirect(`/admin/rooms/${rows[0].id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Room allocations</h1>
        <p className="text-stone-500 text-sm mt-1">Pick a tour to allocate rooms for.</p>
      </section>

      {rows.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white rounded-xl border border-stone-200 p-5">
          No tours found.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map(t => (
            <li key={t.id}>
              <Link
                href={`/admin/rooms/${t.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-stone-200 p-4 hover:border-[#C4A348] transition"
              >
                <span className="font-semibold text-stone-900">{formatTourLabel(t.slug)}</span>
                {t.departure_date && (
                  <span className="text-xs text-stone-500">
                    Departs {new Date(t.departure_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
