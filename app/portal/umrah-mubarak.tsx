'use client'

import { useEffect, useRef, useState } from 'react'
import { Amiri, Noto_Nastaliq_Urdu, Playfair_Display } from 'next/font/google'

// The typefaces the words settle into once the dots have formed them: a serif for English, Naskh
// for Arabic and Nasta'liq, the usual calligraphic hand for Urdu.
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'], style: ['normal', 'italic'] })
const amiri = Amiri({ subsets: ['arabic'], weight: ['400', '700'] })
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['arabic'], weight: ['400', '700'] })

// Everything is laid out on a 1600×1132 landscape certificate (the A-series ratio, so it prints
// cleanly) and scaled to whatever canvas it is drawn on.
const W = 1600
const H = 1132

// The whole animation runs as long as the talbiyah recording, so the two finish together.
const TOTAL_MS = 17000
// The sequence keeps its proportions (a short tawaf, then the words), just played slower so it
// settles a second before the recording ends. Every timing below is scaled by PACE.
const PACE = (TOTAL_MS - 1000) / 4900
const ARRIVE_MS = 1500 * PACE // dots stream in and join the tawaf
const ARRIVE_FLY_MS = 1000 * PACE // each dot's flight in from the edge
const ROUND_MS = 950 * PACE // one circuit of the innermost ring
const TAWAF_END = ARRIVE_MS + 1000 * PACE // a short spell of circling before the words form
const MOVE_MS = 1500 * PACE // the Ka'bah scene glides into its place on the certificate
const PEEL_MS = 600 * PACE // dots leave the tawaf, sweeping across the words in reading order
const FLY_MS = 1100 * PACE // each dot's flight to its place in the words
const FORMED_MS = TAWAF_END + PEEL_MS + FLY_MS
const DONE_MS = FORMED_MS + 700 * PACE
const ORBITERS = 550 // dots that keep circling once the words have formed

const GOLD = '#C4A348' // the Ka'bah's own gold, the same in both themes

export type ThemeName = 'dark' | 'light'

type Theme = {
  bg: string
  bgRgb: string // for the partly transparent wash that leaves the trails
  gold: string // frame, headings and rules
  goldSoft: string
  divider: string
  ground: string
  dot: string
  dotGold: string
  titleDot: string
  nameDot: string
  titleTop: string
  titleBottom: string
  glow: string
  glowBlur: number
  name: string
  body: string
  muted: string
}

const THEMES: Record<ThemeName, Theme> = {
  dark: {
    bg: '#1a130a',
    bgRgb: '26, 19, 10',
    gold: GOLD,
    goldSoft: 'rgba(196, 163, 72, 0.55)',
    divider: 'rgba(196, 163, 72, 0.22)',
    ground: 'rgba(196, 163, 72, 0.06)',
    dot: 'rgba(245, 238, 224, 0.85)',
    dotGold: 'rgba(212, 180, 90, 0.95)',
    titleDot: 'rgba(250, 244, 230, 0.95)',
    nameDot: 'rgba(233, 217, 166, 0.95)',
    titleTop: '#fff8e6',
    titleBottom: '#d6b462',
    glow: 'rgba(196, 163, 72, 0.45)',
    glowBlur: 24,
    name: '#e9d9a6',
    body: 'rgba(231, 225, 214, 0.85)',
    muted: 'rgba(214, 211, 209, 0.7)',
  },
  // Parchment, with the gold deepened so it reads on cream.
  light: {
    bg: '#f7f1e3',
    bgRgb: '247, 241, 227',
    gold: '#a8862f',
    goldSoft: 'rgba(168, 134, 47, 0.5)',
    divider: 'rgba(168, 134, 47, 0.3)',
    ground: 'rgba(120, 95, 40, 0.12)',
    dot: 'rgba(58, 44, 26, 0.75)',
    dotGold: 'rgba(176, 138, 48, 0.95)',
    titleDot: 'rgba(74, 56, 20, 0.9)',
    nameDot: 'rgba(150, 115, 40, 0.95)',
    titleTop: '#b8943c',
    titleBottom: '#5e4718',
    glow: 'rgba(168, 134, 47, 0.2)',
    glowBlur: 10,
    name: '#8a6a22',
    body: 'rgba(52, 40, 24, 0.88)',
    muted: 'rgba(70, 56, 36, 0.72)',
  },
}

// The Ka'bah scene is drawn in its own "world" coordinates, then placed on the certificate:
// large in the middle for the tawaf, then settling as the emblem on the left.
// The tawaf, seen from the side: a ring on the ground squashed into an ellipse.
const KX = 540
const OX = 600 // the tawaf circles the Ka'bah and Hijr Isma'il together
const GROUND_Y = 1290
const TILT = 0.3
const MIN_R = 300
const MAX_R = 470
const PIVOT = { x: OX, y: 1187 } // the middle of the scene, from the top of the Ka'bah to the front of the ring
const PLACE_START = { x: W / 2, y: 580, s: 0.9 }
const PLACE_END = { y: 560, s: 0.56 }
const TEXT_W = 780

// The emblem sits on the side a reader starts from, with the wording in the other column,
// centred between the dividing rule and the inner border.
type Layout = { rtl: boolean; divider: number; tx: number; emblemX: number }
function layoutFor(rtl: boolean): Layout {
  const divider = rtl ? W - 660 : 660
  return { rtl, divider, tx: rtl ? (50 + divider) / 2 : (divider + W - 50) / 2, emblemX: rtl ? W - 352 : 352 }
}

export type Lang = 'en' | 'ar' | 'ur'

const LANGS: Array<{ id: Lang; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
  { id: 'ur', label: 'اردو' },
]

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula', 'Jumada al-Akhirah',
  'Rajab', 'Sha‘ban', 'Ramadan', 'Shawwal', 'Dhul Qa‘dah', 'Dhul Hijjah',
]

function todayLabels(now: Date) {
  const gregorian = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const parts = new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', { month: 'numeric', year: 'numeric' }).formatToParts(now)
  const month = Number(parts.find(p => p.type === 'month')?.value)
  const year = parts.find(p => p.type === 'year')?.value
  const islamic = month && year ? `${HIJRI_MONTHS[month - 1]} ${year} AH` : ''
  return { gregorian, islamic }
}

// "This is to celebrate that" sits above the name and "completed" below it.
type Copy = {
  title: [string, string]
  heading: string
  celebrate: string
  completed: string
  dua: string
  place: string
  city: string
  dates: (now: Date) => string
}

const monthYear = (locale: string, now: Date) => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(now)

const COPY: Record<Lang, Copy> = {
  en: {
    title: ['Umrah', 'Mubarak'],
    heading: 'CERTIFICATE OF UMRAH',
    celebrate: 'This is to celebrate that',
    completed: 'has completed the blessed Umrah to the House of Allah',
    dua: 'May Allah accept your Umrah, forgive your sins and invite you back again and again.',
    place: 'MASJID AL-HARAM',
    city: 'MAKKAH AL-MUKARRAMAH',
    dates: now => {
      const { gregorian, islamic } = todayLabels(now)
      return [gregorian, islamic].filter(Boolean).join('  ·  ').toUpperCase()
    },
  },
  ar: {
    title: ['عمرة', 'مباركة'],
    heading: 'شهادة العمرة',
    celebrate: 'يسرّنا أن نهنّئ',
    completed: 'بأداء العمرة المباركة إلى بيت الله الحرام',
    dua: 'تقبّل الله عمرتك، وغفر ذنبك، ورزقك العودة مرّة بعد مرّة.',
    place: 'المسجد الحرام',
    city: 'مكة المكرمة',
    dates: now => `${monthYear('ar-u-nu-arab', now)}  ·  ${monthYear('ar-SA-u-ca-islamic-umalqura-nu-arab', now)}`,
  },
  ur: {
    title: ['عمرہ', 'مبارک'],
    heading: 'سندِ عمرہ',
    celebrate: 'ہم بصد مسرّت',
    completed: 'کو عمرہ کی سعادت حاصل ہونے پر مبارکباد پیش کرتے ہیں',
    dua: 'اللہ تعالیٰ آپ کا عمرہ قبول فرمائے، آپ کے گناہ معاف فرمائے اور آپ کو بار بار حاضری نصیب فرمائے۔',
    place: 'مسجد الحرام',
    city: 'مکہ مکرمہ',
    dates: now => `${monthYear('ur', now)}  ·  ${monthYear('ur-u-ca-islamic-umalqura', now)}`,
  },
}

// Everything a renderer needs to write the certificate in one language.
type Greeting = {
  name: string
  copy: Copy
  dates: string
  layout: Layout
  // Font families: the big title, the sentences, the small capitals, and the pilgrim's name.
  display: string
  body: string
  caps: string
  serif: string
  tracking: number // letter-spacing for the small capitals; none in Arabic script, where it breaks the joins
  titleSize: number
}

const SIGNATORIES = ['Shaykh Waseem Ahmed', 'Shaykh Saqib Rashid', 'Guidance Tours Team']

// The talbiyah recording that plays with the animation and goes into the video. Drop the file in
// public/audio; the sound controls only appear once it loads.
const TALBIYAH_SRC = '/audio/talbiyah.mp3'


let logoPromise: Promise<HTMLImageElement | null> | null = null
function loadLogo() {
  logoPromise ??= new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = '/images/logo.png'
  })
  return logoPromise
}

type Words = Array<{ text: string; y: number; size: number; font: string; title: boolean; rtl: boolean }>

// A font that fails to download (a patchy connection, or a page left open across a deploy) falls
// back to its similar built-in face instead of stopping the certificate.
function loadFont(spec: string, text: string) {
  return document.fonts.load(spec, text).catch(() => [])
}

// The renderer needs the fonts (to trace the words) and the logo before it starts.
async function loadAssets(name: string, lang: Lang): Promise<{ greeting: Greeting; logo: HTMLImageElement | null }> {
  const copy = COPY[lang]
  const serif = playfair.style.fontFamily
  const script = lang === 'ar' ? amiri.style.fontFamily : lang === 'ur' ? nastaliq.style.fontFamily : null
  const sample = copy.title.join(' ')
  const [logo] = await Promise.all([
    loadLogo(),
    loadFont(`700 100px ${serif}`, name),
    loadFont(`italic 600 100px ${serif}`, name),
    ...(script ? [loadFont(`700 100px ${script}`, sample), loadFont(`400 100px ${script}`, sample)] : []),
  ])
  await document.fonts.ready
  const sans = getComputedStyle(document.body).fontFamily || 'sans-serif'
  const greeting: Greeting = {
    name,
    copy,
    dates: copy.dates(new Date()),
    layout: layoutFor(lang !== 'en'),
    display: script ?? serif,
    body: script ?? serif,
    caps: script ?? sans,
    serif,
    tracking: script ? 0 : 1,
    // Nasta'liq stands much taller than its size, so it is set smaller.
    titleSize: lang === 'ur' ? 118 : lang === 'ar' ? 170 : 150,
  }
  return { greeting, logo }
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// The dots hand over to the solid words as the last of them land.
const wordsAlpha = (t: number) => clamp01((t - FORMED_MS + 200 * PACE) / (700 * PACE))
// The certificate's frame appears as the scene moves aside; its wording as the words settle.
const frameAlpha = (t: number) => clamp01((t - TAWAF_END) / (1200 * PACE))
const detailAlpha = (t: number) => clamp01((t - FORMED_MS + 400 * PACE) / (800 * PACE))

// Where the Ka'bah scene sits at time t.
function placement(t: number, lay: Layout) {
  const m = easeInOut(clamp01((t - TAWAF_END + 200 * PACE) / MOVE_MS))
  return {
    x: PLACE_START.x + (lay.emblemX - PLACE_START.x) * m,
    y: PLACE_START.y + (PLACE_END.y - PLACE_START.y) * m,
    s: PLACE_START.s + (PLACE_END.s - PLACE_START.s) * m,
    moving: m > 0 && m < 1,
  }
}
type Placement = ReturnType<typeof placement>

const toCanvas = (pl: Placement, wx: number, wy: number): [number, number] => [pl.x + (wx - PIVOT.x) * pl.s, pl.y + (wy - PIVOT.y) * pl.s]
const toWorld = (pl: Placement, x: number, y: number): [number, number] => [PIVOT.x + (x - pl.x) / pl.s, PIVOT.y + (y - pl.y) / pl.s]

type Target = { x: number; y: number; size: number; title: boolean }

type Particle = {
  a: number // angle around the Ka'bah
  rho: number // ground radius of its ring
  w: number // angular speed multiplier
  delay: number
  sx: number // where it streams in from
  sy: number
  size: number
  gold: boolean
  target: Target | null
  peel: number // when it leaves the tawaf for its target
  // Where it is this frame.
  x: number
  y: number
  r: number
  layer: number
}

// The points the dots settle on to spell the greeting and the name, and the words they become.
function sampleTargets(g: Greeting): { targets: Target[]; words: Words } {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000'
  const { tx } = g.layout

  const words: Words = []

  function sample(lines: Array<[string, number]>, family: string, style: string, maxSize: number, gap: number, rtl: boolean, title: boolean) {
    ctx.clearRect(0, 0, W, H)
    ctx.direction = rtl ? 'rtl' : 'ltr'
    ctx.font = `${style} ${maxSize}px ${family}`
    const widest = Math.max(...lines.map(([text]) => ctx.measureText(text).width))
    const size = Math.min(maxSize, (maxSize * TEXT_W) / widest)
    ctx.font = `${style} ${size}px ${family}`
    for (const [text, y] of lines) {
      ctx.fillText(text, tx, y)
      words.push({ text, y, size, font: ctx.font, title, rtl })
    }
    const step = Math.max(3, gap * (size / maxSize))
    const data = ctx.getImageData(0, 0, W, H).data
    const out: Target[] = []
    for (let y = 0; y < H; y += step) {
      for (let x = (Math.round(y / step) % 2) * (step / 2); x < W; x += step) {
        if (data[(Math.round(y) * W + Math.round(x)) * 4 + 3] > 140) out.push({ x, y, size: step * 0.36, title })
      }
    }
    return out
  }

  const [first, second] = g.copy.title
  // Arabic script stands too tall to stack the two words, so it takes a single line.
  const titleLines: Array<[string, number]> = g.layout.rtl ? [[`${first} ${second}`, 380]] : [[first, 300], [second, 440]]
  const targets = [
    ...sample(titleLines, g.display, '700', g.titleSize, 7, g.layout.rtl, true),
    // The name stays as it was entered, in the Latin serif.
    ...sample([[g.name, 640]], g.serif, 'italic 600', 76, 4.5, false, false),
  ]
  return { targets, words }
}

// 0 at the start of a line of the wording and 1 at its end, in the language's reading direction.
function readingOrder(x: number, lay: Layout) {
  const along = clamp01((x - lay.tx + TEXT_W / 2) / TEXT_W)
  return lay.rtl ? 1 - along : along
}

function makeParticles(targets: Target[], lay: Layout): Particle[] {
  const count = targets.length + ORBITERS
  const shuffled = [...targets].sort(() => Math.random() - 0.5)
  return Array.from({ length: count }, (_, i) => {
    const frac = Math.pow(Math.random(), 1.5)
    const from = Math.random() * Math.PI * 2
    const target = shuffled[i] ?? null
    return {
      a: Math.random() * Math.PI * 2,
      rho: MIN_R + frac * (MAX_R - MIN_R),
      w: (0.85 + Math.random() * 0.3) / Math.sqrt(1 + frac * 1.6),
      delay: Math.random() * (ARRIVE_MS - ARRIVE_FLY_MS),
      sx: W / 2 + Math.cos(from) * 1100,
      sy: H / 2 + Math.sin(from) * 1100,
      size: 2.4 + Math.random() * 2.2,
      gold: Math.random() < 0.16,
      target,
      peel: target ? TAWAF_END + readingOrder(target.x, lay) * PEEL_MS * 0.7 + Math.random() * PEEL_MS * 0.3 : Infinity,
      x: 0,
      y: 0,
      r: 0,
      layer: 2,
    }
  })
}

// The tawaf parts around the Maqam like a stream around a rock: on the ground, anything within
// 2 × MAQAM_CLEAR of it is pushed out so nothing comes closer than MAQAM_CLEAR.
const MAQAM_CLEAR = 55
function aroundMaqam(gx: number, gy: number): [number, number] {
  const mx = MQ.x - OX
  const my = (MQ.y - GROUND_Y) / TILT
  const d = Math.hypot(gx - mx, gy - my)
  if (d >= MAQAM_CLEAR * 2) return [gx, gy]
  if (d < 0.001) return [mx, my + MAQAM_CLEAR]
  const scale = (MAQAM_CLEAR + d / 2) / d
  return [mx + (gx - mx) * scale, my + (gy - my) * scale]
}

function update(particles: Particle[], t: number, dt: number, lay: Layout) {
  const omega = (Math.PI * 2) / ROUND_MS
  const pl = placement(t, lay)
  for (const p of particles) {
    const k = easeOut(clamp01((t - p.delay) / ARRIVE_FLY_MS))
    // Anticlockwise seen from above, so the near side of the ring moves left to right.
    p.a -= omega * p.w * dt * (0.25 + 0.75 * k)
    const depth = Math.sin(p.a)
    const [gx, gy] = aroundMaqam(Math.cos(p.a) * p.rho, depth * p.rho)
    const [ox, oy] = toCanvas(pl, OX + gx, GROUND_Y + gy * TILT)
    const or = p.size * (0.65 + 0.35 * (depth + 1) / 2) * pl.s

    let f = 0
    if (p.target && t >= p.peel) {
      f = easeInOut(clamp01((t - p.peel) / FLY_MS))
      p.x = ox + (p.target.x - ox) * f
      p.y = oy + (p.target.y - oy) * f
      p.r = or + (p.target.size - or) * f
    } else {
      p.x = p.sx + (ox - p.sx) * k
      p.y = p.sy + (oy - p.sy) * k
      p.r = or
    }
    // Dots crossing the Ka'bah or the Maqam are passing behind them: the near side of the ring is lower down.
    p.layer = f > 0.25 ? 2 : layerOf(...toWorld(pl, p.x, p.y))
  }
}

// Seen facing the door wall (north-east), the Black Stone corner on the left
// and the north-west wall, with Hijr Isma'il, receding to the right.
const K = { x0: 370, x1: 652, bottom: 1330, top: 995, dx: 82, dy: -52 }

function face(c: CanvasRenderingContext2D, pts: number[][], fill: string | CanvasGradient) {
  c.fillStyle = fill
  c.beginPath()
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))
  c.closePath()
  c.fill()
}

function drawKaabah(c: CanvasRenderingContext2D) {
  const { x0, x1, bottom, top, dx, dy } = K

  // A soft glow so the black stands out against the night.
  const glow = c.createRadialGradient(KX, 1140, 60, KX, 1140, 420)
  glow.addColorStop(0, 'rgba(196, 163, 72, 0.14)')
  glow.addColorStop(1, 'rgba(196, 163, 72, 0)')
  c.fillStyle = glow
  c.fillRect(KX - 420, 720, 840, 840)

  const front = c.createLinearGradient(x0, 0, x1, 0)
  front.addColorStop(0, '#1b1713')
  front.addColorStop(1, '#0b0907')
  face(c, [[x0, top], [x1, top], [x1, bottom], [x0, bottom]], front)
  face(c, [[x1, top], [x1 + dx, top + dy], [x1 + dx, bottom + dy], [x1, bottom]], '#050403')
  face(c, [[x0, top], [x0 + dx, top + dy], [x1 + dx, top + dy], [x1, top]], '#2a241d')

  // Folds in the kiswah.
  c.strokeStyle = 'rgba(255, 255, 255, 0.035)'
  c.lineWidth = 2
  for (let x = x0 + 24; x < x1; x += 30) {
    c.beginPath()
    c.moveTo(x, top + 4)
    c.lineTo(x, bottom - 14)
    c.stroke()
  }

  // The gold hizam band around the upper part, with a hint of its calligraphy.
  const bandTop = top + 62
  const bandH = 30
  face(c, [[x0, bandTop], [x1, bandTop], [x1, bandTop + bandH], [x0, bandTop + bandH]], GOLD)
  face(c, [[x1, bandTop], [x1 + dx, bandTop + dy], [x1 + dx, bandTop + dy + bandH], [x1, bandTop + bandH]], '#8a7232')
  c.fillStyle = 'rgba(26, 19, 10, 0.55)'
  for (let x = x0 + 8; x < x1 - 10; x += 17) c.fillRect(x, bandTop + 9, 9 + ((x * 7) % 5), 12)
  // Medallions below the band, clear of the door.
  c.fillStyle = 'rgba(196, 163, 72, 0.5)'
  for (const x of [x0 + 26, x0 + 175, x1 - 36]) c.fillRect(x - 13, bandTop + 52, 26, 34)

  // The raised golden door, left of centre towards the Black Stone corner.
  const doorX = x0 + 62
  const doorBottom = bottom - 74
  const doorTop = doorBottom - 128
  c.fillStyle = GOLD
  c.fillRect(doorX, doorTop, 66, doorBottom - doorTop)
  c.strokeStyle = '#7d6626'
  c.lineWidth = 3
  c.strokeRect(doorX + 8, doorTop + 10, 50, doorBottom - doorTop - 20)
  c.beginPath()
  c.moveTo(doorX + 33, doorTop + 10)
  c.lineTo(doorX + 33, doorBottom - 10)
  c.stroke()

  // The marble shadharwan at the base, and the silver-framed Black Stone at the corner.
  face(c, [[x0 - 6, bottom - 12], [x1, bottom - 12], [x1, bottom + 4], [x0 - 6, bottom + 4]], '#cfc7b8')
  face(c, [[x1, bottom - 12], [x1 + dx + 4, bottom + dy - 12], [x1 + dx + 4, bottom + dy + 4], [x1, bottom + 4]], '#9a9387')
  c.strokeStyle = '#d9d9d9'
  c.lineWidth = 5
  c.beginPath()
  c.ellipse(x0 + 4, bottom - 40, 11, 15, 0, 0, Math.PI * 2)
  c.stroke()
}

// Hijr Isma'il (the Hateem): the low semicircular marble wall out from the north-west face.
function drawHijr(c: CanvasRenderingContext2D) {
  const { x1, bottom, dx, dy } = K
  const mx = x1 + dx / 2
  const my = bottom + dy / 2
  const ux = (dx / 2) * 0.92
  const uy = (dy / 2) * 0.92
  const reach = 150
  const at = (th: number, lift: number): [number, number] => [mx + Math.cos(th) * ux + Math.sin(th) * reach, my + Math.cos(th) * uy - lift]
  const curve = (lift: number) => {
    c.beginPath()
    for (let i = 0; i <= 40; i++) {
      const [x, y] = at((Math.PI * i) / 40, lift)
      if (i) c.lineTo(x, y)
      else c.moveTo(x, y)
    }
  }

  curve(0)
  c.closePath()
  c.fillStyle = 'rgba(232, 222, 200, 0.07)'
  c.fill()
  c.lineCap = 'round'
  c.lineWidth = 9
  curve(0)
  c.strokeStyle = '#9c9486'
  c.stroke()
  curve(9)
  c.strokeStyle = '#e6dfd1'
  c.stroke()
  c.lineCap = 'butt'
}

// Maqam Ibrahim: the gold-latticed, domed enclosure on its marble plinth, in front of the door.
const MQ = { x: 468, y: 1405 }

function drawMaqam(c: CanvasRenderingContext2D) {
  const { x, y } = MQ
  c.fillStyle = 'rgba(0, 0, 0, 0.4)'
  c.beginPath()
  c.ellipse(x, y, 34, 9, 0, 0, Math.PI * 2)
  c.fill()

  // Plinth.
  c.fillStyle = '#d8d0c1'
  c.fillRect(x - 27, y - 16, 54, 16)
  c.fillStyle = '#efe9dd'
  c.beginPath()
  c.ellipse(x, y - 16, 27, 7, 0, 0, Math.PI * 2)
  c.fill()

  // The glass cage and its gold lattice.
  const top = y - 80
  // Solid, so the dots passing behind it can't be seen through the glass.
  c.fillStyle = '#3a3020'
  c.fillRect(x - 20, top, 40, y - 18 - top)
  c.strokeStyle = GOLD
  c.lineWidth = 4
  c.strokeRect(x - 20, top, 40, y - 18 - top)
  c.lineWidth = 1.5
  c.beginPath()
  for (const lx of [x - 10, x, x + 10]) {
    c.moveTo(lx, top)
    c.lineTo(lx, y - 18)
  }
  for (const ly of [top + 20, top + 40]) {
    c.moveTo(x - 20, ly)
    c.lineTo(x + 20, ly)
  }
  c.stroke()

  // The dome and its finial.
  const dome = c.createLinearGradient(x - 24, 0, x + 24, 0)
  dome.addColorStop(0, '#e2c470')
  dome.addColorStop(1, '#9c7f2c')
  c.fillStyle = dome
  c.beginPath()
  c.moveTo(x - 24, top + 2)
  c.quadraticCurveTo(x - 24, top - 34, x, top - 40)
  c.quadraticCurveTo(x + 24, top - 34, x + 24, top + 2)
  c.closePath()
  c.fill()
  c.strokeStyle = GOLD
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(x, top - 40)
  c.lineTo(x, top - 52)
  c.stroke()
  c.fillStyle = GOLD
  c.beginPath()
  c.arc(x, top - 55, 4, 0, Math.PI * 2)
  c.fill()
}

// Which pass a dot is drawn in: hidden behind the Ka'bah, hidden behind the Maqam, or in front.
function layerOf(x: number, y: number) {
  if (x > 360 && x < 740 && y > 935 && y < 1300) return 0
  if (x > MQ.x - 30 && x < MQ.x + 30 && y > MQ.y - 135 && y < MQ.y - 4) return 1
  return 2
}

function drawGround(c: CanvasRenderingContext2D, th: Theme) {
  c.strokeStyle = th.ground
  c.lineWidth = 2
  for (let i = 0; i <= 3; i++) {
    const r = MIN_R + ((MAX_R - MIN_R) * i) / 3
    c.beginPath()
    c.ellipse(OX, GROUND_Y, r, r * TILT, 0, 0, Math.PI * 2)
    c.stroke()
  }
}

function drawDots(c: CanvasRenderingContext2D, th: Theme, particles: Particle[], layer: number, t: number) {
  for (const p of particles) {
    if (p.layer !== layer) continue
    const f = p.target && t >= p.peel ? clamp01((t - p.peel) / FLY_MS) : 0
    c.globalAlpha = f >= 1 ? 1 - wordsAlpha(t) : 1
    if (!c.globalAlpha) continue
    c.fillStyle = f > 0.6 ? (p.target!.title ? th.titleDot : th.nameDot) : p.gold ? th.dotGold : th.dot
    c.beginPath()
    c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    c.fill()
  }
  c.globalAlpha = 1
}

function spaced(c: CanvasRenderingContext2D, px: number) {
  if ('letterSpacing' in c) c.letterSpacing = `${px}px`
}

function wrap(c: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && c.measureText(next).width > maxWidth) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

// An eight-pointed star.
function star(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.beginPath()
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * i) / 8 - Math.PI / 2
    const rr = i % 2 ? r * 0.76 : r
    if (i) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
    else c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  c.closePath()
}

function diamond(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.beginPath()
  c.moveTo(x, y - r)
  c.lineTo(x + r, y)
  c.lineTo(x, y + r)
  c.lineTo(x - r, y)
  c.closePath()
  c.fill()
}

// The double gold border with stars at the corners.
function drawFrame(c: CanvasRenderingContext2D, th: Theme, divider: number) {
  c.strokeStyle = th.gold
  c.lineWidth = 3
  c.strokeRect(34, 34, W - 68, H - 68)
  c.strokeStyle = th.goldSoft
  c.lineWidth = 1.5
  c.strokeRect(50, 50, W - 100, H - 100)
  for (const [x, y] of [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50]]) {
    c.fillStyle = th.bg
    star(c, x, y, 22)
    c.fill()
    c.strokeStyle = th.gold
    c.lineWidth = 2
    c.stroke()
    c.fillStyle = th.gold
    star(c, x, y, 8)
    c.fill()
  }
  c.fillStyle = th.gold
  for (const [x, y] of [[W / 2, 34], [W / 2, H - 34]]) diamond(c, x, y, 9)
  // A faint rule between the emblem and the wording.
  c.strokeStyle = th.divider
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(divider, 150)
  c.lineTo(divider, H - 150)
  c.stroke()
}

// The certificate's frame and wording, drawn over the scene so the trails never smear them.
function drawCertificate(c: CanvasRenderingContext2D, t: number, g: Greeting, logo: HTMLImageElement | null, words: Words, th: Theme) {
  const { tx, emblemX, rtl } = g.layout
  const { copy } = g
  const dir = rtl ? 'rtl' : 'ltr'
  c.textAlign = 'center'
  c.textBaseline = 'middle'

  const frame = frameAlpha(t)
  if (frame > 0) {
    c.globalAlpha = frame
    drawFrame(c, th, g.layout.divider)
  }

  const solid = wordsAlpha(t)
  if (solid > 0) {
    c.save()
    c.globalAlpha = solid
    c.shadowColor = th.glow
    c.shadowBlur = th.glowBlur
    for (const w of words) {
      c.font = w.font
      c.direction = w.rtl ? 'rtl' : 'ltr'
      if (w.title) {
        const sheen = c.createLinearGradient(0, w.y - w.size / 2, 0, w.y + w.size / 2)
        sheen.addColorStop(0, th.titleTop)
        sheen.addColorStop(1, th.titleBottom)
        c.fillStyle = sheen
      } else c.fillStyle = th.name
      c.fillText(w.text, tx, w.y)
    }
    c.restore()
  }

  const detail = detailAlpha(t)
  if (detail > 0) {
    c.globalAlpha = detail
    c.direction = dir

    c.fillStyle = th.gold
    c.font = `700 ${rtl ? 32 : 24}px ${g.caps}`
    spaced(c, 10 * g.tracking)
    c.fillText(copy.heading, tx, 175)
    const half = c.measureText(copy.heading).width / 2
    spaced(c, 0)
    c.fillRect(tx - half - 90, 174, 70, 1.5)
    c.fillRect(tx + half + 20, 174, 70, 1.5)

    c.fillStyle = th.body
    c.font = `${rtl ? '' : 'italic '}400 ${rtl ? 32 : 30}px ${g.body}`
    c.fillText(copy.celebrate, tx, 556, TEXT_W)

    // A rule under the name.
    c.fillStyle = th.gold
    c.fillRect(tx - 230, 702, 460, 1.5)
    diamond(c, tx, 703, 6)

    c.fillStyle = th.body
    c.font = `${rtl ? '' : 'italic '}400 ${rtl ? 30 : 30}px ${g.body}`
    c.fillText(copy.completed, tx, 752, TEXT_W)

    c.fillStyle = th.gold
    c.font = `700 ${rtl ? 26 : 21}px ${g.caps}`
    spaced(c, 5 * g.tracking)
    c.fillText(g.dates, tx, 810, TEXT_W)
    spaced(c, 0)

    c.fillStyle = th.muted
    c.font = `${rtl ? '' : 'italic '}400 ${rtl ? 27 : 25}px ${g.body}`
    wrap(c, copy.dua, rtl ? 700 : 640).forEach((line, i) => c.fillText(line, tx, (rtl ? 862 : 866) + i * (rtl ? 50 : 34)))

    // Signatures, in the order they are read.
    c.direction = 'ltr'
    SIGNATORIES.forEach((who, i) => {
      const x = tx + (rtl ? 1 - i : i - 1) * 270
      c.fillStyle = th.gold
      c.font = `italic 600 26px ${g.serif}`
      c.fillText(who, x, 980, 240)
      c.fillRect(x - 115, 1006, 230, 1.5)
    })

    // Beneath the emblem.
    c.direction = dir
    c.fillStyle = th.gold
    c.font = `700 ${rtl ? 26 : 19}px ${g.caps}`
    spaced(c, 6 * g.tracking)
    c.fillText(copy.place, emblemX, 762)
    spaced(c, 3 * g.tracking)
    c.fillStyle = th.muted
    c.font = `600 ${rtl ? 20 : 14}px ${g.caps}`
    c.fillText(copy.city, emblemX, rtl ? 812 : 796)
    spaced(c, 0)
    if (logo) {
      const size = 150
      c.drawImage(logo, emblemX - size / 2, 852, size, (size * logo.naturalHeight) / logo.naturalWidth)
    }
  }
  c.globalAlpha = 1
}

// A scene canvas keeps the motion trails; the visible canvas is the scene plus the certificate.
function createRenderer(out: HTMLCanvasElement, g: Greeting, logo: HTMLImageElement | null, theme: ThemeName) {
  const th = THEMES[theme]
  const scene = document.createElement('canvas')
  const sc = scene.getContext('2d')!
  const oc = out.getContext('2d')!
  const { targets, words } = sampleTargets(g)
  const particles = makeParticles(targets, g.layout)

  function resize(pxWidth: number) {
    const pxHeight = Math.round((pxWidth * H) / W / 2) * 2 // even, for video encoders
    for (const cv of [scene, out]) {
      cv.width = pxWidth
      cv.height = pxHeight
    }
    const k = pxWidth / W
    sc.setTransform(k, 0, 0, k, 0, 0)
    oc.setTransform(k, 0, 0, k, 0, 0)
    sc.fillStyle = th.bg
    sc.fillRect(0, 0, W, H)
  }

  function draw(t: number) {
    const pl = placement(t, g.layout)
    // Paint in the scene's own coordinates, wherever it sits on the certificate right now.
    const inScene = (paint: (c: CanvasRenderingContext2D) => void) => {
      sc.save()
      sc.translate(pl.x, pl.y)
      sc.scale(pl.s, pl.s)
      sc.translate(-PIVOT.x, -PIVOT.y)
      paint(sc)
      sc.restore()
    }

    // Clear harder while the scene moves, so the Ka'bah doesn't smear.
    sc.fillStyle = `rgba(${th.bgRgb}, ${pl.moving ? 0.6 : 0.28})`
    sc.fillRect(0, 0, W, H)
    inScene(c => drawGround(c, th))
    drawDots(sc, th, particles, 0, t)
    inScene(drawKaabah)
    inScene(drawHijr)
    drawDots(sc, th, particles, 1, t)
    inScene(drawMaqam)
    drawDots(sc, th, particles, 2, t)

    oc.drawImage(scene, 0, 0, W, H)
    drawCertificate(oc, t, g, logo, words, th)
  }

  return {
    resize,
    frame(t: number, dt: number) {
      update(particles, t, dt, g.layout)
      draw(t)
    },
    // Jump ahead without drawing, leaving a few frames at the end to lay down the trails.
    skipTo(t: number) {
      const step = 1000 / 30
      for (let s = 0; s <= t; s += step) {
        update(particles, s, step, g.layout)
        if (s > t - 600) draw(s)
      }
    },
  }
}

async function makeImage(name: string, lang: Lang, theme: ThemeName): Promise<Blob> {
  const { greeting, logo } = await loadAssets(name, lang)
  const out = document.createElement('canvas')
  const r = createRenderer(out, greeting, logo, theme)
  r.resize(2400) // large enough to print
  r.skipTo(DONE_MS + 1500)
  return new Promise((resolve, reject) => out.toBlob(b => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'))
}

function videoType() {
  if (typeof MediaRecorder === 'undefined') return null
  return ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) ?? null
}

async function makeVideo(name: string, lang: Lang, theme: ThemeName, mime: string, onProgress: (p: number) => void): Promise<Blob> {
  const { greeting, logo } = await loadAssets(name, lang)
  const out = document.createElement('canvas')
  const r = createRenderer(out, greeting, logo, theme)
  r.resize(1280)
  const total = TOTAL_MS
  const stream = out.captureStream(30)
  const audio = await talbiyahTrack(total / 1000)
  audio?.tracks.forEach(tr => stream.addTrack(tr))
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = e => e.data.size && chunks.push(e.data)

  return new Promise((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime.split(';')[0] }))
    recorder.onerror = () => reject(new Error('Recording failed'))
    let start = 0
    let last = 0
    function tick(now: number) {
      if (!start) start = last = now
      const t = now - start
      r.frame(t, Math.min(50, now - last))
      last = now
      onProgress(Math.min(1, t / total))
      if (t < total) requestAnimationFrame(tick)
      else {
        recorder.stop()
        stream.getTracks().forEach(tr => tr.stop())
        audio?.close()
      }
    }
    recorder.start()
    audio?.start()
    requestAnimationFrame(tick)
  })
}

// The talbiyah as an audio track for the video, fading out over its last second. Null without the file.
async function talbiyahTrack(seconds: number) {
  try {
    const res = await fetch(TALBIYAH_SRC)
    if (!res.ok) return null
    const ctx = new AudioContext()
    const buffer = await ctx.decodeAudioData(await res.arrayBuffer())
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    const dest = ctx.createMediaStreamDestination()
    source.connect(gain).connect(dest)
    return {
      tracks: dest.stream.getAudioTracks(),
      start() {
        const now = ctx.currentTime
        gain.gain.setValueAtTime(1, now + Math.max(0, seconds - 1))
        gain.gain.linearRampToValueAtTime(0, now + seconds)
        source.start()
      },
      close: () => ctx.close(),
    }
  } catch {
    return null
  }
}

// Errors are shown on the page rather than swallowed, so a failure on someone's phone can be reported.
function describe(e: unknown) {
  return e instanceof Error ? `${e.name}: ${e.message}` : String(e)
}

function fileSlug(name: string, lang: Lang, theme: ThemeName) {
  const who = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card'
  return ['umrah-certificate', who, lang === 'en' ? null : lang, theme].filter(Boolean).join('-')
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function UmrahMubarak({ name, siteUrl }: { name: string; siteUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)
  const [run, setRun] = useState(0)
  const [theme, setTheme] = useState<ThemeName>('dark')
  const [lang, setLang] = useState<Lang>('en')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [hasAudio, setHasAudio] = useState(false)
  // The talbiyah is on by default. Browsers only let it start by itself once the visitor has
  // clicked something on the site (usually true, as they click through to this page); if it's
  // blocked, their first tap anywhere starts it at the point the animation has reached.
  const [soundOn, setSoundOn] = useState(true)
  const [blocked, setBlocked] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const startedAt = useRef(0)
  const [{ gregorian, islamic }] = useState(() => todayLabels(new Date()))

  // Plays even with reduced motion turned on: the animation is the whole point of the card.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let frame = 0
    let ro: ResizeObserver | null = null
    let cancelled = false

    loadAssets(name, lang).then(({ greeting, logo }) => {
      if (cancelled) return
      const r = createRenderer(canvas, greeting, logo, theme)
      const fit = () => r.resize(Math.round(canvas.clientWidth * (window.devicePixelRatio || 1)))
      fit()
      ro = new ResizeObserver(fit)
      ro.observe(canvas)

      let start = 0
      let last = 0
      let finished = false
      function tick(now: number) {
        if (!start) {
          start = last = now
          startedAt.current = now
          // Line the recording up with the first frame.
          const audio = audioRef.current
          if (audio && !audio.paused) audio.currentTime = 0
        }
        const t = now - start
        try {
          r.frame(t, Math.min(50, now - last))
        } catch (e) {
          setFailure(describe(e))
          return
        }
        last = now
        if (!finished && t >= DONE_MS) {
          finished = true
          setDone(true)
        }
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }).catch(e => {
      if (!cancelled) setFailure(describe(e))
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      ro?.disconnect()
    }
  }, [run, theme, lang, name])

  useEffect(() => {
    audioRef.current
      ?.play()
      .then(() => setBlocked(false))
      .catch(() => setBlocked(true))
  }, [])

  useEffect(() => {
    if (!blocked) return
    function resume() {
      const audio = audioRef.current
      if (!audio) return
      const at = (performance.now() - startedAt.current) / 1000
      if (at >= audio.duration) return setBlocked(false)
      audio.currentTime = at
      audio.play().then(() => setBlocked(false)).catch(() => {})
    }
    // Only these count as the tap a browser needs before it will play sound.
    document.addEventListener('click', resume)
    document.addEventListener('keydown', resume)
    return () => {
      document.removeEventListener('click', resume)
      document.removeEventListener('keydown', resume)
    }
  }, [blocked])

  // The audio can finish loading before hydration attaches onCanPlay.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return
    const raf = requestAnimationFrame(() => setHasAudio(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Starts the animation again from the top, with the talbiyah from the top too if sound is on.
  // Browsers only allow sound to start from a tap, so this is always called from a click.
  function restart(withSound = soundOn) {
    const audio = audioRef.current
    if (audio && withSound) {
      audio.currentTime = 0
      audio.play().then(() => setBlocked(false)).catch(() => setSoundOn(false))
    }
    setDone(false)
    setRun(n => n + 1)
  }

  function toggleSound() {
    if (soundOn) {
      audioRef.current?.pause()
      setSoundOn(false)
    } else {
      setSoundOn(true)
      restart(true)
    }
  }

  return (
    <div className="mb-8">
      <audio ref={audioRef} src={TALBIYAH_SRC} preload="auto" onCanPlay={() => setHasAudio(true)} onError={() => setHasAudio(false)} />
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {hasAudio ? (
          <button
            type="button"
            // While blocked, the page-wide tap listener starts the sound.
            onClick={blocked ? undefined : toggleSound}
            aria-pressed={soundOn && !blocked}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              soundOn && !blocked ? 'border-[#C4A348] bg-[#C4A348] text-white' : 'border-stone-200 bg-white text-stone-600 hover:text-stone-900'
            }`}
          >
            {blocked ? '🔇 Tap to hear the Talbiyah' : soundOn ? '🔊 Talbiyah on' : '♪ Play with Talbiyah'}
          </button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
        <div className="inline-flex rounded-full border border-stone-200 bg-white p-0.5 text-xs font-semibold" role="group" aria-label="Certificate language">
          {LANGS.map(l => (
            <button
              key={l.id}
              type="button"
              lang={l.id}
              aria-pressed={lang === l.id}
              onClick={() => {
                if (l.id === lang) return
                setLang(l.id)
                restart()
              }}
              className={`px-3 py-1 rounded-full transition ${lang === l.id ? 'bg-[#C4A348] text-white' : 'text-stone-600 hover:text-stone-900'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-full border border-stone-200 bg-white p-0.5 text-xs font-semibold" role="group" aria-label="Certificate style">
          {(['dark', 'light'] as const).map(t => (
            <button
              key={t}
              type="button"
              aria-pressed={theme === t}
              onClick={() => {
                if (t === theme) return
                setTheme(t)
                restart()
              }}
              className={`px-3 py-1 rounded-full capitalize transition ${theme === t ? 'bg-[#C4A348] text-white' : 'text-stone-600 hover:text-stone-900'}`}
            >
              {t}
            </button>
          ))}
        </div>
        </div>
      </div>
      <section
        className="relative w-full aspect-[1600/1132] overflow-hidden rounded-2xl shadow-lg"
        style={{ background: THEMES[theme].bg }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block w-full h-full"
          role="img"
          aria-label={`Umrah Mubarak certificate for ${name}. ${gregorian}${islamic ? `, ${islamic}` : ''}.`}
        />
        {done && (
          <button
            type="button"
            onClick={() => restart()}
            className={`absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full border px-3 py-1 text-xs hover:border-[#C4A348]/60 hover:text-[#C4A348] transition ${
              theme === 'dark' ? 'border-white/15 bg-black/20 text-stone-300' : 'border-black/10 bg-white/50 text-stone-600'
            }`}
          >
            ↻ Replay
          </button>
        )}
        {failure && (
          <p className="absolute inset-x-3 bottom-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
            The animation couldn’t start on this device ({failure}).
          </p>
        )}
      </section>

      <ShareBar key={`${theme}-${lang}`} name={name} labels={{ gregorian, islamic }} lang={lang} theme={theme} siteUrl={siteUrl} ready={done} />
    </div>
  )
}

type Media = { blob: Blob; file: File }

function ShareBar({
  name,
  labels,
  lang,
  theme,
  siteUrl,
  ready,
}: {
  name: string
  labels: { gregorian: string; islamic: string }
  lang: Lang
  theme: ThemeName
  siteUrl: string
  ready: boolean
}) {
  const [image, setImage] = useState<Media | null>(null)
  const [video, setVideo] = useState<Media | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [support, setSupport] = useState({ shareFiles: false, video: null as string | null })

  // Browser capabilities are only known after hydration.
  useEffect(() => {
    const probe = new File([''], 'probe.png', { type: 'image/png' })
    const shareFiles = typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] })
    const raf = requestAnimationFrame(() => setSupport({ shareFiles, video: videoType() }))
    return () => cancelAnimationFrame(raf)
  }, [])

  const slug = fileSlug(name, lang, theme)
  const caption = `Alhamdulillah, Umrah Mubarak! 🕋`

  async function getImage() {
    if (image) return image
    setPreparing(true)
    try {
      const blob = await makeImage(name, lang, theme)
      const media = { blob, file: new File([blob], `${slug}.png`, { type: 'image/png' }) }
      setImage(media)
      return media
    } finally {
      setPreparing(false)
    }
  }

  // Runs a share or download, reporting anything that goes wrong.
  async function attempt(action: () => Promise<void>) {
    setMessage(null)
    try {
      await action()
    } catch (e) {
      setMessage(`Couldn’t create the certificate on this device (${describe(e)}).`)
    }
  }

  // Have the image ready before anyone taps share: iOS only allows sharing straight after a tap.
  useEffect(() => {
    if (!ready || image) return
    let cancelled = false
    makeImage(name, lang, theme)
      .then(blob => !cancelled && setImage({ blob, file: new File([blob], `${slug}.png`, { type: 'image/png' }) }))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [ready, image, name, lang, theme, slug])

  async function share(media: Media) {
    setMessage(null)
    if (!navigator.canShare?.({ files: [media.file] })) {
      saveBlob(media.blob, media.file.name)
      setMessage('Downloaded — add it to your status from your gallery.')
      return
    }
    try {
      await navigator.share({ files: [media.file], text: caption })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setMessage('Sharing didn’t work here — try downloading instead.')
    }
  }

  async function onCreateVideo() {
    if (!support.video) return
    setMessage(null)
    setProgress(0)
    try {
      const blob = await makeVideo(name, lang, theme, support.video, setProgress)
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
      setVideo({ blob, file: new File([blob], `${slug}.${ext}`, { type: blob.type }) })
    } catch {
      setMessage('Couldn’t create the video in this browser — the certificate image works everywhere.')
    } finally {
      setProgress(null)
    }
  }

  const text = encodeURIComponent(`${caption}\n${siteUrl}`)
  const links = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${text}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}` },
    { label: 'X', href: `https://x.com/intent/post?text=${text}` },
    { label: 'Telegram', href: `https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(caption)}` },
  ]

  const btn = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition disabled:opacity-50'
  const primary = `${btn} bg-[#C4A348] text-white hover:bg-[#b2932e]`
  const secondary = `${btn} bg-white border border-stone-300 text-stone-700 hover:border-[#C4A348] hover:text-[#8a6e1f]`

  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
      <p className="text-sm font-semibold text-stone-900">Your Umrah certificate</p>
      <p className="text-xs text-stone-500 mt-0.5 mb-3">
        Download it to print or keep, or share it to WhatsApp, Instagram, Facebook and Snapchat.
      </p>

      <div className="flex flex-wrap gap-2">
        {support.shareFiles && (
          <button type="button" className={primary} disabled={preparing} onClick={() => attempt(async () => share(await getImage()))}>
            {preparing ? 'Preparing…' : 'Share certificate'}
          </button>
        )}
        <button
          type="button"
          className={support.shareFiles ? secondary : primary}
          disabled={preparing}
          onClick={() =>
            attempt(async () => {
              const media = await getImage()
              saveBlob(media.blob, media.file.name)
            })
          }
        >
          {preparing ? 'Preparing…' : '↓ Download certificate'}
        </button>

        {support.video && !video && (
          <button type="button" className={secondary} onClick={onCreateVideo} disabled={progress !== null}>
            {progress === null ? 'Create video' : `Creating video… ${Math.round(progress * 100)}%`}
          </button>
        )}
        {video && support.shareFiles && (
          <button type="button" className={primary} onClick={() => share(video)}>
            Share video
          </button>
        )}
        {video && (
          <button type="button" className={secondary} onClick={() => saveBlob(video.blob, video.file.name)}>
            ↓ Download video
          </button>
        )}
      </div>

      {message && <p className="text-xs text-stone-600 mt-2">{message}</p>}

      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <span className="text-stone-500">Or post a message:</span>
        {links.map(l => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="font-semibold text-[#C4A348] hover:underline">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  )
}
