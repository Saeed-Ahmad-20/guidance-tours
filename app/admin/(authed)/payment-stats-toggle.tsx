'use client'

import { useState } from 'react'
import { formatGBP } from '../../lib/booking'

export default function PaymentStatsToggle({
  depositsReceived,
  depositsOutstanding,
  totalReceived,
  totalOutstanding,
}: {
  depositsReceived: number
  depositsOutstanding: number
  totalReceived: number
  totalOutstanding: number
}) {
  const [view, setView] = useState<'total' | 'deposits'>('total')

  const received = view === 'total' ? totalReceived : depositsReceived
  const outstanding = view === 'total' ? totalOutstanding : depositsOutstanding
  const receivedLabel = view === 'total' ? 'Total amount received' : 'Deposits received'
  const outstandingLabel = view === 'total' ? 'Total outstanding' : 'Deposits outstanding'

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="inline-flex rounded-full border border-stone-200 bg-white p-0.5">
          {(['total', 'deposits'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                view === v ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {v === 'total' ? 'Total' : 'Deposits'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Stat label={receivedLabel} value={formatGBP(received)} tone="green" />
        <Stat label={outstandingLabel} value={formatGBP(outstanding)} tone="amber" />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'green' | 'amber'
}) {
  const toneMap = {
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  }[tone]
  return (
    <div className={`rounded-xl border p-4 ${toneMap}`}>
      <p className="text-[10px] uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
