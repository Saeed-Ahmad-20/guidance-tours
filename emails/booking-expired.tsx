import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

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

export default function BookingExpiredEmail({
  leadGivenNames,
  reservationCode,
  bookUrl,
}: {
  leadGivenNames: string
  reservationCode: string
  bookUrl: string
}) {
  return (
    <EmailShell
      preview={`Reservation ${reservationCode} has expired`}
      title="Your booking has been released"
    >
      <Text style={styles.paragraph}>
        Assalamu Alaykum {leadGivenNames},
      </Text>
      <Text style={styles.paragraph}>
        The deposit window for reservation <strong>{reservationCode}</strong> has passed,
        so your held place has been released.
      </Text>
      <Text style={styles.paragraph}>
        If you&apos;d still like to come along, you can make a fresh booking while places
        last:
      </Text>
      <Section style={{ textAlign: 'center', margin: '16px 0 4px' }}>
        <Button href={bookUrl} style={button}>
          Book again
        </Button>
      </Section>
      <Text style={{ ...styles.paragraph, color: '#a8a29e', fontSize: 12 }}>
        If you&apos;ve already transferred the deposit and think this is a mistake, please
        WhatsApp us on <strong>07983 432 900</strong> with a screenshot of the transfer.
      </Text>
    </EmailShell>
  )
}
