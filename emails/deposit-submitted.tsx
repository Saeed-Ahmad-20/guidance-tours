import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

const button = {
  backgroundColor: '#1c1917',
  borderRadius: 9999,
  color: '#ffffff',
  display: 'inline-block',
  fontSize: 14,
  fontWeight: 700,
  padding: '10px 22px',
  textDecoration: 'none',
}

export default function DepositSubmittedEmail({
  leadName,
  leadEmail,
  leadPhone,
  reservationCode,
  totalPeople,
  depositAmountGBP,
  adminBookingUrl,
}: {
  leadName: string
  leadEmail: string | null
  leadPhone: string | null
  reservationCode: string
  totalPeople: number
  depositAmountGBP: number
  adminBookingUrl: string
}) {
  return (
    <EmailShell
      preview={`Deposit marked sent: ${reservationCode} · £${depositAmountGBP}`}
      title="A customer has sent a deposit"
    >
      <Text style={styles.paragraph}>
        <strong>{leadName}</strong> has marked their deposit as sent for reservation{' '}
        <strong>{reservationCode}</strong>.
      </Text>
      <Text style={styles.paragraph}>
        <strong>People:</strong> {totalPeople}
        <br />
        <strong>Deposit amount:</strong> £{depositAmountGBP.toLocaleString('en-GB')}
        <br />
        <strong>Bank reference to look for:</strong> {reservationCode}
        {leadEmail && (
          <>
            <br />
            <strong>Email:</strong> {leadEmail}
          </>
        )}
        {leadPhone && (
          <>
            <br />
            <strong>Phone:</strong> {leadPhone}
          </>
        )}
      </Text>
      <Text style={styles.paragraph}>
        Check the bank and confirm the deposit in the admin portal:
      </Text>
      <Section style={{ textAlign: 'center', margin: '16px 0 4px' }}>
        <Button href={adminBookingUrl} style={button}>
          Open booking in admin
        </Button>
      </Section>
    </EmailShell>
  )
}
