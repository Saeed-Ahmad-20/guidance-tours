// Client-side PDF builder for the PDF page. Runs in the browser so
// nothing is uploaded and the file is made instantly.
//
// The built-in PDF fonts can't draw the Arabic salutation symbol, so "ﷺ" is
// written out as "(peace be upon him)" and a few other symbols are simplified.

import { titleCase } from '../../lib/title-case'
import type { CatalogueGroup, CatalogueItem, PdfBlock } from './catalogue'

export type PdfOptions = {
  title: string
  photos: boolean
  keyPoints: boolean
  mapLinks: boolean
  coverImage?: string
}

export type LoadedImage = { data: string; w: number; h: number }
export type ImageLoader = (src: string) => Promise<LoadedImage | null>

type RGB = [number, number, number]

const PAGE_W = 210
const PAGE_H = 297
const M = 18
const CW = PAGE_W - M * 2
const TOP = 24
const BOTTOM = PAGE_H - 22

const BROWN: RGB = [44, 31, 14]
const BROWN_SOFT: RGB = [74, 55, 28]
const GOLD: RGB = [196, 163, 72]
const GOLD_DARK: RGB = [138, 110, 31]
const GOLD_PALE: RGB = [243, 234, 200]
const CREAM: RGB = [251, 246, 230]
const INK: RGB = [41, 37, 36]
const MUTED: RGB = [120, 113, 108]

const ALLOWED_EXTRA = new Set([0x2018, 0x2019, 0x201c, 0x201d, 0x2013, 0x2014, 0x2026, 0x2022, 0x20ac])

export function sanitize(input: string): string {
  const text = input
    .replace(/\s*ﷺ/g, ' (peace be upon him)')
    .replace(/\s*→\s*/g, ' to ')
    .replace(/ /g, ' ')
  let out = ''
  for (const ch of text) {
    const c = ch.codePointAt(0)!
    if ((c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff) || ALLOWED_EXTRA.has(c)) out += ch
  }
  return out
}

export function fileNameFor(title: string): string {
  const slug = title
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
  return `${slug || 'my-guide'}.pdf`
}

export async function browserImageLoader(src: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(src)
    if (!res.ok) return null
    const blob = await res.blob()
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.onerror = () => reject(r.error)
      r.readAsDataURL(blob)
    })
    const size = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => reject(new Error('image'))
      img.src = data
    })
    return { data, ...size }
  } catch {
    return null
  }
}

// Consecutive link blocks are drawn together as a row of buttons.
type DrawBlock = PdfBlock | { t: 'links'; links: { label: string; url: string }[] }

export async function buildPdf(
  groups: CatalogueGroup[],
  options: PdfOptions,
  loadImage: ImageLoader,
  onProgress?: (done: number, total: number) => void,
) {
  const { jsPDF, GState } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  doc.setProperties({ title: sanitize(options.title), creator: 'Guidance Tours' })

  let y = M
  let section = ''
  const pageSection = new Map<number, string>()
  const imageCache = new Map<string, LoadedImage | null>()
  const total = groups.reduce((n, g) => n + g.items.length, 0)
  let done = 0

  // ---- helpers -------------------------------------------------------------
  const page = () => doc.getCurrentPageInfo().pageNumber
  const shown = (p: number) => p - 1 // the cover isn't numbered
  const lineHeight = (size: number, lead = 1.45) => size * 0.3528 * lead
  const setColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2])
  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2])
  const stroke = (c: RGB, w = 0.3) => {
    doc.setDrawColor(c[0], c[1], c[2])
    doc.setLineWidth(w)
  }

  function newPage() {
    doc.addPage()
    pageSection.set(page(), section)
    y = TOP
  }

  function ensure(h: number) {
    if (y + h > BOTTOM) newPage()
  }

  function polygon(points: [number, number][], style: 'S' | 'F') {
    const [first, ...rest] = points
    let px = first[0]
    let py = first[1]
    const vectors = rest.map(([x, yy]) => {
      const v: [number, number] = [x - px, yy - py]
      px = x
      py = yy
      return v
    })
    doc.lines(vectors, first[0], first[1], [1, 1], style, true)
  }

  const diamond = (cx: number, cy: number, r: number, style: 'S' | 'F' = 'F') =>
    polygon([[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]], style)

  // Eight-pointed star: two squares, one turned 45 degrees.
  function star(cx: number, cy: number, r: number) {
    for (const turn of [0, Math.PI / 4]) {
      const pts: [number, number][] = [0, 1, 2, 3].map(i => {
        const a = turn + (i * Math.PI) / 2 + Math.PI / 4
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
      })
      polygon(pts, 'S')
    }
  }

  // Logos, drawn without their text: the GuidanceHub mark for faint background
  // tiles, and the Guidance Tours emblem for the large logos.
  const MARK = '/images/guidancehub-mark.png'
  const EMBLEM = '/images/guidance-tours-emblem.png'
  function drawLogo(src: string, alias: string, cx: number, cy: number, h: number, opacity = 1) {
    const img = imageCache.get(src)
    if (!img) {
      stroke(GOLD, 0.6)
      star(cx, cy, h / 2)
      return
    }
    const w = (h * img.w) / img.h
    if (opacity < 1) doc.setGState(new GState({ opacity }))
    doc.addImage(img.data, 'PNG', cx - w / 2, cy - h / 2, w, h, alias, 'FAST')
    if (opacity < 1) doc.setGState(new GState({ opacity: 1 }))
  }
  const drawMark = (cx: number, cy: number, h: number, opacity = 1) => drawLogo(MARK, 'gh-mark', cx, cy, h, opacity)
  const drawEmblem = (cx: number, cy: number, h: number) => drawLogo(EMBLEM, 'gt-emblem', cx, cy, h)

  const spaced = (text: string) => sanitize(text).toUpperCase()

  // Letter-spaced text. jsPDF's own alignment ignores charSpace, which pushes
  // centred text off-centre, so work out the width and place it by hand.
  function spacedText(text: string, x: number, yy: number, align: 'left' | 'center' | 'right', charSpace: number) {
    const w = doc.getTextWidth(text) + charSpace * Math.max(text.length - 1, 0)
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x
    doc.text(text, x0, yy, { charSpace })
  }

  function textLines(
    text: string,
    opts: {
      size?: number
      style?: 'normal' | 'bold' | 'italic'
      font?: 'helvetica' | 'times'
      color?: RGB
      indent?: number
      width?: number
      lead?: number
    } = {},
  ) {
    const { size = 10, style = 'normal', font = 'helvetica', color = INK, indent = 0, lead = 1.45 } = opts
    doc.setFont(font, style)
    doc.setFontSize(size)
    setColor(color)
    const lines: string[] = doc.splitTextToSize(sanitize(text), (opts.width ?? CW) - indent)
    const lh = lineHeight(size, lead)
    for (const line of lines) {
      ensure(lh)
      doc.text(line, M + indent, y + lh * 0.75)
      y += lh
    }
  }

  function measure(text: string, size: number, width: number, font: 'helvetica' | 'times' = 'helvetica', style: 'normal' | 'bold' | 'italic' = 'normal') {
    doc.setFont(font, style)
    doc.setFontSize(size)
    return (doc.splitTextToSize(sanitize(text), width) as string[]).length
  }

  // ---- images --------------------------------------------------------------
  // Photos can be shrunk so a whole historical site fits on one page.
  let imgScale = 1
  let imgMaxH = Infinity // photos taller than this are cropped to a banner
  let body = 10 // body text size; tightened when a long page needs to fit
  const imgW = () => CW * 0.8 * imgScale
  const fmt = (data: string) => (data.startsWith('data:image/png') ? 'PNG' : 'JPEG')
  function imageHeight(src?: string) {
    const img = options.photos && src ? imageCache.get(src) : null
    return img ? Math.min((imgW() * img.h) / img.w, imgMaxH) + 14 : 0
  }

  function image(src: string, credit: string) {
    const img = imageCache.get(src)
    if (!img) return
    const width = imgW()
    const natural = (width * img.h) / img.w
    const height = Math.min(natural, imgMaxH)
    ensure(height + 14)
    const x = M + (CW - width) / 2
    fill([255, 255, 255])
    stroke(GOLD, 0.6)
    doc.rect(x - 1.6, y - 1.6, width + 3.2, height + 3.2, 'FD')
    if (height < natural) {
      // Crop to the middle band of the photo.
      doc.saveGraphicsState()
      doc.rect(x, y, width, height, null)
      doc.clip()
      doc.discardPath()
      doc.addImage(img.data, fmt(img.data), x, y - (natural - height) / 2, width, natural, undefined, 'FAST')
      doc.restoreGraphicsState()
    } else {
      doc.addImage(img.data, fmt(img.data), x, y, width, height, undefined, 'FAST')
    }
    y += height + 3.2
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7)
    setColor(MUTED)
    doc.text(`Photo: ${sanitize(credit)}`, PAGE_W / 2, y + 2, { align: 'center' })
    y += 7
  }

  // ---- block renderers -----------------------------------------------------
  function subheading(text: string) {
    ensure(lineHeight(12.5) + 12)
    y += 2.5
    fill(GOLD)
    diamond(M + 1.4, y + 3.1, 1.3)
    doc.setFont('times', 'bold')
    doc.setFontSize(12.5)
    setColor(BROWN)
    const lh = lineHeight(12.5)
    const lines: string[] = doc.splitTextToSize(sanitize(titleCase(text)), CW - 6)
    for (const line of lines) {
      ensure(lh)
      doc.text(line, M + 5, y + lh * 0.75)
      y += lh
    }
    y += 1.2
  }

  function lead(text: string) {
    textLines(text, { size: 11.5, style: 'italic', font: 'times', color: BROWN_SOFT, lead: 1.5 })
    y += 3
  }

  function paragraph(text: string) {
    textLines(text, { size: body, lead: body < 10 ? 1.45 : 1.55 })
    y += body < 10 ? 2.2 : 2.8
  }

  function bullets(items: string[], x = M, width = CW) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(body)
    const lh = lineHeight(body, 1.5)
    for (const item of items) {
      const lines: string[] = doc.splitTextToSize(sanitize(item), width - 6)
      ensure(lh)
      fill(GOLD)
      diamond(x + 1.4, y + lh * 0.55, 0.9)
      for (const line of lines) {
        ensure(lh)
        setColor(INK)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(body)
        doc.text(line, x + 5, y + lh * 0.75)
        y += lh
      }
      y += 1
    }
    y += 1.5
  }

  function keyPanel(items: string[]) {
    const inner = CW - 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(body)
    const lh = lineHeight(body, 1.5)
    const heights = items.map(it => (doc.splitTextToSize(sanitize(it), inner - 6) as string[]).length * lh + 1)
    const h = 9 + heights.reduce((a, b) => a + b, 0)
    ensure(h + 3)
    fill(CREAM)
    stroke(GOLD_PALE, 0.4)
    doc.roundedRect(M, y, CW, h, 2.5, 2.5, 'FD')
    fill(GOLD)
    doc.roundedRect(M, y, 2.2, h, 1.1, 1.1, 'F')
    const startY = y
    y += 5
    let yy = y
    // Draw the items inside the panel without page breaks.
    for (const [i, item] of items.entries()) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(body)
      const lines: string[] = doc.splitTextToSize(sanitize(item), inner - 6)
      fill(GOLD)
      diamond(M + 8 + 1.2, yy + lh * 0.55, 0.9)
      setColor(INK)
      lines.forEach(line => {
        doc.text(line, M + 8 + 5, yy + lh * 0.75)
        yy += lh
      })
      yy += heights[i] - lines.length * lh
    }
    y = startY + h + 4
  }

  function linkRow(links: { label: string; url: string }[]) {
    ensure(11)
    let x = M
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9);
    for (const l of links) {
      const label = sanitize(l.label)
      const w = doc.getTextWidth(label) + 12
      if (x + w > M + CW) {
        x = M
        y += 10
        ensure(10)
      }
      fill(GOLD)
      doc.roundedRect(x, y, w, 7.4, 3.7, 3.7, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text(label, x + w / 2, y + 4.9, { align: 'center' })
      doc.link(x, y, w, 7.4, { url: l.url })
      x += w + 3
    }
    y += 11
  }

  function block(b: DrawBlock) {
    switch (b.t) {
      case 'h':
        return subheading(b.text)
      case 'lead':
        return lead(b.text)
      case 'p':
        return paragraph(b.text)
      case 'bullets':
        return b.tag === 'keypoints' ? keyPanel(b.items) : bullets(b.items)
      case 'links':
        return linkRow(b.links)
      case 'link':
        return linkRow([{ label: b.label, url: b.url }])
    }
  }

  // Apply options, drop headings left with nothing under them, merge links.
  function visibleBlocks(blocks: PdfBlock[]): DrawBlock[] {
    const keep = blocks.filter(b => {
      if (b.t === 'bullets' && b.tag === 'keypoints') return options.keyPoints
      if (b.t === 'link' && b.tag === 'map') return options.mapLinks
      return true
    })
    const pruned = keep.filter((b, i) => b.t !== 'h' || (keep[i + 1] && keep[i + 1].t !== 'h'))
    const out: DrawBlock[] = []
    for (const b of pruned) {
      const last = out[out.length - 1]
      if (b.t === 'link') {
        if (last && last.t === 'links') last.links.push({ label: b.label, url: b.url })
        else out.push({ t: 'links', links: [{ label: b.label, url: b.url }] })
      } else out.push(b)
    }
    return out
  }

  // ---- chapters --------------------------------------------------------------
  type Chapter = { key: string; title: string; description: string; groups: CatalogueGroup[] }
  const chapters: Chapter[] = []
  for (const g of groups) {
    let key = g.id
    let title = g.title
    let description = g.description ?? ''
    if (g.id === 'trip') {
      description = 'Your flights, hotels and the plan for each day of your journey.'
    } else if (g.id.startsWith('haramayn-')) {
      key = 'haramayn'
      title = 'The Haramayn'
      description = 'The two sanctuaries: Masjid al-Haram and the Ka’bah in Makkah, and Masjid an-Nabawi and the Rawdah in Madinah.'
    }
    const existing = chapters.find(c => c.key === key)
    if (existing) existing.groups.push(g)
    else chapters.push({ key, title, description, groups: [g] })
  }

  const NUMBER_WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN']
  const chapterPages = new Set<number>()

  function patternAndFrame() {
    fill(BROWN)
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
    for (let row = 0, cy = 34; cy < PAGE_H - 22; row++, cy += 36)
      for (let cx = row % 2 ? 40 : 22; cx < PAGE_W - 16; cx += 36) drawMark(cx, cy, 20, 0.06)
    stroke(GOLD, 0.7)
    doc.rect(10, 10, PAGE_W - 20, PAGE_H - 20, 'S')
    stroke(GOLD, 0.25)
    doc.rect(13, 13, PAGE_W - 26, PAGE_H - 26, 'S')
  }

  // A full-page chapter opener.
  function chapterPage(n: number, title: string, description: string) {
    doc.addPage()
    chapterPages.add(page())
    pageSection.set(page(), title)
    patternAndFrame()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    setColor(GOLD)
    spacedText(`CHAPTER ${NUMBER_WORDS[n - 1] ?? n}`, PAGE_W / 2, 82, 'center', 3)

    drawEmblem(PAGE_W / 2, 122, 66)

    doc.setFont('times', 'bold')
    doc.setFontSize(34)
    doc.setTextColor(255, 255, 255)
    const lines: string[] = doc.splitTextToSize(sanitize(titleCase(title)), CW - 24)
    const shownLines = lines.slice(0, 3)
    shownLines.forEach((l, i) => doc.text(l, PAGE_W / 2, 176 + i * 15, { align: 'center' }))
    const afterTitle = 176 + (shownLines.length - 1) * 15

    stroke(GOLD, 0.4)
    doc.line(PAGE_W / 2 - 38, afterTitle + 12, PAGE_W / 2 - 5, afterTitle + 12)
    doc.line(PAGE_W / 2 + 5, afterTitle + 12, PAGE_W / 2 + 38, afterTitle + 12)
    fill(GOLD)
    diamond(PAGE_W / 2, afterTitle + 12, 1.7)

    doc.setFont('times', 'italic')
    doc.setFontSize(12.5)
    doc.setTextColor(222, 212, 176)
    const desc: string[] = doc.splitTextToSize(sanitize(description), 124)
    desc.slice(0, 5).forEach((l, i) => doc.text(l, PAGE_W / 2, afterTitle + 26 + i * 6.6, { align: 'center' }))
  }

  // ---- section band & item header -----------------------------------------
  function band(title: string) {
    ensure(18)
    fill(BROWN)
    doc.roundedRect(M, y, CW, 15, 2.5, 2.5, 'F')
    fill(GOLD)
    doc.roundedRect(M, y, 2.4, 15, 1.2, 1.2, 'F')
    drawEmblem(M + 12, y + 7.5, 10)
    doc.setFont('times', 'bold')
    doc.setFontSize(15)
    setColor(GOLD)
    const text = sanitize(titleCase(title))
    doc.text(text.length > 50 ? `${text.slice(0, 48)}...` : text, M + 25, y + 9.4)
    y += 21
  }

  function itemHeader(item: CatalogueItem) {
    textLines(titleCase(item.title), { size: 18, style: 'bold', font: 'times', color: BROWN, lead: 1.25 })
    y += 1.5
    if (item.year) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      const w = doc.getTextWidth(sanitize(item.year)) + 7
      fill(GOLD_PALE)
      doc.roundedRect(M, y, w, 5.6, 2.8, 2.8, 'F')
      setColor(GOLD_DARK)
      doc.text(sanitize(item.year), M + w / 2, y + 3.9, { align: 'center' })
      y += 8
    }
    stroke(GOLD_PALE, 0.3)
    doc.line(M, y, M + CW, y)
    stroke(GOLD, 0.9)
    doc.line(M, y, M + 26, y)
    y += 5
  }

  const itemHeadNeed = (it: CatalogueItem) =>
    14 + measure(it.title, 18, CW, 'times', 'bold') * lineHeight(18, 1.25) + (it.year ? 8 : 0) + (imageHeight(it.image?.src) || 22)

  // ---- preload photos -------------------------------------------------------
  imageCache.set(MARK, await loadImage(MARK))
  imageCache.set(EMBLEM, await loadImage(EMBLEM))
  if (options.photos) {
    const srcs = new Set<string>()
    if (options.coverImage) srcs.add(options.coverImage)
    for (const g of groups)
      for (const it of g.items) {
        if (it.image) srcs.add(it.image.src)
        if (it.section?.image) srcs.add(it.section.image.src)
      }
    await Promise.all([...srcs].map(async src => imageCache.set(src, await loadImage(src))))
  }

  // ---- contents layout (written last, once page numbers are known) -----------
  type Entry = { kind: 'chapter' | 'section' | 'item'; label: string; key: string }
  const entries: Entry[] = []
  for (const c of chapters) {
    entries.push({ kind: 'chapter', label: c.title, key: `chapter:${c.key}` })
    for (const g of c.groups) {
      if (c.groups.length > 1) entries.push({ kind: 'section', label: g.title.replace(/^The Haramayn: /, ''), key: g.id })
      for (const it of g.items) entries.push({ kind: 'item', label: it.title, key: it.id })
    }
  }
  const ENTRY_H = { chapter: 9, section: 7, item: 5.6 }
  const contentsPos: { entry: Entry; page: number; y: number }[] = []
  {
    let pg = 0
    let cy = 56
    for (const e of entries) {
      const h = ENTRY_H[e.kind]
      if (cy + h > BOTTOM - 4) {
        pg += 1
        cy = TOP + 6
      }
      contentsPos.push({ entry: e, page: pg, y: cy + (e.kind === 'chapter' ? 3 : e.kind === 'section' ? 1.5 : 0) })
      cy += h
    }
  }
  const contentsPages = (contentsPos.length ? contentsPos[contentsPos.length - 1].page : 0) + 1

  // ---- cover -----------------------------------------------------------------
  patternAndFrame()

  drawEmblem(PAGE_W / 2, 33, 27)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setColor(GOLD)
  spacedText('GUIDANCE TOURS', PAGE_W / 2, 57, 'center', 2.2)
  stroke(GOLD, 0.4)
  doc.line(PAGE_W / 2 - 34, 62, PAGE_W / 2 - 4, 62)
  doc.line(PAGE_W / 2 + 4, 62, PAGE_W / 2 + 34, 62)
  fill(GOLD)
  diamond(PAGE_W / 2, 62, 1.6)

  let titleY = 176
  const cover = options.photos && options.coverImage ? imageCache.get(options.coverImage) : null
  if (cover) {
    const w = 118
    const h = Math.min((w * cover.h) / cover.w, 80)
    const x = (PAGE_W - w) / 2
    fill(BROWN)
    stroke(GOLD, 0.8)
    doc.rect(x - 2.4, 72 - 2.4, w + 4.8, h + 4.8, 'FD')
    doc.addImage(cover.data, fmt(cover.data), x, 72, w, h, undefined, 'FAST')
    titleY = 72 + h + 28
  } else {
    drawEmblem(PAGE_W / 2, 118, 80)
    titleY = 182
  }

  doc.setFont('times', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(255, 255, 255)
  const titleLines: string[] = doc.splitTextToSize(sanitize(options.title), CW - 14)
  titleLines.slice(0, 3).forEach((l, i) => doc.text(l, PAGE_W / 2, titleY + i * 14, { align: 'center' }))
  const subY = titleY + Math.min(titleLines.length, 3) * 14 + 2
  doc.setFont('times', 'italic')
  doc.setFontSize(13)
  setColor(GOLD)
  doc.text('A Personal Guide to Your Umrah', PAGE_W / 2, subY, { align: 'center' })
  stroke(GOLD, 0.4)
  fill(GOLD)
  diamond(PAGE_W / 2, subY + 9, 1.4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(214, 211, 209)
  doc.text(
    `Created ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    PAGE_W / 2,
    PAGE_H - 24,
    { align: 'center' },
  )

  // ---- reserve contents pages, then write the content ---------------------------
  for (let i = 0; i < contentsPages; i++) {
    doc.addPage()
    pageSection.set(page(), 'Contents')
  }

  const pageOf = new Map<string, number>()
  let chapterNo = 0

  for (const c of chapters) {
    chapterNo += 1
    chapterPage(chapterNo, c.title, c.description)
    pageOf.set(`chapter:${c.key}`, page())

    for (const g of c.groups) {
      section = c.title
      const singlePage = g.id.startsWith('sites-')
      if (!singlePage) newPage()
      else pageOf.set(g.id, page() + 1)
      if (!singlePage) pageOf.set(g.id, page())
      const lead0 = g.items[0]

      if (c.groups.length > 1) {
        band(g.title.replace(/^The Haramayn: /, ''))
        if (lead0?.section) {
          lead(lead0.section.intro)
          if (options.photos && lead0.section.image) image(lead0.section.image.src, lead0.section.image.credit)
        }
      }

      function drawItem(item: CatalogueItem, withPhoto: boolean) {
        itemHeader(item)
        if (withPhoto && options.photos && item.image) image(item.image.src, item.image.credit)
        for (const b of visibleBlocks(item.blocks)) block(b)
      }

      for (const item of g.items) {
        if (singlePage) {
          // Every site gets its own page. Shrink (then drop) the photo until it all fits.
          const before = doc.getNumberOfPages()
          type Attempt = { scale: number; maxH: number; body: number; photo: boolean }
          const attempts: Attempt[] =
            options.photos && item.image
              ? [
                  { scale: 1, maxH: Infinity, body: 10, photo: true },
                  { scale: 0.8, maxH: Infinity, body: 10, photo: true },
                  { scale: 1, maxH: 62, body: 10, photo: true },
                  { scale: 1, maxH: 48, body: 10, photo: true },
                  { scale: 1, maxH: 38, body: 10, photo: true },
                  { scale: 1, maxH: 40, body: 9, photo: true },
                  { scale: 1, maxH: 30, body: 9, photo: true },
                  { scale: 1, maxH: 0, body: 9, photo: false },
                ]
              : [{ scale: 1, maxH: Infinity, body: 10, photo: false }]
          for (const [k, a] of attempts.entries()) {
            imgScale = a.scale
            imgMaxH = a.maxH
            body = a.body
            newPage()
            pageOf.set(item.id, page())
            drawItem(item, a.photo)
            if (doc.getNumberOfPages() === before + 1 || k === attempts.length - 1) break
            for (let pn = doc.getNumberOfPages(); pn > before; pn--) doc.deletePage(pn)
            doc.setPage(before)
          }
          imgScale = 1
          imgMaxH = Infinity
          body = 10
        } else {
          ensure(itemHeadNeed(item))
          pageOf.set(item.id, page())
          drawItem(item, true)
          y += 6
        }

        done += 1
        onProgress?.(done, total)
      }
    }
  }

  ensure(14)
  textLines('Summaries are for general guidance. Your guides will share more detail on the day.', {
    size: 9,
    style: 'italic',
    font: 'times',
    color: MUTED,
  })

  // ---- fill in the contents pages ----------------------------------------------
  for (const { entry, page: cp, y: ey } of contentsPos) {
    doc.setPage(2 + cp)
    const pg = pageOf.get(entry.key)
    const num = pg ? String(shown(pg)) : ''
    if (entry.kind === 'chapter') {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      setColor(GOLD_DARK)
      doc.text(spaced(entry.label).slice(0, 56), M, ey + 3, { charSpace: 0.5 })
      doc.text(num, PAGE_W - M, ey + 3, { align: 'right' })
      stroke(GOLD_PALE, 0.3)
      doc.line(M, ey + 4.6, PAGE_W - M, ey + 4.6)
      if (pg) doc.link(M, ey - 1, CW, 7, { pageNumber: pg })
    } else if (entry.kind === 'section') {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      setColor(BROWN)
      doc.text(sanitize(titleCase(entry.label)).slice(0, 60), M + 2, ey + 3.4)
      doc.text(num, PAGE_W - M, ey + 3.4, { align: 'right' })
      if (pg) doc.link(M, ey, CW, 5.6, { pageNumber: pg })
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      setColor(INK)
      const label = sanitize(titleCase(entry.label))
      const clipped = label.length > 62 ? `${label.slice(0, 60)}...` : label
      doc.text(clipped, M + 6, ey + 3.4)
      const tw = doc.getTextWidth(clipped)
      doc.setLineDashPattern([0.3, 1.1], 0)
      stroke(MUTED, 0.2)
      doc.line(M + 6 + tw + 2, ey + 3.4, PAGE_W - M - 8, ey + 3.4)
      doc.setLineDashPattern([], 0)
      doc.text(num, PAGE_W - M, ey + 3.4, { align: 'right' })
      if (pg) doc.link(M, ey, CW, 5.6, { pageNumber: pg })
    }
  }
  for (let i = 0; i < contentsPages; i++) {
    doc.setPage(2 + i)
    const top = i === 0 ? 28 : TOP
    if (i === 0) {
      doc.setFont('times', 'bold')
      doc.setFontSize(26)
      setColor(BROWN)
      doc.text('Contents', M, top + 8)
      stroke(GOLD_PALE, 0.3)
      doc.line(M, top + 14, M + CW, top + 14)
      stroke(GOLD, 0.9)
      doc.line(M, top + 14, M + 26, top + 14)
      fill(GOLD)
      diamond(M + CW - 1.5, top + 14, 1.5)
    }
  }

  // ---- running headers and footers --------------------------------------------
  const pages = doc.getNumberOfPages()
  for (let p = 2; p <= pages; p++) {
    if (chapterPages.has(p)) continue
    doc.setPage(p)
    // header
    stroke(GOLD_PALE, 0.3)
    doc.line(M, 14, PAGE_W - M, 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setColor(MUTED)
    spacedText('GUIDANCE TOURS', M, 11, 'left', 0.8)
    spacedText(spaced(pageSection.get(p) ?? '').slice(0, 60), PAGE_W - M, 11, 'right', 0.4)
    // footer
    stroke(GOLD, 0.3)
    doc.line(M, PAGE_H - 14, PAGE_W - M, PAGE_H - 14)
    fill(GOLD)
    diamond(PAGE_W / 2, PAGE_H - 14, 1.2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setColor(MUTED)
    doc.text(sanitize(options.title), M, PAGE_H - 9)
    doc.text(`Page ${shown(p)} of ${pages - 1}`, PAGE_W - M, PAGE_H - 9, { align: 'right' })
  }

  doc.setPage(1)
  return doc
}
