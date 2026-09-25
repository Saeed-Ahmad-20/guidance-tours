// One-off "your passenger portal has been updated" email to every lead passenger.
// Run from the repo root (reads .env.local):
//   npx tsx scripts/send-portal-update.mts --list
//   npx tsx scripts/send-portal-update.mts --preview you@example.com [RESERVATIONCODE]
//   npx tsx scripts/send-portal-update.mts --send-all
// --send-all records each booking it emails in scripts/portal-update-sent.log and
// skips those on a re-run, so running it twice never emails anyone twice.
import { readFileSync, existsSync, appendFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const repo = process.cwd()
const require = createRequire(join(repo, 'package.json'))
const React = require('react')
const { Resend } = require('resend')
const { render } = require('@react-email/render')
const { createClient } = require('@supabase/supabase-js')
const Email = (await import(pathToFileURL(join(repo, 'emails/portal-update.tsx')).href)).default

for (const line of readFileSync(join(repo, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const PORTAL_ORIGIN = 'https://portal.guidancetours.co.uk'
const SENT_LOG = join(repo, 'scripts', 'portal-update-sent.log')
const [mode, arg1, arg2] = process.argv.slice(2)

type Booking = { reservation_code: string; lead_given_names: string; lead_email: string | null; total_people: number }

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const { data, error } = await db
  .from('reservations')
  .select('reservation_code, lead_given_names, lead_email, total_people')
  .in('status', ['pending_payment', 'transfer_submitted', 'confirmed'])
  .order('reservation_code')
if (error) throw error
const bookings = data as Booking[]
const withEmail = bookings.filter(b => b.lead_email?.trim())
const alreadySent = new Set(existsSync(SENT_LOG) ? readFileSync(SENT_LOG, 'utf8').split(/\r?\n/).filter(Boolean) : [])

async function deliver(b: Booking, to: string, subjectPrefix = '') {
  const html = await render(
    React.createElement(Email, {
      leadGivenNames: b.lead_given_names.trim(),
      reservationCode: b.reservation_code,
      totalPeople: b.total_people,
      portalUrl: `${PORTAL_ORIGIN}?code=${encodeURIComponent(b.reservation_code)}`,
      portalHost: new URL(PORTAL_ORIGIN).host,
    })
  )
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${subjectPrefix}Your passenger portal has been updated — reservation ${b.reservation_code}`,
    html,
  })
  if (error) throw new Error(error.message)
}

if (mode === '--list') {
  console.log(`from: ${process.env.EMAIL_FROM}`)
  console.log(`active bookings: ${bookings.length} | with lead email: ${withEmail.length} | already sent: ${withEmail.filter(b => alreadySent.has(b.reservation_code)).length}`)
  const none = bookings.filter(b => !b.lead_email?.trim())
  if (none.length) console.log(`no email on file: ${none.map(b => b.reservation_code).join(', ')}`)
} else if (mode === '--preview') {
  if (!arg1) throw new Error('Give an address: --preview you@example.com [RESERVATIONCODE]')
  const sample = arg2 ? bookings.find(b => b.reservation_code === arg2) : withEmail.find(b => b.total_people > 1)
  if (!sample) throw new Error(`No active booking ${arg2}`)
  await deliver(sample, arg1, '[PREVIEW] ')
  console.log(`preview sent to ${arg1} using booking ${sample.reservation_code}`)
} else if (mode === '--send-all') {
  let sent = 0
  for (const b of withEmail) {
    if (alreadySent.has(b.reservation_code)) continue
    try {
      await deliver(b, b.lead_email!.trim())
      appendFileSync(SENT_LOG, `${b.reservation_code}\n`)
      sent++
      console.log(`sent ${b.reservation_code}`)
    } catch (e) {
      console.log(`FAILED ${b.reservation_code}: ${(e as Error).message}`)
    }
    await new Promise(r => setTimeout(r, 700))
  }
  console.log(`done: ${sent} sent`)
} else {
  console.log('usage: --list | --preview <email> [RESERVATIONCODE] | --send-all')
}
