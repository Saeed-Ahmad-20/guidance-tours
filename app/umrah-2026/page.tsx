'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const features = [
  { icon: '📖', label: 'Pre-Travel Seminar', desc: 'Prepare spiritually before departure' },
  { icon: '🌙', label: 'Spiritually Inspired Schedule', desc: 'Thoughtfully curated daily program' },
  { icon: '🎓', label: 'Daily Classes', desc: 'Learn from esteemed scholars' },
  { icon: '🕌', label: 'Guided Tours', desc: 'Explore sacred historical sites' },
  { icon: '✈️', label: 'Manchester Flight', desc: 'Direct flights included' },
  { icon: '📄', label: 'EVW Visa', desc: 'Visa processing handled for you' },
  { icon: '🍽️', label: 'Buffet Breakfast', desc: '10 nights of premium dining' },
  { icon: '🚄', label: 'High-Speed Train', desc: 'Madinah to Makkah in comfort' },
]

const pricing = [
  { type: 'Quad', price: 1745, badge: 'Best Value' },
  { type: 'Triple', price: 1845, badge: null },
  { type: 'Double', price: 1945, badge: 'Premium' },
]

const hotels = [
  {
    city: 'Makkah',
    hotel: 'Hilton Convention Jabal Omar',
    stars: 5,
    icon: '🕋',
    url: 'https://www.hilton.com/en/hotels/makchhi-hilton-hotel-and-convention-jabal-omar-makkah/',
  },
  {
    city: 'Madinah',
    hotel: 'Elaf Al Taqwa',
    stars: 4,
    icon: '🕌',
    url: 'https://www.elafhotels.com/elaf-al-taqwa',
  },
]

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-60px' })

  useEffect(() => {
    if (isInView) {
      const duration = 1500
      const startTime = Date.now()
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * target))
        if (progress >= 1) clearInterval(timer)
      }, 16)
      return () => clearInterval(timer)
    } else {
      setCount(0)
    }
  }, [isInView, target])

  return (
    <span ref={ref}>
      {suffix === '£' ? `£${count.toLocaleString()}` : `${count}${suffix}`}
    </span>
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

/* ── Floating particle ── */
function FloatingParticle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[#C4A348]/20"
      style={{ left: x, width: size, height: size }}
      initial={{ y: '100vh', opacity: 0 }}
      animate={{ y: '-10vh', opacity: [0, 0.6, 0.6, 0] }}
      transition={{ duration: 12, delay, repeat: Infinity, ease: 'linear' }}
    />
  )
}

/* ── Reversible scale-in ── */
function ScaleIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{
        duration: 0.4,
        delay: isInView ? delay : 0,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Expandable bio text ── */
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
   MAIN PAGE
   ════════════════════════════════════════════ */
export default function Umrah2026Page() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="w-full bg-stone-50 overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* FIXED: Reduced min-h on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a130a] via-[#2C1F0E] to-[#1a130a]" />

        <div className="absolute inset-0 overflow-hidden">
          <FloatingParticle delay={0} x="10%" size={6} />
          <FloatingParticle delay={2} x="25%" size={4} />
          <FloatingParticle delay={4} x="50%" size={8} />
          <FloatingParticle delay={1} x="70%" size={5} />
          <FloatingParticle delay={3} x="85%" size={6} />
          <FloatingParticle delay={5} x="40%" size={3} />
          <FloatingParticle delay={6} x="60%" size={7} />
        </div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] md:w-[600px] h-[350px] sm:h-[500px] md:h-[600px] rounded-full opacity-20"
          /* FIXED: Responsive radial glow size */
          style={{
            background: 'radial-gradient(circle, #C4A348 0%, transparent 70%)',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.1}px))`,
          }}
        />

        <div className="relative z-10 text-center px-4 sm:px-6 py-14 sm:py-20 max-w-4xl mx-auto">
          {/* FIXED: Reduced px and py on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-[#C4A348]/10 border border-[#C4A348]/30 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 mb-6 sm:mb-8 backdrop-blur-sm">
              {/* FIXED: Responsive padding */}
              <span className="w-2 h-2 rounded-full bg-[#C4A348] animate-pulse" />
              <p className="text-[#C4A348] font-semibold tracking-widest text-[10px] sm:text-xs uppercase">
                October Half-Term 2026
              </p>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-3 sm:mb-4 tracking-tight"
            /* FIXED: text-3xl base for mobile, progressive scaling */
          >
            Umrah{' '}
            <span className="bg-gradient-to-r from-[#C4A348] to-[#E8D48B] bg-clip-text text-transparent">
              Experience
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-stone-400 text-sm sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-md lg:max-w-xl mx-auto px-2"
            /* FIXED: text-sm base, responsive scaling, added px-2 */
          >
            For those seeking a deeper, more spiritual Umrah
          </motion.p>

          {/* ── DATE BAR — COMPLETELY REDESIGNED FOR MOBILE ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Mobile layout: stacked vertical */}
            <div className="sm:hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 max-w-[280px] mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-[9px] text-stone-500 uppercase tracking-[0.15em] mb-1 font-medium">Depart</p>
                  <p className="text-3xl font-bold text-[#C4A348]">25</p>
                  <p className="text-xs text-stone-300 mt-0.5">October</p>
                </div>

                <div className="flex flex-col items-center gap-1 px-3">
                  <svg className="w-4 h-4 text-[#C4A348]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                  <p className="text-[9px] text-stone-500">10 nights</p>
                </div>

                <div className="text-center">
                  <p className="text-[9px] text-stone-500 uppercase tracking-[0.15em] mb-1 font-medium">Return</p>
                  <p className="text-3xl font-bold text-[#C4A348]">04</p>
                  <p className="text-xs text-stone-300 mt-0.5">November</p>
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C4A348]/20 to-transparent mb-3" />

              <div className="text-center">
                <p className="text-sm font-semibold text-[#C4A348]">Jummah in Madinah</p>
                <p className="text-[11px] text-stone-300 mt-1 leading-snug">Madinah First · Return from Makkah</p>
              </div>
            </div>

            {/* Tablet/Desktop layout: horizontal */}
            <div className="hidden sm:inline-flex items-center gap-6 md:gap-10 lg:gap-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 lg:p-12">
              <div className="text-center">
                <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2 font-medium">Depart</p>
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#C4A348]">25</p>
                <p className="text-sm text-stone-300 mt-1">October</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-4 bg-[#C4A348]/40" />
                <svg className="w-5 h-5 text-[#C4A348]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
                <div className="w-px h-4 bg-[#C4A348]/40" />
              </div>

              <div className="text-center space-y-2 max-w-[220px]">
                <p className="text-2xl md:text-4xl lg:text-2xl font-bold text-[#C4A348] leading-tight whitespace-nowrap">Jummah in Madinah</p>
                <div className="w-10 h-px bg-[#C4A348]/40 mx-auto" />
                <p className="text-l text-stone-300 leading-snug">Madinah First · Return from Makkah</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-4 bg-[#C4A348]/40" />
                <svg className="w-5 h-5 text-[#C4A348]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
                <div className="w-px h-4 bg-[#C4A348]/40" />
              </div>

              <div className="text-center">
                <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2 font-medium">Return</p>
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#C4A348]">04</p>
                <p className="text-sm text-stone-300 mt-1">November</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mt-8 sm:mt-12 flex justify-center"
          >
            <Link
              href="/umrah-2026/book"
              className="group relative inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#C4A348] to-[#E8D48B] text-[#2C1F0E] font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg shadow-[#C4A348]/20 hover:shadow-xl hover:shadow-[#C4A348]/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span>Reserve Your Place</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 sm:mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Scroll to explore</p>
              <svg className="w-5 h-5 text-[#C4A348]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-12 py-16 sm:py-24 flex flex-col gap-16 sm:gap-24 md:gap-32">
        {/* FIXED: px-4 base, responsive py and gap */}

        {/* ── WHAT'S INCLUDED ── */}
        <section>
          <SectionHeading subtitle="Everything you need for a transformative spiritual journey">
            What&apos;s Included
          </SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {/* FIXED: Tighter gap on mobile */}
            {features.map(({ icon, label, desc }, i) => (
              <FadeInWhenVisible key={label} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="group relative bg-white rounded-xl sm:rounded-2xl border border-stone-200/80 p-3 sm:p-5 md:p-6 text-center shadow-sm hover:shadow-xl hover:shadow-[#C4A348]/5 hover:border-[#C4A348]/30 transition-all duration-500 cursor-default h-full"
                  /* FIXED: Smaller padding and radius on mobile */
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#C4A348]/5 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <span className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 block transition-transform duration-300 group-hover:scale-110">
                      {/* FIXED: Smaller emoji on mobile */}
                      {icon}
                    </span>
                    <p className="text-xs sm:text-sm md:text-base text-stone-800 font-semibold leading-snug mb-0.5 sm:mb-1">
                      {/* FIXED: Smaller text on mobile */}
                      {label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-stone-400 leading-relaxed hidden sm:block">{desc}</p>
                  </div>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>

        {/* ── HOTELS ── */}
        <section>
          <SectionHeading subtitle="Premium accommodation steps away from the Haram">Hotels</SectionHeading>
          <p className="text-center text-xs sm:text-sm text-stone-400 -mt-6 sm:-mt-8 mb-6 sm:mb-8 px-2">
            {/* FIXED: Responsive sizing and spacing */}
            Click on a hotel to view details and photos on their official website
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* FIXED: Single column on mobile */}
            {hotels.map((item, i) => (
              <FadeInWhenVisible key={item.city} delay={i * 0.15} direction={i === 0 ? 'left' : 'right'}>
                <motion.a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="group relative block overflow-hidden bg-white rounded-xl sm:rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-xl hover:shadow-[#C4A348]/5 transition-all duration-500 cursor-pointer"
                  /* FIXED: Smaller radius on mobile */
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4A348]/0 via-[#C4A348] to-[#C4A348]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="p-6 sm:p-8 text-center">
                    {/* FIXED: Reduced padding on mobile */}
                    <span className="text-3xl sm:text-4xl block mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110">
                      {/* FIXED: Smaller emoji on mobile */}
                      {item.icon}
                    </span>
                    <p className="text-[10px] sm:text-xs text-[#C4A348] font-bold uppercase tracking-[0.25em] mb-2 sm:mb-3">
                      {item.city}
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-2 sm:mb-3">
                      {/* FIXED: Responsive font sizing */}
                      {item.hotel}
                    </p>
                    <p className="text-[10px] sm:text-xs text-stone-400 -mt-1 mb-2 sm:mb-3">or similar</p>
                    <div className="flex items-center justify-center gap-1 mb-3 sm:mb-4">
                      {Array.from({ length: item.stars }).map((_, j) => (
                        <ScaleIn key={j} delay={0.3 + j * 0.08}>
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C4A348]" fill="currentColor" viewBox="0 0 20 20">
                            {/* FIXED: Smaller stars on mobile */}
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </ScaleIn>
                      ))}
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-stone-400 group-hover:text-[#C4A348] transition-colors duration-300">
                      <span>View hotel</span>
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </motion.a>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section>
          <SectionHeading subtitle="Transparent pricing with no hidden fees">Pricing</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {/* FIXED: Single column on mobile, responsive gap */}
            {pricing.map(({ type, price, badge }, i) => (
              <FadeInWhenVisible key={type} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className={`group relative bg-white rounded-xl sm:rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-500 p-6 sm:p-8 text-center ${
                    /* FIXED: Smaller padding and radius on mobile */
                    i === 2
                      ? 'border-[#C4A348]/40 hover:shadow-[#C4A348]/10 ring-1 ring-[#C4A348]/10'
                      : 'border-stone-200/80 hover:shadow-[#C4A348]/5 hover:border-[#C4A348]/30'
                  }`}
                >
                  {badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-[#C4A348] to-[#E8D48B] text-[#2C1F0E] text-[10px] font-bold uppercase tracking-widest px-3 sm:px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                        {/* FIXED: Responsive padding, whitespace-nowrap */}
                        {badge}
                      </span>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-stone-500 font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                    {/* FIXED: Responsive sizing */}
                    {type}
                  </p>
                  <div className="mb-1">
                    <p className="text-[10px] sm:text-xs text-stone-400 mb-1">from</p>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900">
                      {/* FIXED: Smaller on mobile */}
                      <AnimatedCounter target={price} suffix="£" />
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-400 mb-4 sm:mb-6">per person</p>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
                  <p className="text-[10px] sm:text-xs text-stone-400 mt-3 sm:mt-4">All-inclusive package</p>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>

          <p className="text-center text-[10px] sm:text-xs text-stone-400 -mt-2 sm:-mt-4 mb-6 sm:mb-8 px-2">
            Prices shown are subject to increase — book early to secure the current rate.
          </p>

          <FadeInWhenVisible delay={0.3}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative overflow-hidden bg-gradient-to-r from-[#2C1F0E] to-[#3d2c16] rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center"
              /* FIXED: Smaller padding and radius on mobile */
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNDNEEzNDgiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 bg-[#C4A348]/20 border border-[#C4A348]/30 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4"
                  /* FIXED: Responsive padding */
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C4A348] animate-pulse" />
                  <span className="text-[#C4A348] text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Limited Availability</span>
                </motion.div>
                <p className="text-white text-base sm:text-xl font-bold mb-1.5 sm:mb-2">
                  {/* FIXED: Smaller base text */}
                  Secure your place for just{' '}
                  <span className="bg-gradient-to-r from-[#C4A348] to-[#E8D48B] bg-clip-text text-transparent text-2xl sm:text-3xl">
                    {/* FIXED: Smaller on mobile */}
                    £299
                  </span>
                </p>
                <p className="text-stone-400 text-[10px] sm:text-sm px-2">
                  {/* FIXED: Smaller text, added px for breathing room */}
                  Deposit is non-refundable · Balance due 8 weeks before departure
                </p>
                <Link
                  href="/umrah-2026/book"
                  className="group mt-5 sm:mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-[#C4A348] to-[#E8D48B] text-[#2C1F0E] font-bold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-full shadow-lg shadow-[#C4A348]/20 hover:shadow-xl hover:shadow-[#C4A348]/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span>Book Now</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </FadeInWhenVisible>
        </section>

        {/* ── CONTACT ── */}
        <FadeInWhenVisible>
          <section className="relative overflow-hidden bg-gradient-to-br from-[#2C1F0E] via-[#352616] to-[#1a130a] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 text-center">
            {/* FIXED: Smaller padding and radius on mobile */}
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-[#C4A348]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-[#C4A348]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <ScaleIn delay={0.2}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-[#C4A348]/10 border border-[#C4A348]/20 flex items-center justify-center">
                  {/* FIXED: Smaller on mobile */}
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#C4A348]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
              </ScaleIn>

              <p className="text-[#C4A348] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs mb-4 sm:mb-6">
                {/* FIXED: Responsive tracking and size */}
                Bookings &amp; Info
              </p>

              <motion.a
                href="https://www.guidancetours.co.uk"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block text-sm sm:text-xl md:text-2xl lg:text-4xl font-bold text-white hover:text-[#C4A348] transition-colors duration-300 mb-4 sm:mb-6 break-all sm:break-normal"
                /* FIXED: text-sm base instead of text-4xl, break-all prevents overflow on tiny screens */
              >
                www.guidancetours.co.uk
              </motion.a>

              <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-[#C4A348]/40 to-transparent mx-auto mb-4 sm:mb-6" />

              <motion.a
                href="https://wa.me/447983432900"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 sm:gap-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 hover:border-[#25D366]/40 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300"
                /* FIXED: Responsive padding */
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  {/* FIXED: Smaller icon on mobile */}
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-white font-semibold text-xs sm:text-base">07983432900</span>
                {/* FIXED: Smaller text on mobile */}
              </motion.a>
            </div>
          </section>
        </FadeInWhenVisible>
      </div>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C4A348] to-transparent opacity-30" />
    </div>
  )
}