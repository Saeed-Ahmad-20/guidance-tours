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

// A follow-up to portal-whats-new: the pages and the seminar recording that email said were coming.
// Deliberately plain, like the first one, so it reads as a message from a person.
export default function PortalWhatsNew2Email({
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
      preview="The Umrah guide, the etiquette of visiting the Prophet ﷺ, your du’as and the recording of our in-person seminar are now in your passenger portal."
      title="Your Umrah guides and the seminar recording are ready"
    >
      <Text style={styles.paragraph}>Assalamu Alaykum {leadGivenNames},</Text>
      <Text style={styles.paragraph}>
        Last time we told you that more was on its way to your passenger portal. It is all there
        now, along with the recording of our in-person seminar.
      </Text>

      <Text style={subheading}>The seminar recording</Text>
      <Text style={item}>
        <strong>In-person seminar</strong> — the recording of our seminar on Saturday 10 October is
        on the <strong>Webinars</strong> page, so you can watch it any time, and again before you
        fly. If you could not make it, it covers everything you need to know.
      </Text>

      <Text style={subheading}>New guides</Text>
      <Text style={item}>
        <strong>Umrah Guide</strong> — every step from preparing at home to finishing in Makkah:
        ihram, the Talbiyah, tawaf, the two rakats, Zamzam, Sa&apos;ee and the haircut, with
        pictures along the way.
      </Text>
      <Text style={item}>
        <strong>The Beloved&apos;s ﷺ Home</strong> — the etiquette of Madinah, how to enter the
        Prophet&apos;s ﷺ mosque, visiting the Rawdah, and how to give salam to the Prophet ﷺ, Abu
        Bakr and Umar (may Allah be pleased with them), as well as the places around Madinah.
      </Text>
      <Text style={item}>
        <strong>Duas</strong> — the du&apos;as for your journey, Makkah and Madinah in Arabic, with
        the transliteration and meaning, and when and why to read each one.
      </Text>

      <Text style={subheading}>Easier to find your way around</Text>
      <Text style={item}>
        <strong>The portal is now in four sections</strong> — My Trip, Guides, Sacred Sites and
        Resources. Each has its own overview page, and the pages inside it show along the top as
        soon as you open it.
      </Text>
      <Text style={item}>
        <strong>Sacred Sites</strong> — the historical sites now have a page each for Madinah and
        Makkah, next to the Haramayn guide.
      </Text>

      <Text style={subheading}>Improved</Text>
      <Text style={item}>
        <strong>Your PDF guide</strong> — the new guides and du&apos;as, with the Arabic, can now be
        added to your PDF. It follows the order of your trip, Madinah first, and each item starts
        on a fresh page so it is easier to read. Please make a new one if you made yours earlier.
      </Text>

      <Text style={subheading}>Coming soon</Text>
      <Text style={item}>
        <strong>Your full itinerary</strong> — the detailed plan for each day, including the times
        and meeting points for the coach tours. We will let you know as soon as it is added.
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
