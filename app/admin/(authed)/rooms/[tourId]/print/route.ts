import { getAdminUser } from '../../../../../lib/admin-session'
import { buildRoomAllocationsText, loadRoomsData } from '../../../../../lib/rooms'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, ctx: RouteContext<'/admin/rooms/[tourId]/print'>) {
  const admin = await getAdminUser()
  if (!admin) return new Response('Not authorised.', { status: 401 })

  const { tourId } = await ctx.params
  const data = await loadRoomsData(tourId)
  if (!data) return new Response('Tour not found.', { status: 404 })

  const filename = `room-allocations-${data.tour.label.toLowerCase().replace(/\s+/g, '-')}.txt`

  return new Response(buildRoomAllocationsText(data), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
