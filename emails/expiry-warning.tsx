import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

const warnBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: 10,
  padding: '16px 20px',
  margin: '12px 0',
}
const warnText = {
  color: '#78350f',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.5,
  margin: 0,
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

export default function ExpiryWarningEmail({
  leadGivenNames,
  reservationCode,
  depositAmountGBP,
  portalUrl,
}: {
  leadGivenNames: string
  reservationCode: string
  depositAmountGBP: number
  portalUrl: string
}) {
  return (
    <EmailShell
      preview={`1 hour left to secure ${reservationCode}`}
      title="One hour left"
    >
      <Text style={styles.paragraph}>
        Assalamu alaikum {leadGivenNames},
      </Text>
      <Section style={warnBox}>
        <Text style={warnText}>
          ⏳ Your booking <strong>{reservationCode}</strong> will expire in about an hour
          if we don&apos;t receive your deposit.
        </Text>
      </Section>
      <Text style={styles.paragraph}>
        If you&apos;ve already transferred the{' '}
        <strong>£{depositAmountGBP.toLocaleString('en-GB')}</strong> deposit, please log
        in and press <em>&ldquo;I&rsquo;ve sent the deposit&rdquo;</em> so we know to
        look out for it:
      </Text>
      <Section style={{ textAlign: 'center', margin: '16px 0 4px' }}>
        <Button href={portalUrl} style={button}>
          Open my booking portal
        </Button>
      </Section>
      <Text style={styles.paragraph}>
        Haven&apos;t transferred yet? Use reservation number{' '}
        <strong>{reservationCode}</strong> as the bank reference. Account holder{' '}
        <strong>GUIDANCE HUB</strong>, account <strong>03737934</strong>, sort code{' '}
        <strong>20-64-12</strong>.
      </Text>
    </EmailShell>
  )
}
