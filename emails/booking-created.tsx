import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

const infoBox = {
  backgroundColor: '#1c1917',
  borderRadius: 10,
  color: '#e7e5e4',
  padding: '18px 20px',
  margin: '12px 0',
}
const label = {
  color: '#a8a29e',
  fontSize: 10,
  letterSpacing: '0.15em',
  margin: 0,
  textTransform: 'uppercase' as const,
}
const value = {
  color: '#ffffff',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
  fontSize: 15,
  fontWeight: 600,
  margin: '2px 0 12px',
}
const codeValue = {
  ...value,
  color: '#C4A348',
  fontSize: 22,
  letterSpacing: '0.15em',
  margin: '2px 0 0',
}
const amount = {
  ...value,
  color: '#C4A348',
  fontSize: 20,
  margin: '2px 0 0',
}
const button = {
  backgroundColor: '#C4A348',
  borderRadius: 9999,
  color: '#1c1917',
  display: 'inline-block',
  fontSize: 14,
  fontWeight: 700,
  padding: '10px 22px',
  textDecoration: 'none',
}

export default function BookingCreatedEmail({
  leadGivenNames,
  reservationCode,
  depositAmountGBP,
  totalPeople,
  portalUrl,
}: {
  leadGivenNames: string
  reservationCode: string
  depositAmountGBP: number
  totalPeople: number
  portalUrl: string
}) {
  return (
    <EmailShell
      preview={`Reservation ${reservationCode} — transfer £${depositAmountGBP} within 24 hours`}
      title="Your place is held"
    >
      <Text style={styles.paragraph}>
        Assalamu Alaykum {leadGivenNames},
      </Text>
      <Text style={styles.paragraph}>
        Thanks for booking with Guidance Tours. We&apos;ve held{' '}
        <strong>{totalPeople} {totalPeople === 1 ? 'place' : 'places'}</strong> for you on
        our Umrah October 2026 trip.
      </Text>
      <Text style={styles.paragraph}>
        Please transfer your deposit within <strong>24 hours</strong> to secure your
        booking. Use your reservation number as the bank transfer reference.
      </Text>

      <Section style={infoBox}>
        <Text style={label}>Reservation number</Text>
        <Text style={codeValue}>{reservationCode}</Text>
      </Section>

      <Section style={infoBox}>
        <Text style={label}>Account holder</Text>
        <Text style={value}>GUIDANCE HUB</Text>
        <Text style={label}>Account number</Text>
        <Text style={value}>03737934</Text>
        <Text style={label}>Sort code</Text>
        <Text style={value}>20-64-12</Text>
        <Text style={label}>Reference</Text>
        <Text style={value}>{reservationCode}</Text>
        <Text style={label}>Amount</Text>
        <Text style={amount}>£{depositAmountGBP.toLocaleString('en-GB')}</Text>
      </Section>

      <Text style={styles.paragraph}>
        Once the transfer is done, log into your booking portal with your reservation
        number and surname and press <em>&ldquo;I&rsquo;ve sent the deposit&rdquo;</em>.
      </Text>

      <Section style={{ textAlign: 'center', margin: '16px 0 4px' }}>
        <Button href={portalUrl} style={button}>
          Go to my booking portal
        </Button>
      </Section>

      <Text style={{ ...styles.paragraph, color: '#a8a29e', fontSize: 12 }}>
        If we don&apos;t see the deposit within 24 hours, your place will be released.
      </Text>
    </EmailShell>
  )
}
