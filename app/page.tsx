import Image from 'next/image'
import RegistrationForm from './components/registration-form'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3]">
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-8 pb-">
        <Image
          src="/images/logo.png"
          alt="Guidance Tours"
          width={350}
          height={350}
          priority
          className="mb-8"
        />

        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 max-w-2xl leading-tight mb-6">
          Our First Umrah Journey{' '}
          <span className="text-[#C4A348]">Is Being Prepared</span>
        </h1>

        <div className="flex items-center gap-2 mb-7 text-zinc-500">
          <svg
            className="w-12 h-12 text-[#C4A348] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-4xl sm:text-3xl font-medium text-zinc-900 max-w-2xl leading-tight">
            25 October – 4 November 2025
          </span>
        </div>

        <p className="text-zinc-500 text-lg max-w-xl leading-relaxed">
          We are honoured to announce that Guidance Tours is preparing its first
          blessed journey to the sacred cities of Makkah and Madinah.
          Register your interest below and we will be in touch with all the
          details soon for you to confirm your place.
        </p>
      </section>

      {/* Divider */}
      <div className="w-16 h-px bg-[#C4A348]/40 mx-auto mb-12" />

      {/* Form */}
      <section className="flex-1 px-6 pb-20">
        <div className="mx-auto w-full max-w-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Register Your Interest
            </h2>
            <p className="text-zinc-500 text-sm">
              Be among the first to secure your place on this blessed journey
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <RegistrationForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 text-zinc-400 text-center text-xs py-5 px-6">
        © {new Date().getFullYear()} Guidance Tours · All rights reserved
      </footer>
    </div>
  )
}