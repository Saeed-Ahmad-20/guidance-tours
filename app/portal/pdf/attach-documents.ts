// Appends the passenger's own travel documents (PDFs and images) to the end of
// the finished guide. PDFs are copied page for page, untouched, so ticket QR
// codes and barcodes stay scannable. Runs in the browser.

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { AttachableDoc } from './catalogue'
import { sanitize } from './make-pdf'

const A4: [number, number] = [595.28, 841.89]

// pdf-lib embeds JPEG and PNG only, so anything else is redrawn as PNG.
async function toPng(blob: Blob): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
  const png = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
  if (!png) throw new Error('png')
  return new Uint8Array(await png.arrayBuffer())
}

export async function attachTravelDocuments(
  guide: ArrayBuffer | null,
  docs: AttachableDoc[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ bytes: Uint8Array; failed: string[] }> {
  const out = guide ? await PDFDocument.load(guide) : await PDFDocument.create()
  const font = await out.embedFont(StandardFonts.HelveticaBold)
  const failed: string[] = []
  let done = 0

  for (const d of docs) {
    try {
      const res = await fetch(d.url)
      if (!res.ok) throw new Error(String(res.status))

      if (d.mime === 'application/pdf') {
        const src = await PDFDocument.load(await res.arrayBuffer(), { ignoreEncryption: true })
        const pages = await out.copyPages(src, src.getPageIndices())
        pages.forEach(p => out.addPage(p))
      } else {
        const blob = await res.blob()
        const jpeg = d.mime === 'image/jpeg'
        const png = d.mime === 'image/png'
        const img = jpeg
          ? await out.embedJpg(await blob.arrayBuffer())
          : await out.embedPng(png ? await blob.arrayBuffer() : await toPng(blob))
        const page = out.addPage(A4)
        const margin = 36
        const labelH = 26
        const scale = Math.min(
          (A4[0] - margin * 2) / img.width,
          (A4[1] - margin * 2 - labelH) / img.height,
        )
        const w = img.width * scale
        const h = img.height * scale
        page.drawText(sanitize(d.label).slice(0, 80), {
          x: margin,
          y: A4[1] - margin - 10,
          size: 11,
          font,
          color: rgb(0.17, 0.12, 0.05),
        })
        page.drawImage(img, { x: (A4[0] - w) / 2, y: A4[1] - margin - labelH - h, width: w, height: h })
      }
    } catch {
      failed.push(d.label)
    }
    done += 1
    onProgress?.(done, docs.length)
  }

  return { bytes: await out.save(), failed }
}
