import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

const codeBox = {
  backgroundColor: '#fafaf9',
  border: '1px solid #e7e5e4',
  borderRadius: 10,
  padding: '14px 18px',
  margin: '16px 0',
  textAlign: 'center' as const,
}
const codeLabel = {
  color: '#78716c',
  fontSize: 11,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  margin: 0,
}
const codeValue = {
  color: '#1c1917',
  fontFamily: 'Menlo, Consolas, monospace',
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: '0.12em',
  margin: '4px 0 0',
}
const codeNote = { color: '#78716c', fontSize: 12, margin: '6px 0 0' }
const subheading = { color: '#1c1917', fontSize: 15, fontWeight: 700, margin: '20px 0 8px' }
const item = { color: '#44403c', fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }
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

export default function PortalUpdateEmail({
  leadGivenNames,
  reservationCode,
  totalPeople,
  portalUrl,
  portalHost,
}: {
  leadGivenNames: string
  reservationCode: string
  totalPeople: number
  portalUrl: string
  portalHost: string
}) {
  const group = totalPeople > 1

  return (
    <EmailShell
      preview={`Your passenger portal has been updated. Your reservation number is ${reservationCode}.`}
      title="Your passenger portal has been updated"
    >
      <Text style={styles.paragraph}>Assalamu Alaykum {leadGivenNames},</Text>
      <Text style={styles.paragraph}>
        As your October Umrah trip gets closer, we&apos;ve added everything you need to prepare to
        your Guidance Tours passenger portal.
      </Text>

      <Section style={codeBox}>
        <Text style={codeLabel}>Your reservation number</Text>
        <Text style={codeValue}>{reservationCode}</Text>
        <Text style={codeNote}>Case-sensitive — please enter it exactly as shown.</Text>
      </Section>

      <Text style={subheading}>What&apos;s new</Text>
      <Text style={item}>
        <strong>A new address</strong> — the portal now lives at <strong>{portalHost}</strong>.
      </Text>
      <Text style={item}>
        <strong>{group ? 'A login for every passenger' : 'A more secure login'}</strong> — log in
        with your reservation number, your surname and your date of birth.
        {group &&
          ' Everyone in your group can now log in with their own surname and date of birth. Please share the reservation number above with them.'}
      </Text>
      <Text style={item}>
        <strong>Travel documents</strong> — view and download flight tickets and e-visas as soon
        as they&apos;re issued.
      </Text>
      <Text style={item}>
        <strong>Your itinerary</strong> — flights, hotels, the high-speed train and a day-by-day
        plan, with more detail to come.
      </Text>
      <Text style={item}>
        <strong>Pre-departure webinar</strong> — watch &ldquo;Umrah Explained: Everything You
        Need to Know Before You Go&rdquo; any time.
      </Text>
      <Text style={item}>
        <strong>Personal checklist</strong> — tick off your essentials, from your passport and
        vaccinations to what to pack.
      </Text>
      {group && (
        <Text style={item}>
          As lead passenger, you&apos;ll still see the whole booking, including payments and
          everyone&apos;s documents. The others in your group will only see their own.
        </Text>
      )}

      <Text style={subheading}>Coming soon</Text>
      <Text style={item}>
        We&apos;ll keep adding to the portal before you travel, including:
      </Text>
      <Text style={item}>
        • <strong>More webinars</strong> — recordings of our upcoming webinars as they happen
        <br />• <strong>Etiquettes and duas</strong> — guidance for your time in Madinah and Makkah
        <br />• <strong>A fuller itinerary</strong> — more detail for each day of the trip
      </Text>

      <Section style={{ textAlign: 'center', margin: '20px 0 8px' }}>
        <Button href={portalUrl} style={button}>
          Open the passenger portal
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        If you have any questions, WhatsApp us on <strong>07983 432 900</strong>.
      </Text>
    </EmailShell>
  )
}
