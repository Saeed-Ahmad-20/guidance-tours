import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailShell, styles } from './shell'

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

// Deliberately plain: a short, personal note with one link and no images reads
// as a message from a person, which helps it land in the Primary tab.
export default function PortalWhatsNewEmail({
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
      preview="We've added historical sites, an in-depth guide to the Haramayn and downloadable PDF guides to your passenger portal."
      title="More to help you prepare for your Umrah"
    >
      <Text style={styles.paragraph}>Assalamu Alaykum {leadGivenNames},</Text>
      <Text style={styles.paragraph}>
        We&apos;ve added more to your passenger portal ahead of your October Umrah trip. All of it
        is ready to use now.
      </Text>

      <Text style={subheading}>What&apos;s new</Text>
      <Text style={item}>
        <strong>Historical Sites</strong> — 22 places connected to the seerah in Madinah and
        Makkah, listed in order of significance. Each has its history, key points, a photo and a
        Google Maps link, and there is a podcast for each city.
      </Text>
      <Text style={item}>
        <strong>The Haramayn</strong> — an in-depth guide to Masjid al-Haram, the Ka&apos;bah,
        Masjid an-Nabawi and the Rawdah Sharif.
      </Text>
      <Text style={item}>
        <strong>Your own PDF guide</strong> — choose exactly what you want from the portal, attach
        your tickets and e-visa if you like, and save it to your phone to read without any signal.
      </Text>
      <Text style={item}>
        <strong>Coach tours on your itinerary</strong> — Madinah on Wednesday 28 October and
        Makkah on Monday 2 November. Pick-up times and meeting points will be confirmed.
      </Text>
      <Text style={item}>
        <strong>Prayer times and weather</strong> — each day of your itinerary now shows the prayer
        times for the city you are in, and there is a guide to the weather in Madinah and Makkah.
      </Text>
      <Text style={item}>
        <strong>Easier on your phone</strong> — a new menu makes it quicker to move around the
        portal.
      </Text>

      <Text style={subheading}>Coming soon</Text>
      <Text style={item}>
        <strong>Etiquettes and duas</strong> — new pages with guidance for your time in Madinah
        and Makkah.
      </Text>
      <Text style={item}>
        <strong>Seminar recording</strong> — we&apos;ll add a recording of our in-person seminar on
        Saturday 10 October at 2pm to the Webinars page, so you can watch it any time.
      </Text>

      <Text style={styles.paragraph}>
        A tip before you fly: create your PDF guide and save it to your phone, so everything is
        with you in Madinah and Makkah even without internet.
      </Text>

      <Section style={{ textAlign: 'center', margin: '20px 0 8px' }}>
        <Button href={portalUrl} style={button}>
          Open the passenger portal
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        You can log in at <strong>{portalHost}</strong> with your reservation number{' '}
        <strong>{reservationCode}</strong> (please enter it exactly as shown), your surname and
        your date of birth.
        {group &&
          ' Everyone in your group logs in with the same reservation number and their own surname and date of birth, so please share the number with them.'}
      </Text>

      <Text style={styles.paragraph}>
        If you have any questions, just reply to this email or WhatsApp us on{' '}
        <strong>07983 432 900</strong>.
      </Text>
    </EmailShell>
  )
}
