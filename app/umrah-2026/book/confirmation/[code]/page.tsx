import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { BANK_DETAILS, formatGBP } from '../../../../lib/booking'

export const dynamic = 'force-dynamic'

type ReservationRow = {
  reservation_code: string
  lead_given_names: string
  lead_surname: string
  total_people: number
  total_cost_gbp: number
  deposit_amount_gbp: number
  status: string
  expires_at: string
}

async function getReservation(code: string): Promise<ReservationRow | null> {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('reservations')
    .select(
      'reservation_code, lead_given_names, lead_surname, total_people, total_cost_gbp, deposit_amount_gbp, status, expires_at'
    )
    .eq('reservation_code', code)
    .maybeSingle()
  if (error || !data) return null
  return data as ReservationRow
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const reservation = await getReservation(code)
  if (!reservation) notFound()

  const displayHours = Number(process.env.BOOKING_DISPLAY_TTL_HOURS ?? 24)

  return (
    <div className="w-full bg-stone-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C4A348]/10 border border-[#C4A348]/30 mb-4">
            <svg
              className="w-8 h-8 text-[#C4A348]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Your place is held
          </h1>
          <p className="text-stone-500 mt-2 text-sm sm:text-base">
            Transfer your deposit within <strong>{displayHours} hours</strong> to confirm your booking.
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 mb-5 text-center">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-2">
            Reservation number
          </p>
          <p className="font-mono text-3xl sm:text-4xl font-bold text-stone-900 tracking-wider select-all">
            {reservation.reservation_code}
          </p>
          <p className="text-xs text-stone-400 mt-2">
            Case-sensitive. Use this as your bank transfer reference.
          </p>
        </section>

        <section className="bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] text-stone-200 rounded-2xl p-5 sm:p-7 mb-5">
          <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest mb-4">
            Transfer details
          </p>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <BankRow label="Account holder" value={BANK_DETAILS.accountHolder} />
            <BankRow label="Account number" value={BANK_DETAILS.accountNumber} />
            <BankRow label="Sort code" value={BANK_DETAILS.sortCode} />
            <BankRow label="Reference" value={reservation.reservation_code} />
            <div className="h-px bg-white/10 my-1" />
            <BankRow
              label="Amount to transfer"
              value={formatGBP(reservation.deposit_amount_gbp)}
              emphasis
            />
          </dl>
          <p className="text-xs text-stone-400 mt-4 leading-relaxed">
            The deposit is <strong>{formatGBP(reservation.deposit_amount_gbp)}</strong> for{' '}
            {reservation.total_people} {reservation.total_people === 1 ? 'person' : 'people'} · Package
            total <strong>{formatGBP(reservation.total_cost_gbp)}</strong>, balance due 8 weeks
            before departure.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 mb-8">
          <h2 className="font-semibold text-stone-900 mb-3">Next steps</h2>
          <ol className="list-decimal pl-5 text-sm text-stone-600 space-y-2">
            <li>Make the bank transfer using the details above.</li>
            <li>
              Log into your booking portal with your{' '}
              <strong>reservation number</strong> and{' '}
              <strong>surname ({reservation.lead_surname})</strong> and click{' '}
              <em>&ldquo;I&rsquo;ve sent the deposit&rdquo;</em>.
            </li>
            <li>We&apos;ll confirm receipt and lock in your place.</li>
          </ol>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              href={`/portal?code=${encodeURIComponent(reservation.reservation_code)}`}
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition"
            >
              Go to my portal →
            </Link>
            <Link
              href="/umrah-2026"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200 transition"
            >
              Back to Umrah page
            </Link>
          </div>
        </section>

        <p className="text-xs text-stone-400 text-center">
          Save this page or write down your reservation number. We&apos;ll also need it if you contact us.
        </p>
      </div>
    </div>
  )
}

function BankRow({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-stone-400 text-xs uppercase tracking-wider">{label}</dt>
      <dd
        className={`font-mono ${
          emphasis ? 'text-[#C4A348] text-xl font-bold' : 'text-white text-sm sm:text-base'
        } select-all`}
      >
        {value}
      </dd>
    </div>
  )
}
