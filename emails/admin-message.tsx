import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

const messageBox = {
  backgroundColor: '#fafaf9',
  border: '1px solid #e7e5e4',
  borderRadius: 10,
  padding: '14px 18px',
  margin: '12px 0',
}
const messageText = {
  color: '#1c1917',
  fontSize: 14,
  lineHeight: 1.6,
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
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

export default function AdminMessageEmail({
  leadGivenNames,
  reservationCode,
  message,
  portalUrl,
}: {
  leadGivenNames: string
  reservationCode: string
  message: string
  portalUrl: string
}) {
  return (
    <EmailShell
      preview={`Message from our team regarding your booking ${reservationCode}`}
      title="Message from our team"
    >
      <Text style={styles.paragraph}>
        Assalamu Alaykum {leadGivenNames},
      </Text>
      <Text style={styles.paragraph}>
        We have an update regarding your reservation{' '}
        <strong>{reservationCode}</strong>:
      </Text>
      <Section style={messageBox}>
        <Text style={messageText}>{message}</Text>
      </Section>
      <Text style={styles.paragraph}>
        You can view the full status of your booking in your portal at any time.
      </Text>
      <Section style={{ textAlign: 'center', margin: '16px 0 4px' }}>
        <Button href={portalUrl} style={button}>
          Go to my booking portal
        </Button>
      </Section>
      <Text style={styles.paragraph}>
        If you have any questions, WhatsApp us on <strong>07983 432 900</strong>.
      </Text>
    </EmailShell>
  )
}
