import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadFinanceData } from '../../../../lib/finance'
import FinanceBreakdown from './finance-breakdown'

export const dynamic = 'force-dynamic'

export default async function FinancePage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const data = await loadFinanceData(tourId)
  if (!data) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs text-stone-500 hover:text-[#C4A348]">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
          Financial breakdown — {data.tour.label}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Per-person price charged vs actual cost (flights + ground package). Adjust the cost
          assumptions below to match reality, then download the sheet.
        </p>
      </div>

      <FinanceBreakdown tourId={tourId} rows={data.rows} />
    </div>
  )
}
