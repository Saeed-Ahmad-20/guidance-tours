import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

const noteBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fde68a',
  borderRadius: 10,
  padding: '14px 18px',
  margin: '12px 0',
}
const noteText = {
  color: '#78350f',
  fontSize: 13,
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

export default function StatusRevertedEmail({
  leadGivenNames,
  reservationCode,
  targetStatus,
  adminNote,
  portalUrl,
}: {
  leadGivenNames: string
  reservationCode: string
  targetStatus: 'pending_payment' | 'transfer_submitted'
  adminNote?: string
  portalUrl: string
}) {
  const isPending = targetStatus === 'pending_payment'

  return (
    <EmailShell
      preview={`Update on your booking ${reservationCode}`}
      title={isPending ? 'Action needed on your booking' : 'Your booking is back under review'}
    >
      <Text style={styles.paragraph}>
        Assalamu Alaykum {leadGivenNames},
      </Text>
      {isPending ? (
        <Text style={styles.paragraph}>
          There&apos;s an update on your reservation <strong>{reservationCode}</strong>. Please
          visit your booking portal to review the details and complete your transfer.
        </Text>
      ) : (
        <Text style={styles.paragraph}>
          Your deposit for reservation <strong>{reservationCode}</strong> is being reviewed
          again by our team. No action is needed from you right now — we&apos;ll confirm
          once everything is cleared.
        </Text>
      )}

      {adminNote && (
        <Section style={noteBox}>
          <Text style={noteText}>
            <strong>Message from our team:</strong>
            <br />
            {adminNote}
          </Text>
        </Section>
      )}

      {isPending && (
        <Section style={{ textAlign: 'center', margin: '16px 0 4px' }}>
          <Button href={portalUrl} style={button}>
            Go to my booking portal
          </Button>
        </Section>
      )}
    </EmailShell>
  )
}
