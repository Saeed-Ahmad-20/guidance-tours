'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminUpdateLeadContact } from '../../../../actions/admin'

export default function LeadContactEditor({
  reservationId,
  email,
  phone,
}: {
  reservationId: string
  email: string | null
  phone: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [emailVal, setEmailVal] = useState(email || '')
  const [phoneVal, setPhoneVal] = useState(phone || '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSave() {
    setError(null)
    startTransition(async () => {
      const r = await adminUpdateLeadContact(reservationId, emailVal, phoneVal)
      if (r.ok) { setOpen(false); router.refresh() }
      else setError(r.error)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[#C4A348] hover:underline mt-3 block"
      >
        Edit contact details
      </button>
    )
  }

  const inputCls = 'text-sm rounded-lg border border-stone-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400 w-full'
  const labelCls = 'flex flex-col gap-1 text-xs font-medium text-stone-600 uppercase tracking-wider'

  return (
    <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold text-stone-900">Edit contact details</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className={labelCls}>
          Email
          <input
            type="email"
            value={emailVal}
            onChange={e => setEmailVal(e.target.value)}
            className={`${inputCls} font-normal normal-case tracking-normal`}
          />
        </label>
        <label className={labelCls}>
          Phone
          <input
            type="tel"
            value={phoneVal}
            onChange={e => setPhoneVal(e.target.value)}
            className={`${inputCls} font-normal normal-case tracking-normal`}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#C4A348] text-white font-semibold text-sm hover:bg-[#b2932e] transition disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white border border-stone-300 text-stone-600 font-semibold text-sm hover:border-stone-400 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
