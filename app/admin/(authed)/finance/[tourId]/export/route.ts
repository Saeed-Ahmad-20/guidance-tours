import ExcelJS from 'exceljs'
import { getAdminUser } from '../../../../../lib/admin-session'
import { loadFinanceData } from '../../../../../lib/finance'
import {
  AGE_GROUP_LABEL,
  STATUS_LABEL,
  assumptionsFromQuery,
  computeFinanceRows,
} from '../../../../../lib/finance-calc'
import { cap } from '../../../../../lib/booking'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, ctx: RouteContext<'/admin/finance/[tourId]/export'>) {
  const admin = await getAdminUser()
  if (!admin) return new Response('Not authorised.', { status: 401 })

  const { tourId } = await ctx.params
  const data = await loadFinanceData(tourId)
  if (!data) return new Response('Tour not found.', { status: 404 })

  const url = new URL(request.url)
  const assumptions = assumptionsFromQuery(url.searchParams)
  const computed = computeFinanceRows(data.rows, assumptions)

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Guidance Tours admin'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Passengers')
  sheet.columns = [
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Lead / booking code', key: 'booking', width: 30 },
    { header: 'Room type', key: 'roomType', width: 12 },
    { header: 'Age group', key: 'ageGroup', width: 14 },
    { header: 'Price charged (£)', key: 'charged', width: 18 },
    { header: 'Flight cost (£)', key: 'flight', width: 16 },
    { header: 'Flight tier', key: 'flightTier', width: 20 },
    { header: 'Ground cost (£)', key: 'ground', width: 16 },
    { header: 'Total actual cost (£)', key: 'actual', width: 20 },
    { header: 'Margin (£)', key: 'margin', width: 14 },
    { header: 'Status', key: 'status', width: 22 },
  ]
  sheet.getRow(1).font = { bold: true }

  for (const r of computed) {
    sheet.addRow({
      name: r.name,
      booking: `${r.leadName} (${r.reservationCode})`,
      roomType: cap(r.roomType),
      ageGroup: AGE_GROUP_LABEL[r.ageGroup],
      charged: r.amountCharged,
      flight: r.flightCost,
      flightTier: r.flightTierLabel,
      ground: r.groundCost,
      actual: r.actualCost,
      margin: r.margin,
      status: STATUS_LABEL[r.status],
    })
  }

  const totals = computed.reduce(
    (acc, r) => {
      acc.charged += r.amountCharged
      acc.flight += r.flightCost
      acc.ground += r.groundCost
      acc.actual += r.actualCost
      acc.margin += r.margin
      return acc
    },
    { charged: 0, flight: 0, ground: 0, actual: 0, margin: 0 }
  )

  const summary = workbook.addWorksheet('Summary')
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 34 },
    { header: 'Value', key: 'value', width: 16 },
  ]
  summary.getRow(1).font = { bold: true }
  summary.addRows([
    { metric: `Adults — first ${assumptions.adultTier1Count} (£ each)`, value: assumptions.adultTier1Price },
    { metric: 'Adults — additional (£ each)', value: assumptions.adultTier2Price },
    { metric: 'Youth flight cost (£ each)', value: assumptions.youthFlightPrice },
    { metric: 'Infant flight cost (£ each)', value: assumptions.infantFlightPrice },
    { metric: 'Ground cost — double (£ each)', value: assumptions.groundDouble },
    { metric: 'Ground cost — triple (£ each)', value: assumptions.groundTriple },
    { metric: 'Ground cost — quad (£ each)', value: assumptions.groundQuad },
    { metric: '', value: '' },
    { metric: 'Total price charged (£)', value: Math.round(totals.charged * 100) / 100 },
    { metric: 'Total flight cost (£)', value: totals.flight },
    { metric: 'Total ground cost (£)', value: totals.ground },
    { metric: 'Total actual cost (£)', value: totals.actual },
    { metric: 'Total margin (£)', value: Math.round(totals.margin * 100) / 100 },
  ])

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `financial-breakdown-${data.tour.label.toLowerCase().replace(/\s+/g, '-')}.xlsx`

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
