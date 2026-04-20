import Image from 'next/image'
import RegistrationForm from './components/registration-form'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-8 pb-">
        <Image
          src="/images/logo.png"
          alt="Guidance Tours"
          width={350}
          height={350}
          priority
          className="mb-12"
        />

        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 max-w-2xl leading-tight">
          Our First Journey{' '}
        </h1>

        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 max-w-2xl leading-tight mb-10">
          <span className="text-[#C4A348]">Is Ready For Takeoff</span>
        </h1>

        <div className="flex items-center gap-2 mb-7 text-zinc-500">
          <span className="text-4xl sm:text-3xl font-medium text-zinc-900 max-w-2xl leading-tight">
            25 October – 4 November 2025
          </span>
        </div>

        <p className="text-zinc-500 text-lg max-w-xl leading-relaxed">
          We are honoured to announce that Guidance Tours is for its first
          blessed journey to the sacred cities of Makkah and Madinah.
        </p>
      </section>
    </div>
  )
}