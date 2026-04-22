'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

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
function FadeIn({
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
  const isInView = useInView(ref, { margin: '-60px' })

  const directionMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
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
        duration: 0.7,
        delay: isInView ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Scale-in ── */
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
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
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

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="flex flex-col w-full bg-stone-50 overflow-hidden">
      {/* ═══════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a130a] via-[#2C1F0E] to-[#1a130a]" />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingParticle delay={0} x="8%" size={5} />
          <FloatingParticle delay={3} x="20%" size={4} />
          <FloatingParticle delay={1} x="35%" size={7} />
          <FloatingParticle delay={5} x="50%" size={3} />
          <FloatingParticle delay={2} x="65%" size={6} />
          <FloatingParticle delay={4} x="80%" size={4} />
          <FloatingParticle delay={6} x="92%" size={5} />
        </div>

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full opacity-15 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C4A348 0%, transparent 65%)',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.08}px))`,
          }}
        />

        {/* Subtle geometric pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(196,163,72,0.06) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-12"
          >
            <div className="relative">
              {/* Logo glow */}
              <div className="absolute inset-0 bg-[#C4A348]/10 rounded-full blur-3xl scale-150" />
              <Image
                src="/images/logo.png"
                alt="Guidance Tours"
                width={300}
                height={300}
                priority
                className="relative drop-shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white max-w-2xl leading-tight tracking-tight">
              Our First Journey
            </h1>
            <h1 className="text-4xl sm:text-6xl font-bold max-w-2xl leading-tight tracking-tight mt-2">
              <span className="bg-gradient-to-r from-[#C4A348] to-[#E8D48B] bg-clip-text text-transparent">
                Is Ready For Takeoff
              </span>
            </h1>
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#C4A348]/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C4A348]/60" />
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#C4A348]/50" />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-stone-400 text-lg sm:text-xl max-w-lg leading-relaxed mb-12"
          >
            We are honoured to announce that Guidance Tours is preparing its first
            blessed journey to the sacred cities of Makkah and Madinah.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Link href="/umrah-2026">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#C4A348] to-[#B8932E] hover:from-[#d4b358] hover:to-[#C4A348] text-[#1a130a] font-bold text-sm sm:text-base px-8 py-4 rounded-full shadow-lg shadow-[#C4A348]/20 hover:shadow-xl hover:shadow-[#C4A348]/30 transition-all duration-300"
              >
                <span>Discover Our Umrah Experience</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </motion.div>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-20"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">See our journey</p>
              <svg className="w-5 h-5 text-[#C4A348]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FEATURED JOURNEY SECTION
          ═══════════════════════════════════ */}
      <section className="relative py-24 sm:py-32">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C4A348]/20 to-transparent" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-[#C4A348]/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-56 h-56 bg-[#C4A348]/3 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6">
          {/* Section header */}
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#C4A348]/10 border border-[#C4A348]/20 rounded-full px-5 py-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#C4A348] animate-pulse" />
                <p className="text-[#C4A348] font-semibold tracking-widest text-xs uppercase">
                  Featured Journey
                </p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight mb-4">
                Umrah Experience{' '}
                <span className="bg-gradient-to-r from-[#C4A348] to-[#B8932E] bg-clip-text text-transparent">
                  2026
                </span>
              </h2>
              <p className="text-stone-500 text-base sm:text-lg max-w-md mx-auto">
                October Half-Term · A spiritually immersive journey to the Holy Lands
              </p>

              {/* Decorative divider */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-[#C4A348]" />
                <div className="w-2 h-2 rounded-full bg-[#C4A348]" />
                <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-[#C4A348]" />
              </div>
            </div>
          </FadeIn>

          {/* Poster + Info layout */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Poster */}
            <FadeIn delay={0.2} direction="left" className="w-full lg:w-1/2 flex justify-center">
              <Link href="/umrah-2026" className="group block">
                <motion.div
                  whileHover={{ y: -8, rotate: -0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  {/* Glow behind poster */}
                  <div className="absolute -inset-4 bg-gradient-to-b from-[#C4A348]/10 to-[#C4A348]/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Poster frame */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-stone-900/20 max-w-sm w-full ring-1 ring-stone-200/80 group-hover:ring-[#C4A348]/40 group-hover:shadow-[#C4A348]/10 transition-all duration-500">
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C4A348] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                    <Image
                      src="/images/Poster.jpeg"
                      alt="Umrah 2026 — October Half-Term Experience"
                      width={600}
                      height={800}
                      className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a130a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5">
                        <span className="text-white text-sm font-semibold">View Full Details</span>
                        <svg
                          className="w-4 h-4 text-[#C4A348] transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </FadeIn>

            {/* Info card */}
            <FadeIn delay={0.4} direction="right" className="w-full lg:w-1/2">
              <div className="space-y-8">
                {/* Quick facts */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Dates', value: '25 Oct – 4 Nov', icon: '📅' },
                    { label: 'Duration', value: '10 Nights', icon: '🌙' },
                    { label: 'From', value: '£1,695 pp', icon: '💷' },
                    { label: 'Deposit', value: '£299', icon: '✅' },
                  ].map((item, i) => (
                    <ScaleIn key={item.label} delay={0.5 + i * 0.1}>
                      <motion.div
                        whileHover={{ y: -3, scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="group/card bg-white rounded-xl border border-stone-200/80 p-4 shadow-sm hover:shadow-lg hover:shadow-[#C4A348]/5 hover:border-[#C4A348]/30 transition-all duration-500"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">{item.label}</p>
                            <p className="text-stone-900 font-bold text-sm mt-0.5">{item.value}</p>
                          </div>
                        </div>
                      </motion.div>
                    </ScaleIn>
                  ))}
                </div>

                {/* Highlights */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
                  <p className="text-xs text-[#C4A348] font-bold uppercase tracking-[0.2em] mb-4">Journey Highlights</p>
                  <div className="space-y-3">
                    {[
                      'Jummah prayer in Masjid An-Nabawi',
                      'Daily classes with esteemed scholars',
                      'High-speed train from Madinah to Makkah',
                      'Premium 4★ hotels near the Haram',
                      'Guided tours of sacred historical sites',
                    ].map((highlight, i) => (
                      <FadeIn key={highlight} delay={0.7 + i * 0.08}>
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-5 h-5 rounded-full bg-[#C4A348]/10 flex items-center justify-center">
                            <svg className="w-3 h-3 text-[#C4A348]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-stone-600 text-sm">{highlight}</p>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <FadeIn delay={1}>
                  <Link href="/umrah-2026">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group/btn w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#2C1F0E] to-[#3d2c16] hover:from-[#3d2c16] hover:to-[#4a3520] text-white font-semibold text-sm px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#C4A348]/20 hover:border-[#C4A348]/40"
                    >
                      <span>Explore This Journey</span>
                      <svg
                        className="w-4 h-4 text-[#C4A348] transition-transform duration-300 group-hover/btn:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                      </svg>
                    </motion.div>
                  </Link>
                </FadeIn>

                {/* Urgency note */}
                <FadeIn delay={1.1}>
                  <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-red-400"
                    />
                    <span>Very limited places available — secure yours today</span>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          BOTTOM CONTACT BAR
          ═══════════════════════════════════ */}
      <FadeIn>
        <section className="relative overflow-hidden bg-gradient-to-r from-[#2C1F0E] via-[#352616] to-[#2C1F0E] py-10">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(196,163,72,0.08) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-[#C4A348] font-bold uppercase tracking-[0.2em] text-[10px] mb-1">
                Questions?
              </p>
              <p className="text-white font-semibold text-lg">Get in touch with our team</p>
            </div>

            <div className="flex items-center gap-4">
              <motion.a
                href="https://www.guidancetours.co.uk"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C4A348]/30 rounded-full px-5 py-2.5 transition-all duration-300"
              >
                <svg className="w-4 h-4 text-[#C4A348]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <span className="text-white text-sm font-medium">Website</span>
              </motion.a>

              <motion.a
                href="https://wa.me/447983432900"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 hover:border-[#25D366]/40 rounded-full px-5 py-2.5 transition-all duration-300"
              >
                <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-white text-sm font-medium">WhatsApp</span>
              </motion.a>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Footer accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C4A348] to-transparent opacity-30" />
    </div>
  )
}