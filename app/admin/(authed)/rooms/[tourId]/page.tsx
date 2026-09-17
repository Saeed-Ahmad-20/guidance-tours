import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadRoomsData } from '../../../../lib/rooms'
import RoomAllocationsBoard from './room-allocations-board'

export const dynamic = 'force-dynamic'

export default async function RoomAllocationsPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const data = await loadRoomsData(tourId)
  if (!data) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin" className="text-xs text-stone-500 hover:text-[#C4A348]">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
            Room allocations — {data.tour.label}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Group passengers into physical rooms. Auto-suggest fills empty capacity first and keeps each
            booking together where it fits — rearrange anything by hand afterwards.
          </p>
        </div>
        <Link
          href={`/admin/rooms/${tourId}/print`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-full px-4 py-2 hover:border-stone-400 transition shrink-0"
        >
          Print / save as PDF
        </Link>
      </div>

      <RoomAllocationsBoard tourId={tourId} byType={data.byType} />
    </div>
  )
}
