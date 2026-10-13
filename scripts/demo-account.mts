// The portal demo account: a fully paid, confirmed booking with a double room and sample travel documents, on its own "demo-portal" tour, so it
// never counts towards the real tour's places, money or rooms, and has no email address, so
// no announcement script can reach it.
// Run from the repo root (reads .env.local):
//   npx tsx scripts/demo-account.mts --create     (also resets it to the original details)
//   npx tsx scripts/demo-account.mts --remove
//   npx tsx scripts/demo-account.mts --status
// Log in at the portal with: reservation number DEMO2026, surname Demo, date of birth 01/01/1990
// (the lead passenger, who sees the whole booking) or 02/02/1992 (a second passenger).
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const repo = process.cwd()
const require = createRequire(join(repo, 'package.json'))
const { createClient } = require('@supabase/supabase-js')
const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib')

for (const line of readFileSync(join(repo, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const CODE = 'DEMO2026'
const TOUR_SLUG = 'demo-portal'
const REAL_TOUR_SLUG = 'umrah-2026'
const BUCKET = 'travel-documents'
const mode = process.argv[2]

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const fail = (what: string, e: { message: string } | null) => {
  if (e) throw new Error(`${what}: ${e.message}`)
}

async function find() {
  const { data: tour, error: te } = await db.from('tours').select('id').eq('slug', TOUR_SLUG).maybeSingle()
  fail('find tour', te)
  const { data: res, error: re } = await db.from('reservations').select('id').eq('reservation_code', CODE).maybeSingle()
  fail('find reservation', re)
  return { tourId: tour?.id as string | undefined, reservationId: res?.id as string | undefined }
}

async function remove() {
  const { tourId, reservationId } = await find()
  if (reservationId) {
    // The files live in storage, so they have to be deleted along with the rows.
    const { data: docs } = await db.from('passenger_documents').select('storage_path').eq('reservation_id', reservationId)
    const paths = (docs ?? []).map((d: { storage_path: string }) => d.storage_path)
    if (paths.length) fail('delete document files', (await db.storage.from(BUCKET).remove(paths)).error)
    for (const t of ['passenger_checklist', 'passenger_documents']) {
      const col = t === 'passenger_checklist' ? 'passenger_id' : 'reservation_id'
      if (col === 'passenger_id') {
        const { data: pax } = await db.from('reservation_passengers').select('id').eq('reservation_id', reservationId)
        const ids = (pax ?? []).map((p: { id: string }) => p.id)
        if (ids.length) fail(`clear ${t}`, (await db.from(t).delete().in('passenger_id', ids)).error)
      } else fail(`clear ${t}`, (await db.from(t).delete().eq('reservation_id', reservationId)).error)
    }
    fail('delete passengers', (await db.from('reservation_passengers').delete().eq('reservation_id', reservationId)).error)
    fail('delete reservation', (await db.from('reservations').delete().eq('id', reservationId)).error)
  }
  if (tourId) fail('delete rooms', (await db.from('room_allocations').delete().eq('tour_id', tourId)).error)
  if (tourId) fail('delete tour', (await db.from('tours').delete().eq('id', tourId)).error)
  return { removed: Boolean(reservationId || tourId) }
}

async function create() {
  await remove() // start clean, so this also resets any changes a demo visitor made

  // Copy the real tour's dates and prices, so ages and amounts look right.
  const { data: real, error: rl } = await db.from('tours').select('*').eq('slug', REAL_TOUR_SLUG).maybeSingle()
  fail('load real tour', rl)
  if (!real) throw new Error(`Tour ${REAL_TOUR_SLUG} not found`)
  const { id: _id, created_at: _c, ...tourCopy } = real
  const { data: tour, error: ti } = await db.from('tours').insert({ ...tourCopy, slug: TOUR_SLUG, total_places: 10 }).select('id').single()
  fail('create tour', ti)

  const total = real.double_price_gbp * 2
  const deposit = real.deposit_per_person_gbp * 2
  const now = new Date()
  const { data: res, error: ri } = await db
    .from('reservations')
    .insert({
      reservation_code: CODE,
      tour_id: tour.id,
      lead_surname: 'Demo',
      lead_given_names: 'Demo',
      lead_email: null,
      lead_phone: null,
      quad_rooms: 0,
      triple_rooms: 0,
      double_rooms: 1,
      total_people: 2,
      total_cost_gbp: total,
      deposit_amount_gbp: deposit,
      amount_received_gbp: total, // fully paid, so the portal never offers a payment
      status: 'confirmed',
      confirmed_at: now.toISOString(),
      confirmed_by: 'demo-account',
      expires_at: new Date(now.getTime() + 10 * 365 * 24 * 3600 * 1000).toISOString(),
    })
    .select('id')
    .single()
  fail('create reservation', ri)

  const passenger = (position: number, given: string, dob: string) => ({
    reservation_id: res.id,
    position,
    room_type: 'double',
    room_index: 0,
    person_type: 'adult',
    given_names: given,
    surname: 'Demo',
    date_of_birth: dob,
    passport_expiry: '2032-01-01',
    passport_renewal_required: false,
  })
  // A physical double room, named after the lead passenger like the real ones, with both in it.
  const { data: room, error: roi } = await db
    .from('room_allocations')
    .insert({ tour_id: tour.id, room_type: 'double', label: 'Demo Demo' })
    .select('id')
    .single()
  fail('create room', roi)
  const { data: pax, error: pi } = await db
    .from('reservation_passengers')
    .insert([
      { ...passenger(0, 'Demo', '1990-01-01'), room_allocation_id: room.id },
      { ...passenger(1, 'Guest', '1992-02-02'), room_allocation_id: room.id },
    ])
    .select('id, given_names, surname, position')
  fail('create passengers', pi)
  const people = [...pax].sort((a: any, b: any) => a.position - b.position)
  await addDocuments(res.id, people.map((p: any) => ({ id: p.id, name: `${p.given_names} ${p.surname}` })))
}

// A one-page sample PDF, marked as a demo so it can't be mistaken for a real document.
async function samplePdf(title: string, rows: [string, string][]): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  page.drawRectangle({ x: 0, y: 762, width: 595, height: 80, color: rgb(0.17, 0.12, 0.05) })
  page.drawText('GUIDANCE TOURS', { x: 40, y: 806, size: 11, font: bold, color: rgb(0.77, 0.64, 0.28) })
  page.drawText(title, { x: 40, y: 780, size: 22, font: bold, color: rgb(1, 1, 1) })
  let y = 710
  for (const [label, value] of rows) {
    page.drawText(label.toUpperCase(), { x: 40, y, size: 8, font: bold, color: rgb(0.47, 0.44, 0.42) })
    page.drawText(value, { x: 40, y: y - 17, size: 13, font, color: rgb(0.1, 0.09, 0.09) })
    y -= 52
  }
  page.drawText('SAMPLE', { x: 95, y: 250, size: 130, font: bold, color: rgb(0.85, 0.2, 0.2), opacity: 0.16, rotate: degrees(35) })
  page.drawText('Sample document for the portal demo account. Not valid for travel.', { x: 40, y: 40, size: 10, font, color: rgb(0.47, 0.44, 0.42) })
  return Buffer.from(await pdf.save())
}

async function addDocuments(reservationId: string, passengers: { id: string; name: string }[]) {
  const dates = 'Sun 25 Oct 2026 to Wed 4 Nov 2026'
  for (const [i, p] of passengers.entries()) {
    const ref = `DEMO${i + 1}`
    const docs: { type: string; label: string; title: string; rows: [string, string][] }[] = [
      {
        type: 'flight_ticket',
        label: 'Flight ticket: Manchester, Madinah and return',
        title: 'Flight e-ticket',
        rows: [
          ['Passenger', p.name],
          ['Booking reference', `${ref}FLT`],
          ['Outbound, Sun 25 Oct', 'MS782 Manchester 13:30 to Cairo 21:50'],
          ['Connecting, Mon 26 Oct', 'MS675 Cairo 00:20 to Madinah 02:15'],
          ['Return, Wed 4 Nov', 'MS674 Jeddah 05:40 to Cairo 07:00'],
          ['Connecting, Wed 4 Nov', 'MS781 Cairo 08:55 to Manchester 12:30'],
          ['Baggage', '2 x 23kg hold and 7kg cabin'],
        ],
      },
      {
        type: 'train_ticket',
        label: 'Train ticket: Madinah to Makkah',
        title: 'High-speed train ticket',
        rows: [
          ['Passenger', p.name],
          ['Booking reference', `${ref}TRN`],
          ['Date', 'Sat 31 Oct 2026'],
          ['Journey', 'Madinah 12:50 to Makkah 15:05'],
          ['Class', 'Economy'],
        ],
      },
      {
        type: 'e_visa',
        label: 'E-visa',
        title: 'E-visa',
        rows: [
          ['Holder', p.name],
          ['Visa reference', `${ref}VISA`],
          ['Type', 'Umrah'],
          ['Travel dates', dates],
        ],
      },
    ]
    for (const d of docs) {
      const path = `${reservationId}/${randomUUID()}.pdf`
      const buffer = await samplePdf(d.title, d.rows)
      fail('upload document', (await db.storage.from(BUCKET).upload(path, buffer, { contentType: 'application/pdf' })).error)
      fail(
        'save document',
        (await db.from('passenger_documents').insert({
          reservation_id: reservationId,
          passenger_id: p.id,
          doc_type: d.type,
          label: d.label,
          storage_path: path,
          mime_type: 'application/pdf',
          uploaded_by: 'demo-account',
        })).error,
      )
    }
  }
}

async function status() {
  const { tourId, reservationId } = await find()
  if (!reservationId) return console.log('Demo account: not created')
  const { data: pax } = await db.from('reservation_passengers').select('given_names, surname, date_of_birth, position, room_allocation_id').eq('reservation_id', reservationId).order('position')
  const { count } = await db.from('passenger_documents').select('id', { count: 'exact', head: true }).eq('reservation_id', reservationId)
  console.log(`  ${count ?? 0} sample documents`)
  console.log(`Demo account exists (tour ${tourId}, reservation ${reservationId})`)
  for (const p of pax ?? []) console.log(`  ${p.position === 0 ? 'lead ' : 'guest'}: ${p.given_names} ${p.surname}, born ${p.date_of_birth}, ${p.room_allocation_id ? 'room assigned' : 'no room'}`)
}

if (mode === '--create') { await create(); console.log('Demo account created.'); await status() }
else if (mode === '--remove') console.log((await remove()).removed ? 'Demo account removed.' : 'Nothing to remove.')
else if (mode === '--status') await status()
else console.log('usage: --create | --remove | --status')
