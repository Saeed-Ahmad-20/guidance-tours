'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden text-xs font-semibold bg-stone-900 text-white rounded-full px-4 py-2 hover:bg-stone-800 transition"
    >
      Print / save as PDF
    </button>
  )
}
