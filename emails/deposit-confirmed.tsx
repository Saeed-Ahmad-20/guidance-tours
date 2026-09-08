import { Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

const confirmBox = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: 10,
  padding: '16px 20px',
  margin: '12px 0',
}
const confirmText = {
  color: '#064e3b',
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,
}
const shortfallBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fde68a',
  borderRadius: 10,
  padding: '16px 20px',
  margin: '12px 0',
}
const shortfallText = {
  color: '#78350f',
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,
}

export default function DepositConfirmedEmail({
  leadGivenNames,
  reservationCode,
  totalPeople,
  depositAmountGBP,
  amountReceivedGBP,
  isBalanceTopUp,
  totalCostGBP,
}: {
  leadGivenNames: string
  reservationCode: string
  totalPeople: number
  depositAmountGBP: number
  amountReceivedGBP?: number
  isBalanceTopUp?: boolean
  totalCostGBP?: number
}) {
  const isPartial = !isBalanceTopUp && amountReceivedGBP !== undefined && amountReceivedGBP < depositAmountGBP
  const shortfall = isPartial ? depositAmountGBP - amountReceivedGBP! : 0
  const remainingBalance =
    isBalanceTopUp && totalCostGBP !== undefined && amountReceivedGBP !== undefined
      ? Math.max(0, totalCostGBP - amountReceivedGBP)
      : 0

  return (
    <EmailShell
      preview={
        isBalanceTopUp
          ? `Payment received — ${reservationCode}`
          : isPartial
          ? `Partial deposit received — ${reservationCode}`
          : `Deposit received — ${reservationCode} is confirmed`
      }
      title={isBalanceTopUp ? 'Payment received' : isPartial ? 'Partial deposit received' : 'Your place is confirmed'}
    >
      <Text style={styles.paragraph}>
        Assalamu Alaykum {leadGivenNames},
      </Text>
      {isBalanceTopUp ? (
        <>
          <Text style={styles.paragraph}>
            Thank you — we&apos;ve received your payment for reservation{' '}
            <strong>{reservationCode}</strong>.
          </Text>
          <Section style={confirmBox}>
            <Text style={confirmText}>
              {remainingBalance > 0
                ? `Remaining balance: £${remainingBalance.toLocaleString('en-GB')}`
                : 'Your booking is now paid in full.'}
            </Text>
          </Section>
        </>
      ) : isPartial ? (
        <>
          <Text style={styles.paragraph}>
            We&apos;ve received a payment of{' '}
            <strong>£{amountReceivedGBP!.toLocaleString('en-GB')}</strong> for reservation{' '}
            <strong>{reservationCode}</strong>. However, this is less than the full deposit of{' '}
            <strong>£{depositAmountGBP.toLocaleString('en-GB')}</strong>.
          </Text>
          <Section style={shortfallBox}>
            <Text style={shortfallText}>
              <strong>Outstanding balance: £{shortfall.toLocaleString('en-GB')}</strong>
              <br />
              Please transfer the remaining amount using your reservation code{' '}
              <strong>{reservationCode}</strong> as the reference. If you believe this is an
              error, please reply to this email or WhatsApp us on <strong>07983 432 900</strong>.
            </Text>
          </Section>
          <Text style={styles.paragraph}>
            Your place will be fully secured once we receive the outstanding balance.
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.paragraph}>
            Great news — we&apos;ve received your deposit of{' '}
            <strong>£{depositAmountGBP.toLocaleString('en-GB')}</strong> for reservation{' '}
            <strong>{reservationCode}</strong>.
          </Text>
          <Section style={confirmBox}>
            <Text style={confirmText}>
              ✓ Your {totalPeople} {totalPeople === 1 ? 'place is' : 'places are'} now locked in for
              the Umrah October 2026 trip.
            </Text>
          </Section>
          <Text style={styles.paragraph}>
            The remaining package balance is due <strong>8 weeks before departure</strong> (by{' '}
            <strong>30 August 2026</strong>). We&apos;ll be in touch closer to the time with
            final details, the pre-travel seminar date, and everything else you need.
          </Text>
        </>
      )}
      <Text style={styles.paragraph}>
        If you have any questions in the meantime, WhatsApp us on{' '}
        <strong>07983 432 900</strong>.
      </Text>
    </EmailShell>
  )
}
