import { Resend } from 'resend'
import BookingCreatedEmail from '../../emails/booking-created'
import DepositSubmittedEmail from '../../emails/deposit-submitted'
import DepositConfirmedEmail from '../../emails/deposit-confirmed'
import ExpiryWarningEmail from '../../emails/expiry-warning'
import BookingExpiredEmail from '../../emails/booking-expired'
import StatusRevertedEmail from '../../emails/status-reverted'

let cached: Resend | null = null

function client(): Resend | null {
  if (cached) return cached
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[emails] RESEND_API_KEY not set — emails disabled.')
    return null
  }
  cached = new Resend(key)
  return cached
}

function from(): string {
  return process.env.EMAIL_FROM || 'Guidance Tours <onboarding@resend.dev>'
}

function siteUrl(): string {
  return process.env.SITE_URL || 'https://www.guidancetours.co.uk'
}

function adminSiteUrl(): string {
  return process.env.ADMIN_SITE_URL || 'https://admin.guidancetours.co.uk'
}

function adminEmail(): string | null {
  return process.env.ADMIN_NOTIFICATION_EMAIL || null
}

async function send(args: {
  to: string
  subject: string
  react: React.ReactElement
}): Promise<void> {
  const resend = client()
  if (!resend) return
  try {
    const { error } = await resend.emails.send({
      from: from(),
      to: args.to,
      subject: args.subject,
      react: args.react,
    })
    if (error) console.error('[emails] send error:', error.message)
  } catch (err) {
    console.error('[emails] unexpected:', err)
  }
}

export async function sendBookingCreated(args: {
  to: string | null
  leadGivenNames: string
  reservationCode: string
  depositAmountGBP: number
  totalPeople: number
}): Promise<void> {
  if (!args.to) return
  const portalUrl = `${siteUrl()}/portal?code=${encodeURIComponent(args.reservationCode)}`
  await send({
    to: args.to,
    subject: `Reservation ${args.reservationCode} — transfer £${args.depositAmountGBP} to secure your place`,
    react: BookingCreatedEmail({
      leadGivenNames: args.leadGivenNames,
      reservationCode: args.reservationCode,
      depositAmountGBP: args.depositAmountGBP,
      totalPeople: args.totalPeople,
      portalUrl,
    }),
  })
}

export async function sendDepositSubmitted(args: {
  reservationId: string
  reservationCode: string
  leadName: string
  leadEmail: string | null
  leadPhone: string | null
  totalPeople: number
  depositAmountGBP: number
}): Promise<void> {
  const to = adminEmail()
  if (!to) return
  const adminBookingUrl = `${adminSiteUrl()}/bookings/${args.reservationId}`
  await send({
    to,
    subject: `Deposit sent: ${args.reservationCode} (£${args.depositAmountGBP})`,
    react: DepositSubmittedEmail({
      leadName: args.leadName,
      leadEmail: args.leadEmail,
      leadPhone: args.leadPhone,
      reservationCode: args.reservationCode,
      totalPeople: args.totalPeople,
      depositAmountGBP: args.depositAmountGBP,
      adminBookingUrl,
    }),
  })
}

export async function sendDepositConfirmed(args: {
  to: string | null
  leadGivenNames: string
  reservationCode: string
  totalPeople: number
  depositAmountGBP: number
  amountReceivedGBP?: number
}): Promise<void> {
  if (!args.to) return
  const isPartial = args.amountReceivedGBP !== undefined && args.amountReceivedGBP < args.depositAmountGBP
  await send({
    to: args.to,
    subject: isPartial
      ? `Partial deposit received — action needed for ${args.reservationCode}`
      : `Your Umrah place is confirmed — ${args.reservationCode}`,
    react: DepositConfirmedEmail({
      leadGivenNames: args.leadGivenNames,
      reservationCode: args.reservationCode,
      totalPeople: args.totalPeople,
      depositAmountGBP: args.depositAmountGBP,
      amountReceivedGBP: args.amountReceivedGBP,
    }),
  })
}

export async function sendExpiryWarning(args: {
  to: string | null
  leadGivenNames: string
  reservationCode: string
  depositAmountGBP: number
}): Promise<void> {
  if (!args.to) return
  const portalUrl = `${siteUrl()}/portal?code=${encodeURIComponent(args.reservationCode)}`
  await send({
    to: args.to,
    subject: `1 hour left — confirm your deposit for ${args.reservationCode}`,
    react: ExpiryWarningEmail({
      leadGivenNames: args.leadGivenNames,
      reservationCode: args.reservationCode,
      depositAmountGBP: args.depositAmountGBP,
      portalUrl,
    }),
  })
}

export async function sendStatusReverted(args: {
  to: string | null
  leadGivenNames: string
  reservationCode: string
  targetStatus: 'pending_payment' | 'transfer_submitted'
  adminNote?: string
  portalUrl: string
}): Promise<void> {
  if (!args.to) return
  const subject =
    args.targetStatus === 'pending_payment'
      ? `Action needed on your booking ${args.reservationCode}`
      : `Update on your booking ${args.reservationCode}`
  await send({
    to: args.to,
    subject,
    react: StatusRevertedEmail({
      leadGivenNames: args.leadGivenNames,
      reservationCode: args.reservationCode,
      targetStatus: args.targetStatus,
      adminNote: args.adminNote,
      portalUrl: args.portalUrl,
    }),
  })
}

export async function sendBookingExpired(args: {
  to: string | null
  leadGivenNames: string
  reservationCode: string
}): Promise<void> {
  if (!args.to) return
  const bookUrl = `${siteUrl()}/umrah-2026/book`
  await send({
    to: args.to,
    subject: `Your booking ${args.reservationCode} has been released`,
    react: BookingExpiredEmail({
      leadGivenNames: args.leadGivenNames,
      reservationCode: args.reservationCode,
      bookUrl,
    }),
  })
}
