import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadRoomsData, ROOM_TYPES } from '../../../../../lib/rooms'
import { cap } from '../../../../../lib/booking'
import PrintButton from './print-button'

export const dynamic = 'force-dynamic'

export default async function RoomAllocationsPrintPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const data = await loadRoomsData(tourId)
  if (!data) notFound()

  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-white text-stone-900 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 print:hidden mb-6">
        <Link href={`/admin/rooms/${tourId}`} className="text-xs text-stone-500 hover:text-[#C4A348]">
          ← Back to room allocations
        </Link>
        <PrintButton />
      </div>

      <h1 className="text-2xl font-bold">Room allocations — {data.tour.label}</h1>
      <p className="text-sm text-stone-500 mt-1">Generated {generatedAt}</p>

      <div className="flex flex-col gap-8 mt-8">
        {ROOM_TYPES.map(type => {
          const section = data.byType[type]
          return (
            <section key={type} className="break-inside-avoid">
              <h2 className="text-lg font-semibold border-b border-stone-300 pb-1">
                {cap(type)} rooms
                <span className="ml-2 text-xs font-normal text-stone-500">
                  {section.rooms.length} {section.rooms.length === 1 ? 'room' : 'rooms'}
                </span>
              </h2>

              {section.rooms.length === 0 ? (
                <p className="text-sm text-stone-500 mt-2">No rooms.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {section.rooms.map((room, index) => (
                    <div key={room.id} className="break-inside-avoid border border-stone-300 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                        <span>
                          {index + 1}. {room.label}
                        </span>
                        <span
                          className={room.members.length > room.capacity ? 'text-red-700' : 'text-stone-500'}
                        >
                          {room.members.length}/{room.capacity}
                        </span>
                      </div>
                      {room.members.length === 0 ? (
                        <p className="text-xs text-stone-400 mt-1">Empty</p>
                      ) : (
                        <ul className="mt-1.5 text-sm">
                          {room.members.map(m => (
                            <li key={m.id}>
                              {m.name}
                              {m.personType === 'infant' && (
                                <span className="text-xs text-stone-500"> (infant)</span>
                              )}
                              <span className="text-xs text-stone-400 font-mono"> {m.reservationCode}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.unassigned.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Unassigned ({section.unassigned.length})
                  </h3>
                  <ul className="text-sm mt-1">
                    {section.unassigned.map(p => (
                      <li key={p.id}>
                        {p.name}
                        {p.personType === 'infant' && <span className="text-xs text-stone-500"> (infant)</span>}
                        <span className="text-xs text-stone-400 font-mono"> {p.reservationCode}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
