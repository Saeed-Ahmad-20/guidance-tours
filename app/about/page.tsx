'use client'

import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const teamMembers = [
  { name: 'Omar', icon: '🤝' },
  { name: 'Ifraz', icon: '🌟' },
  { name: 'Saeed', icon: '🕌' },
]

const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'خدمت — Service',
    desc: 'Serving pilgrims with sincerity, care, and attention to every detail',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Trust & Reliability',
    desc: 'Dependable planning, transparent communication, and promises kept',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: 'عبادہ — Worship Focus',
    desc: 'We handle the logistics so you can fully dedicate yourself to worship',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Personal Touch',
    desc: 'Every pilgrim is treated as family — because that\'s what you are to us',
  },
]

const teachers = [
  {
    name: 'Shaykh Waseem Ahmed',
    image: '/images/Shaykh Waseem.webp',
    bio: `Imagine performing your Umrah guided by a scholar who spent years walking the ancient streets of Damascus, studying at the feet of some of the Muslim world's most revered teachers. That's exactly what you'll experience with Shaykh Waseem Ahmed by your side.

Shaykh Waseem's journey into sacred knowledge began with intensive Arabic studies in the UK before he moved to Damascus in 2005, immersing himself fully in the Islamic scholarly tradition. Under the personal mentorship of luminaries such as Shaykh Ahmad Al-Khatib, Shaykh Anas Al-Sharfawi, Shaykh Muhammad Al-Yaqoubi, and Shaykh Muhammad Jumu'a, he completed rigorous studies spanning Aqidah (Doctrine), Fiqh (Jurisprudence), Spirituality, Arabic Grammar, and Rhetoric — graduating from the prestigious Dawli Institute in 2012.

Since returning to the UK, Shaykh Waseem has become one of the most sought-after Islamic educators in the country, delivering transformative lectures and courses nationwide. As co-founder of the ISNAD Institute and director of Guidance Hub, he brings not just deep knowledge but a rare ability to make the sacred sciences come alive — turning every moment of your Umrah journey into an opportunity for spiritual growth and lasting connection with the Divine.`,
    quote: 'Do not set out on a journey except to three mosques: Al-Masjid Al-Haram, this mosque of mine, and Al-Masjid Al-Aqsa.',
    quoteRef: '— Prophet Muhammad ﷺ (Sahih al-Bukhari, 1189)',
  },
  {
    name: 'Ustadh Saqib Rashid',
    image: '/images/Ustadh Saqib.jpeg',
    bio: `Your Umrah experience will be further enriched by the presence of Ustadh Saqib Rashid — a dedicated teacher, gifted munshid, and scholar whose passion for authentic Islamic learning and spiritual devotion is truly contagious.

With a strong foundation in the traditional Dars e Nizami programme and advanced Arabic Grammar & Language, Ustadh Saqib has pursued knowledge both in the UK and abroad, studying under the guidance of distinguished Syrian and Egyptian scholars. He is currently deepening his expertise in the Maliki School of Law under qualified Egyptian jurists while studying with the renowned Shaykh Ahmed Saad Al-Azhary, and is actively advancing his knowledge of Qur'anic recitation (Qiraat) with Syrian masters.

Beyond his scholarly pursuits, Ustadh Saqib is a talented munshid whose soul-stirring nasheeds have moved hearts across communities. Whether he's leading a heartfelt nasheed gathering under the Madinah night sky, breaking down a point of sacred law during a morning class, or helping you perfect the recitation you'll carry into Tawaf — Ustadh Saqib's warmth, spiritual presence, and dedication will make your journey truly unforgettable.`,
    quote: 'The performers of Umrah are the guests of Allah. He called them and they answered, and they ask of Him and He gives them.',
    quoteRef: '— Prophet Muhammad ﷺ (Sunan Ibn Majah, 2892)',
  },
]

/* ── Floating particle ── */
function FloatingParticle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[#C4A348]/15 pointer-events-none"
      style={{ left: x, width: size, height: size }}
      initial={{ y: '100vh', opacity: 0 }}
      animate={{ y: '-10vh', opacity: [0, 0.5, 0.5, 0] }}
      transition={{ duration: 14, delay, repeat: Infinity, ease: 'linear' }}
    />
  )
}

/* ── Reversible fade-in ── */
function FadeInWhenVisible({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-80px' })

  const directionMap = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { y: 0, x: 50 },
    right: { y: 0, x: -50 },
    none: { y: 0, x: 0 },
  }

  return (
    <motion.div
      ref={ref}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }
          : {
              opacity: 0,
              y: directionMap[direction].y,
              x: directionMap[direction].x,
              filter: 'blur(4px)',
            }
      }
      transition={{
        duration: 0.6,
        delay: isInView ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Section heading ── */
function SectionHeading({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 30, filter: 'blur(4px)' }
      }
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center mb-10 sm:mb-14"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">
        {children}
      </h2>
      {subtitle && (
        <p className="text-stone-500 text-sm sm:text-base md:text-lg max-w-lg mx-auto mb-4 px-2">
          {subtitle}
        </p>
      )}
      <div className="flex items-center justify-center gap-2 mt-4">
        <motion.div
          animate={isInView ? { width: 32 } : { width: 0 }}
          transition={{ duration: 0.5, delay: isInView ? 0.3 : 0 }}
          className="h-[2px] bg-gradient-to-r from-transparent to-[#C4A348]"
        />
        <motion.div
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.3, delay: isInView ? 0.5 : 0, type: 'spring' }}
          className="w-2 h-2 rounded-full bg-[#C4A348]"
        />
        <motion.div
          animate={isInView ? { width: 32 } : { width: 0 }}
          transition={{ duration: 0.5, delay: isInView ? 0.3 : 0 }}
          className="h-[2px] bg-gradient-to-l from-transparent to-[#C4A348]"
        />
      </div>
    </motion.div>
  )
}

/* ── Expandable bio ── */
function ExpandableBio({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = bio.split('\n\n')
  const preview = paragraphs[0]
  const rest = paragraphs.slice(1)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-stone-300 leading-relaxed text-sm sm:text-[15px]">{preview}</p>

      <motion.div
        initial={false}
        animate={{
          height: expanded ? 'auto' : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-4">
          {rest.map((para, j) => (
            <p key={j} className="text-stone-300 leading-relaxed text-sm sm:text-[15px]">
              {para}
            </p>
          ))}
        </div>
      </motion.div>

      {rest.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 text-[#C4A348] text-sm font-medium hover:text-[#E8D48B] transition-colors duration-300 self-center sm:self-start group"
        >
          <span>{expanded ? 'Read less' : 'Read full biography'}</span>
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   ABOUT PAGE
   ════════════════════════════════════════════ */
export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="w-full bg-stone-50 overflow-hidden">
      {/* ═══════════════════════════════════
          HERO — REDESIGNED (NO TEAM MEMBERS)
          ═══════════════════════════════════ */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a130a] via-[#2C1F0E] to-[#1a130a]" />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingParticle delay={0} x="12%" size={5} />
          <FloatingParticle delay={2} x="30%" size={4} />
          <FloatingParticle delay={4} x="55%" size={7} />
          <FloatingParticle delay={1} x="72%" size={5} />
          <FloatingParticle delay={3} x="88%" size={4} />
        </div>

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full opacity-15 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C4A348 0%, transparent 65%)',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.08}px))`,
          }}
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(196,163,72,0.06) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 py-16 sm:py-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-[#C4A348]/10 border border-[#C4A348]/30 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 mb-6 sm:mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#C4A348] animate-pulse" />
              <p className="text-[#C4A348] font-semibold tracking-widest text-[10px] sm:text-xs uppercase">About Us</p>
            </div>
          </motion.div>

          {/* Arabic decorative text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-[#C4A348]/40 text-3xl sm:text-5xl font-light mb-4 sm:mb-6"
            style={{ fontFamily: 'serif' }}
          >
            بِسْمِ ٱللَّٰهِ
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-5 tracking-tight"
          >
            Guiding You{' '}
            <span className="bg-gradient-to-r from-[#C4A348] to-[#E8D48B] bg-clip-text text-transparent">
              Closer
            </span>
            <br className="hidden sm:block" />
            {' '}to the Sacred
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-stone-400 text-sm sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed px-2"
          >
            A team built on{' '}
            <span className="text-[#C4A348] font-semibold">خدمت</span> (service),{' '}
            <span className="text-[#C4A348] font-semibold">trust</span>, and a deep love for
            helping pilgrims experience the journey of a lifetime
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center justify-center gap-3 mb-8 sm:mb-10"
          >
            <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#C4A348]/40" />
            <div className="w-2 h-2 rounded-full bg-[#C4A348]/30" />
            <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#C4A348]/40" />
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="max-w-md mx-auto"
          >
            <blockquote className="relative">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#C4A348]/20 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-stone-400/70 italic text-xs sm:text-sm leading-relaxed px-4">
                &ldquo;Whoever takes a path to seek knowledge, Allah will make easy for him the path to Paradise.&rdquo;
              </p>
              <p className="text-[#C4A348]/40 text-[10px] sm:text-xs mt-2 font-medium">
                — Prophet Muhammad ﷺ (Sahih Muslim, 2699)
              </p>
            </blockquote>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-10 sm:mt-14"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-stone-500 text-[10px] sm:text-xs tracking-widest uppercase">Discover our story</p>
              <svg className="w-4 h-4 text-[#C4A348]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          OUR MISSION
          ═══════════════════════════════════ */}
      <section className="relative py-16 sm:py-24 md:py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C4A348]/20 to-transparent" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-[#C4A348]/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-56 h-56 bg-[#C4A348]/3 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeading subtitle="What drives us and how we serve you">Our Mission</SectionHeading>

          {/* Mission statement card */}
          <FadeInWhenVisible>
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-12 sm:mb-16">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a130a] via-[#2C1F0E] to-[#1a130a]" />
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#C4A348]/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#C4A348]/5 rounded-full blur-3xl" />
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(196,163,72,0.07) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C4A348]/50 to-transparent" />

              <div className="relative p-5 sm:p-8 md:p-12 lg:p-16">
                {/* Opening quote icon */}
                <div className="flex justify-center sm:justify-start mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C4A348]/10 border border-[#C4A348]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#C4A348]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
                  <p className="text-stone-300 leading-relaxed text-sm sm:text-base md:text-lg">
                    Our mission is to support and guide pilgrims through their sacred Umrah journey with care, sincerity, and attention to every detail.
                  </p>
                  <p className="text-stone-300/80 leading-relaxed text-xs sm:text-sm md:text-base">
                    We understand how important this journey is, both spiritually and personally. That&apos;s why we focus on making your experience as smooth and stress-free as possible, handling the planning, coordination, and on-ground support so you can fully dedicate yourself to{' '}
                    <span className="text-[#C4A348] font-semibold">عبادہ</span> (worship).
                  </p>
                  <p className="text-stone-300/80 leading-relaxed text-xs sm:text-sm md:text-base">
                    Alongside Umrah, we also offer thoughtfully arranged guided tours, designed to provide comfort, insight, and memorable experiences. For us, it&apos;s not just about travel — it&apos;s about creating a journey that is meaningful, enriching, and truly special.
                  </p>
                  <p className="text-stone-300/80 leading-relaxed text-xs sm:text-sm md:text-base">
                    We are committed to serving you with trust, reliability, and a personal touch every step of the way.
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6 sm:my-8 justify-center sm:justify-start">
                  <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#C4A348]/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C4A348]/40" />
                  <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#C4A348]/40" />
                </div>

                {/* Signature */}
                <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                  <div className="flex -space-x-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C4A348]/10 border-2 border-[#2C1F0E] flex items-center justify-center text-xs sm:text-sm"
                      >
                        {member.icon}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs sm:text-sm">Omar, Ifraz & Saeed</p>
                    <p className="text-stone-500 text-[10px] sm:text-xs">Founders, Guidance Tours</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A348]/20 to-transparent" />
            </div>
          </FadeInWhenVisible>

          {/* Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {values.map((value, i) => (
              <FadeInWhenVisible key={value.title} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="group relative bg-white rounded-xl sm:rounded-2xl border border-stone-200/80 p-4 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-[#C4A348]/5 hover:border-[#C4A348]/30 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#C4A348]/5 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#C4A348]/10 border border-[#C4A348]/20 flex items-center justify-center text-[#C4A348] group-hover:bg-[#C4A348]/20 transition-colors duration-500">
                      {value.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-stone-900 font-bold text-sm sm:text-base mb-1">{value.title}</h3>
                      <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">{value.desc}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          TEACHERS SECTION
          ═══════════════════════════════════ */}
      <section className="relative py-16 sm:py-24 md:py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading subtitle="Your guides on this sacred journey — scholars who bring knowledge to life">
            Your Teachers
          </SectionHeading>

          <div className="flex flex-col gap-6 sm:gap-10">
            {teachers.map(({ name, image, bio, quote, quoteRef }, i) => (
              <FadeInWhenVisible key={name} delay={i * 0.2}>
                <div className="group relative">
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
                  >
                    {/* Dark background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a130a] via-[#2C1F0E] to-[#1a130a]" />
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#C4A348]/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#C4A348]/5 rounded-full blur-3xl" />
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(196,163,72,0.07) 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C4A348]/50 to-transparent" />

                    <div className="relative p-5 sm:p-8 md:p-12">
                      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 items-center sm:items-start">
                        {/* Photo column */}
                        <div className="shrink-0 flex flex-col items-center gap-4 sm:gap-5">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="relative"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                              className="absolute -inset-3 rounded-full"
                              style={{
                                background: 'conic-gradient(from 0deg, transparent, #C4A348, transparent, transparent)',
                                opacity: 0.3,
                              }}
                            />
                            <div className="absolute -inset-3 rounded-full bg-[#2C1F0E]" style={{ margin: '2px' }} />
                            <div className="absolute -inset-4 bg-[#C4A348]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Image
                              src={image}
                              alt={name}
                              width={200}
                              height={200}
                              className="relative rounded-full object-cover w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 border-[3px] border-[#C4A348]/30 group-hover:border-[#C4A348]/60 transition-all duration-500 shadow-2xl"
                            />
                          </motion.div>
                        </div>
                        {/* End photo column */}

                        {/* Content column */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <div className="mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                              {name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-3 mb-4 sm:mb-6 justify-center sm:justify-start">
                            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#C4A348]/40" />
                            <svg className="w-4 h-4 text-[#C4A348]/40" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                            </svg>
                            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#C4A348]/40" />
                          </div>

                          <ExpandableBio bio={bio} />

                          {quote && (
                            <div className="mt-6 sm:mt-8 relative">
                              <div className="absolute -left-2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#C4A348]/60 via-[#C4A348]/20 to-transparent hidden sm:block" />
                              <blockquote className="pl-0 sm:pl-6 italic text-stone-400/80 text-xs sm:text-sm leading-relaxed">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#C4A348]/30 mb-2 mx-auto sm:mx-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                                <p>&ldquo;{quote}&rdquo;</p>
                                {quoteRef && (
                                  <p className="text-[#C4A348]/50 text-[10px] sm:text-xs mt-2 not-italic font-medium">
                                    {quoteRef}
                                  </p>
                                )}
                              </blockquote>
                            </div>
                          )}
                        </div>
                        {/* End content column */}
                      </div>
                      {/* End flex row */}
                    </div>
                    {/* End relative padding wrapper */}

                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A348]/20 to-transparent" />
                  </motion.div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          BOTTOM CONTACT BAR
          ═══════════════════════════════════ */}
      <FadeInWhenVisible>
        <section className="relative overflow-hidden bg-gradient-to-r from-[#2C1F0E] via-[#352616] to-[#2C1F0E] py-8 sm:py-10">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(196,163,72,0.08) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-between gap-5 sm:gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-[#C4A348] font-bold uppercase tracking-[0.2em] text-[10px] mb-1">Ready to begin?</p>
              <p className="text-white font-semibold text-base sm:text-lg">Let us help you plan your journey</p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
              <motion.a
                href="https://www.guidancetours.co.uk"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C4A348]/30 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 transition-all duration-300"
              >
                <svg className="w-4 h-4 text-[#C4A348]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <span className="text-white text-xs sm:text-sm font-medium">Website</span>
              </motion.a>

              <motion.a
                href="https://wa.me/447983432900"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 hover:border-[#25D366]/40 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 transition-all duration-300"
              >
                <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-white text-xs sm:text-sm font-medium">WhatsApp</span>
              </motion.a>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* Footer accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C4A348] to-transparent opacity-30" />
    </div>
  )
}