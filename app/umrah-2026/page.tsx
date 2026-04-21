import Image from 'next/image'

const features = [
  { icon: '📖', label: 'Pre-Travel Seminar' },
  { icon: '🌙', label: 'Spiritually Inspired Schedule' },
  { icon: '🎓', label: 'Daily Classes' },
  { icon: '🕌', label: 'Guided Tours' },
  { icon: '✈️', label: 'Manchester Flight' },
  { icon: '📄', label: 'EVW Visa' },
  { icon: '🍽️', label: 'Buffet Breakfast (10 nights)' },
  { icon: '🚄', label: 'High-Speed Train from Madinah to Makkah' },
]

const pricing = [
  { type: 'Quad', price: '£1,695' },
  { type: 'Triple', price: '£1,795' },
  { type: 'Double', price: '£1,895' },
]

const teachers = [
  {
    name: 'Shaykh Waseem Ahmed',
    image: '/images/Shaykh Waseem.webp',
    bio: 'Shaykh Waseem began his profound journey into sacred knowledge with dedicated Arabic studies in the UK, before moving to Damascus in 2005 to further his linguistic and Islamic education. In Damascus, he undertook private studies with esteemed scholars like Shaykh Ahmad Al-Khatib and Shaykh Anas Al-Sharfawi, completing extensive works in Aqidah (Doctrine), Fiqh (Jurisprudence), Spirituality, Arabic Grammar, and Rhetoric. He also attended an accelerated program at the Dawli Institute, graduating in 2012 after completing a traditional curriculum. During his time, he had the blessing of studying with numerous notable scholars of Damascus, including Shaykh Muhammad Al-Yaqoubi and Shaykh Muhammad Jumu\'a, delving into foundational texts such as the Shama\'il of Imam Al-Tirmidhi, Al-Ikhtiyaar, and the Hidaya.\n\nReturning to the UK in 2012, Shaykh Waseem has since become a prominent figure in Islamic education, delivering regular lectures and courses nationwide. He is a co-founder of the ISNAD Institute and Sacred Vows Introduction Service, and currently serves as the director of Guidance Hub. His dedication to disseminating sacred knowledge continues to benefit students across the UK, reflecting his extensive traditional education and commitment to community service.',
  },
  {
    name: 'Ustadh Saqib Rashid',
    image: '/images/Ustadh Saqib.jpeg',
    bio: 'Ustadh Saqib Rashid, with a background in the Dars e Nizami programme and in Arabic Grammar & Language, has pursued his studies both in the UK and abroad, particularly under the guidance of Syrian and Egyptian scholars. Currently, he is dedicated to studying the Maliki School of Law under the mentorship of qualified Maliki jurists from Egypt while also attending courses with Shaykh Ahmed Saad Al Azhary. Additionally, he is actively engaged in advancing his knowledge of Qiraat through studies with Syrian scholars.',
  },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3">{children}</h2>
      <div className="w-12 h-0.5 bg-[#C4A348] mx-auto" />
    </div>
  )
}

export default function Umrah2026Page() {
  return (
    <div className="w-full">

      {/* Hero */}
      <section className="bg-[#2C1F0E] text-white px-6 py-16 text-center">
        <p className="text-[#C4A348] font-semibold tracking-widest text-sm uppercase mb-3">
          October Half-Term
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3">Umrah Experience</h1>
        <p className="text-stone-400 text-lg mb-8">For those seeking a deeper, more spiritual Umrah</p>

        <div className="flex items-center justify-center gap-6 sm:gap-12">
          <div className="text-center">
            <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Depart</p>
            <p className="text-3xl font-bold text-[#C4A348]">25</p>
            <p className="text-sm text-stone-300">October</p>
          </div>
          <div className="w-px h-12 bg-zinc-700" />
          <div className="text-center space-y-1">
            <p className="text-sm text-stone-300">Jummah in Madinah</p>
            <p className="text-sm text-stone-300">Madinah First · Return from Makkah</p>
          </div>
          <div className="w-px h-12 bg-zinc-700" />
          <div className="text-center">
            <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Return</p>
            <p className="text-3xl font-bold text-[#C4A348]">04</p>
            <p className="text-sm text-stone-300">November</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* What's Included */}
        <section>
          <SectionHeading>What&apos;s Included</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {features.map(({ icon, label }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-stone-200 p-4 text-center shadow-sm"
              >
                <span className="text-2xl mb-2 block">{icon}</span>
                <p className="text-sm text-stone-700 font-medium leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Hotels */}
        <section>
          <SectionHeading>Hotels</SectionHeading>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 text-center">
              <p className="text-xs text-[#C4A348] font-semibold uppercase tracking-widest mb-2">Makkah</p>
              <p className="text-lg font-bold text-stone-900">Hilton Double Tree</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 text-center">
              <p className="text-xs text-[#C4A348] font-semibold uppercase tracking-widest mb-2">Madinah</p>
              <p className="text-lg font-bold text-stone-900">Elaf Al Taqwa</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <SectionHeading>Pricing</SectionHeading>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {pricing.map(({ type, price }) => (
              <div
                key={type}
                className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 text-center"
              >
                <p className="text-sm text-stone-500 font-medium mb-1">{type}</p>
                <p className="text-3xl font-bold text-stone-900">{price}</p>
                <p className="text-xs text-stone-400 mt-1">per person</p>
              </div>
            ))}
          </div>
          <div className="bg-[#C4A348]/10 border border-[#C4A348]/30 rounded-xl p-5 text-center">
            <p className="text-zinc-800 font-semibold">
              Secure your place for just <span className="text-[#C4A348] text-xl font-bold">£299</span>
            </p>
            <p className="text-stone-500 text-sm mt-1">Very limited places available</p>
          </div>
        </section>

        {/* Teachers */}
        <section>
          <SectionHeading>Our Teachers</SectionHeading>
          <div className="flex flex-col gap-10">
            {teachers.map(({ name, image, bio }) => (
              <div
                key={name}
                className="flex flex-col sm:flex-row gap-8 items-start bg-white rounded-2xl border border-stone-200 shadow-sm p-8"
              >
                <div className="shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={image}
                    alt={name}
                    width={160}
                    height={160}
                    className="rounded-full object-cover w-40 h-40 border-4 border-[#C4A348]/20"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-4">{name}</h3>
                  <div className="flex flex-col gap-3">
                    {bio.split('\n\n').map((para, i) => (
                      <p key={i} className="text-stone-600 leading-relaxed text-sm sm:text-base">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-[#2C1F0E] rounded-2xl p-8 text-center text-white">
          <p className="text-[#C4A348] font-semibold uppercase tracking-widest text-sm mb-3">
            Bookings &amp; Info
          </p>
          <a
            href="https://www.guidancetours.com"
            className="text-2xl sm:text-3xl font-bold hover:text-[#C4A348] transition-colors block mb-3"
          >
            www.guidancetours.com
          </a>
          <a
            href="https://wa.me/447983432900"
            className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-colors text-lg"
          >
            <svg className="w-5 h-5 text-[#C4A348]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            07983432900
          </a>
        </section>

      </div>
    </div>
  )
}
