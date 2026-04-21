import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-8 pb-6">
        <Image
          src="/images/logo.png"
          alt="Guidance Tours"
          width={350}
          height={350}
          priority
          className="mb-12"
        />

        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 max-w-2xl leading-tight">
          Our First Journey{' '}
        </h1>

        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 max-w-2xl leading-tight mb-10">
          <span className="text-[#C4A348]">Is Ready For Takeoff</span>
        </h1>

        <p className="text-stone-500 text-lg max-w-xl leading-relaxed">
          We are honoured to announce that Guidance Tours is preparing its first
          blessed journey to the sacred cities of Makkah and Madinah.
        </p>
      </section>

      {/* Divider */}
      <div className="w-16 h-px bg-[#C4A348]/40 mx-auto my-10" />

      {/* Poster */}
      <section className="flex flex-col items-center px-6 pb-16">
        <Link href="/umrah-2026" className="group">
          <div className="relative rounded-2xl overflow-hidden shadow-lg max-w-sm w-full mx-auto ring-1 ring-[#C4A348]/20 group-hover:ring-[#C4A348]/60 transition">
            <Image
              src="/images/Poster.jpeg"
              alt="Umrah 2026 — October Half-Term Experience"
              width={600}
              height={800}
              className="w-full h-auto"
            />
          </div>
          <p className="text-center text-sm text-stone-500 mt-4 group-hover:text-[#C4A348] transition-colors">
            View full details →
          </p>
        </Link>
      </section>
    </div>
  )
}