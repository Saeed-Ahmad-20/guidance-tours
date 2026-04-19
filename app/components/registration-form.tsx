'use client'

import { useActionState } from 'react'
import { submitRegistration, type RegistrationState } from '@/app/actions'

const POPULAR_CODES = [
  { code: '+44', label: '+44 United Kingdom' },
  { code: '+966', label: '+966 Saudi Arabia' },
  { code: '+971', label: '+971 United Arab Emirates' },
  { code: '+92', label: '+92 Pakistan' },
  { code: '+880', label: '+880 Bangladesh' },
  { code: '+91', label: '+91 India' },
  { code: '+1', label: '+1 USA / Canada' },
  { code: '+61', label: '+61 Australia' },
  { code: '+20', label: '+20 Egypt' },
  { code: '+60', label: '+60 Malaysia' },
  { code: '+62', label: '+62 Indonesia' },
  { code: '+90', label: '+90 Turkey' },
  { code: '+964', label: '+964 Iraq' },
  { code: '+962', label: '+962 Jordan' },
]

const ALL_CODES = [
  { code: '+93', label: '+93 Afghanistan' },
  { code: '+355', label: '+355 Albania' },
  { code: '+213', label: '+213 Algeria' },
  { code: '+376', label: '+376 Andorra' },
  { code: '+244', label: '+244 Angola' },
  { code: '+54', label: '+54 Argentina' },
  { code: '+374', label: '+374 Armenia' },
  { code: '+61', label: '+61 Australia' },
  { code: '+43', label: '+43 Austria' },
  { code: '+994', label: '+994 Azerbaijan' },
  { code: '+973', label: '+973 Bahrain' },
  { code: '+880', label: '+880 Bangladesh' },
  { code: '+32', label: '+32 Belgium' },
  { code: '+975', label: '+975 Bhutan' },
  { code: '+387', label: '+387 Bosnia' },
  { code: '+55', label: '+55 Brazil' },
  { code: '+1', label: '+1 Canada' },
  { code: '+56', label: '+56 Chile' },
  { code: '+86', label: '+86 China' },
  { code: '+57', label: '+57 Colombia' },
  { code: '+385', label: '+385 Croatia' },
  { code: '+357', label: '+357 Cyprus' },
  { code: '+45', label: '+45 Denmark' },
  { code: '+20', label: '+20 Egypt' },
  { code: '+251', label: '+251 Ethiopia' },
  { code: '+358', label: '+358 Finland' },
  { code: '+33', label: '+33 France' },
  { code: '+995', label: '+995 Georgia' },
  { code: '+49', label: '+49 Germany' },
  { code: '+233', label: '+233 Ghana' },
  { code: '+30', label: '+30 Greece' },
  { code: '+36', label: '+36 Hungary' },
  { code: '+91', label: '+91 India' },
  { code: '+62', label: '+62 Indonesia' },
  { code: '+98', label: '+98 Iran' },
  { code: '+964', label: '+964 Iraq' },
  { code: '+353', label: '+353 Ireland' },
  { code: '+972', label: '+972 Israel' },
  { code: '+39', label: '+39 Italy' },
  { code: '+81', label: '+81 Japan' },
  { code: '+962', label: '+962 Jordan' },
  { code: '+7', label: '+7 Kazakhstan' },
  { code: '+254', label: '+254 Kenya' },
  { code: '+82', label: '+82 South Korea' },
  { code: '+965', label: '+965 Kuwait' },
  { code: '+996', label: '+996 Kyrgyzstan' },
  { code: '+961', label: '+961 Lebanon' },
  { code: '+218', label: '+218 Libya' },
  { code: '+60', label: '+60 Malaysia' },
  { code: '+960', label: '+960 Maldives' },
  { code: '+212', label: '+212 Morocco' },
  { code: '+95', label: '+95 Myanmar' },
  { code: '+977', label: '+977 Nepal' },
  { code: '+31', label: '+31 Netherlands' },
  { code: '+64', label: '+64 New Zealand' },
  { code: '+234', label: '+234 Nigeria' },
  { code: '+47', label: '+47 Norway' },
  { code: '+968', label: '+968 Oman' },
  { code: '+92', label: '+92 Pakistan' },
  { code: '+63', label: '+63 Philippines' },
  { code: '+48', label: '+48 Poland' },
  { code: '+351', label: '+351 Portugal' },
  { code: '+974', label: '+974 Qatar' },
  { code: '+40', label: '+40 Romania' },
  { code: '+7', label: '+7 Russia' },
  { code: '+250', label: '+250 Rwanda' },
  { code: '+966', label: '+966 Saudi Arabia' },
  { code: '+221', label: '+221 Senegal' },
  { code: '+65', label: '+65 Singapore' },
  { code: '+27', label: '+27 South Africa' },
  { code: '+34', label: '+34 Spain' },
  { code: '+94', label: '+94 Sri Lanka' },
  { code: '+249', label: '+249 Sudan' },
  { code: '+46', label: '+46 Sweden' },
  { code: '+41', label: '+41 Switzerland' },
  { code: '+963', label: '+963 Syria' },
  { code: '+992', label: '+992 Tajikistan' },
  { code: '+255', label: '+255 Tanzania' },
  { code: '+66', label: '+66 Thailand' },
  { code: '+216', label: '+216 Tunisia' },
  { code: '+90', label: '+90 Turkey' },
  { code: '+993', label: '+993 Turkmenistan' },
  { code: '+256', label: '+256 Uganda' },
  { code: '+380', label: '+380 Ukraine' },
  { code: '+971', label: '+971 United Arab Emirates' },
  { code: '+44', label: '+44 United Kingdom' },
  { code: '+1', label: '+1 United States' },
  { code: '+998', label: '+998 Uzbekistan' },
  { code: '+58', label: '+58 Venezuela' },
  { code: '+84', label: '+84 Vietnam' },
  { code: '+967', label: '+967 Yemen' },
  { code: '+260', label: '+260 Zambia' },
  { code: '+263', label: '+263 Zimbabwe' },
]

const TRAVELER_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1)

export default function RegistrationForm() {
  const [state, formAction, isPending] = useActionState<RegistrationState, FormData>(
    submitRegistration,
    null
  )

  if (state?.success) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 bg-[#C4A348]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#C4A348]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-3">Thank You</h3>
        <p className="text-stone-600 max-w-sm mx-auto leading-relaxed">
          We have received your registration. We will be in touch with full details of the departure as soon as they are available.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1.5">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your full name"
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[#C4A348] focus:outline-none focus:ring-2 focus:ring-[#C4A348]/20 transition"
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-stone-700 mb-1.5">
          Phone Number
        </label>
        <div className="flex gap-2">
          <select
            name="countryCode"
            defaultValue="+44"
            className="w-44 shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 focus:border-[#C4A348] focus:outline-none focus:ring-2 focus:ring-[#C4A348]/20 transition text-sm"
          >
            <optgroup label="Popular">
              {POPULAR_CODES.map(({ code, label }) => (
                <option key={`popular-${code}`} value={code}>{label}</option>
              ))}
            </optgroup>
            <optgroup label="All Countries">
              {ALL_CODES.map(({ code, label }) => (
                <option key={`all-${code}-${label}`} value={code}>{label}</option>
              ))}
            </optgroup>
          </select>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            autoComplete="tel"
            placeholder="7911 123456"
            className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[#C4A348] focus:outline-none focus:ring-2 focus:ring-[#C4A348]/20 transition"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[#C4A348] focus:outline-none focus:ring-2 focus:ring-[#C4A348]/20 transition"
        />
      </div>

      <div>
        <label htmlFor="travelerCount" className="block text-sm font-medium text-stone-700 mb-1.5">
          Number of Travellers
        </label>
        <select
          id="travelerCount"
          name="travelerCount"
          defaultValue="1"
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 focus:border-[#C4A348] focus:outline-none focus:ring-2 focus:ring-[#C4A348]/20 transition"
        >
          {TRAVELER_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'person' : 'people'}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#C4A348] px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#B8963C] focus:outline-none focus:ring-2 focus:ring-[#C4A348] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isPending ? 'Submitting…' : 'Register My Interest'}
      </button>

      <p className="text-center text-xs text-stone-400">
        We will never share your details with third parties.
      </p>
    </form>
  )
}
