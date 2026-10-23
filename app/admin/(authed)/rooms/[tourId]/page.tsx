import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadRoomsData } from '../../../../lib/rooms'
import { loadKeyCardData } from '../../../../lib/key-cards-data'
import KeyCardPlanner from './key-card-planner'
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
  const keyCards = await loadKeyCardData(tourId)

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
          className="text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-full px-4 py-2 hover:border-stone-400 transition shrink-0"
        >
          Download room list (.txt)
        </Link>
      </div>

      <RoomAllocationsBoard tourId={tourId} byType={data.byType} />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Key cards</h2>
          <p className="text-sm text-stone-500 mt-1">
            At the hotel, enter the room numbers on the key cards you were given, by room type. You will be told which
            lead passenger to hand each card to, keeping each booking’s cards together. Only confirmed bookings are
            included.
          </p>
          {keyCards.ungrouped > 0 && (
            <p className="text-xs text-amber-700 mt-2">
              {keyCards.ungrouped} passenger{keyCards.ungrouped === 1 ? ' is' : 's are'} not yet placed in a room above,
              so they are grouped with their own booking’s beds.
            </p>
          )}
        </div>
        <KeyCardPlanner tourId={tourId} rooms={keyCards.rooms} bookings={keyCards.bookings} groups={keyCards.groups}
          people={keyCards.people}
          groupingReady={keyCards.groupingReady}
        />
      </section>
    </div>
  )
}
