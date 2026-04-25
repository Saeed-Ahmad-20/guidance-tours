import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { sendBookingExpired, sendExpiryWarning } from '../../../lib/emails'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type WarnRow = {
  id: string
  reservation_code: string
  lead_given_names: string
  lead_email: string | null
  deposit_amount_gbp: number
}

type ExpiredRow = {
  id: string
  reservation_code: string
  lead_given_names: string
  lead_email: string | null
}

async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
  }

  const db = supabaseAdmin()
  const now = new Date()
  const oneHourAhead = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
  let warned = 0
  let expiredNotified = 0
  let swept = 0

  // 1) Warn bookings nearing expiry that haven't marked deposit sent yet.
  const { data: warnCandidates, error: warnErr } = await db
    .from('reservations')
    .select('id, reservation_code, lead_given_names, lead_email, deposit_amount_gbp')
    .eq('status', 'pending_payment')
    .is('warning_sent_at', null)
    .is('transfer_submitted_at', null)
    .lte('expires_at', oneHourAhead)
    .gte('expires_at', now.toISOString())

  if (warnErr) {
    console.error('[cron] warn query error:', warnErr.message)
  } else if (warnCandidates) {
    for (const row of warnCandidates as WarnRow[]) {
      await sendExpiryWarning({
        to: row.lead_email,
        leadGivenNames: row.lead_given_names,
        reservationCode: row.reservation_code,
        depositAmountGBP: row.deposit_amount_gbp,
      })
      const { error: markErr } = await db
        .from('reservations')
        .update({ warning_sent_at: new Date().toISOString() })
        .eq('id', row.id)
      if (markErr) console.error('[cron] mark warning error:', markErr.message)
      else warned++
    }
  }

  // 2) Expire anything past its window.
  const { data: sweptCount, error: sweepErr } = await db.rpc('expire_old_reservations')
  if (sweepErr) console.error('[cron] sweep error:', sweepErr.message)
  else swept = Number(sweptCount ?? 0)

  // 3) Notify newly-expired bookings (not previously notified).
  const { data: expiredCandidates, error: expErr } = await db
    .from('reservations')
    .select('id, reservation_code, lead_given_names, lead_email')
    .eq('status', 'expired')
    .is('expiry_notified_at', null)

  if (expErr) {
    console.error('[cron] expired query error:', expErr.message)
  } else if (expiredCandidates) {
    for (const row of expiredCandidates as ExpiredRow[]) {
      await sendBookingExpired({
        to: row.lead_email,
        leadGivenNames: row.lead_given_names,
        reservationCode: row.reservation_code,
      })
      const { error: markErr } = await db
        .from('reservations')
        .update({ expiry_notified_at: new Date().toISOString() })
        .eq('id', row.id)
      if (markErr) console.error('[cron] mark expired error:', markErr.message)
      else expiredNotified++
    }
  }

  return NextResponse.json({
    ok: true,
    warned,
    swept,
    expiredNotified,
    at: now.toISOString(),
  })
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
