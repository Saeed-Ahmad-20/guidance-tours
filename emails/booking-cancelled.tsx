import { Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

export default function BookingCancelledEmail({
  leadGivenNames,
  reservationCode,
}: {
  leadGivenNames: string
  reservationCode: string
}) {
  return (
    <EmailShell
      preview={`Reservation ${reservationCode} cancelled`}
      title="Your booking has been cancelled"
    >
      <Text style={styles.paragraph}>Assalamu alaikum {leadGivenNames},</Text>
      <Text style={styles.paragraph}>
        We&apos;re writing to let you know that your reservation{' '}
        <strong>{reservationCode}</strong> has been cancelled and your places
        have been released.
      </Text>
      <Text style={{ ...styles.paragraph, color: '#a8a29e', fontSize: 12 }}>
        If this was unexpected, please WhatsApp us on{' '}
        <strong>07983 432 900</strong> and we&apos;ll help.
      </Text>
    </EmailShell>
  )
}
