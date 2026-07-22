import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

const wrapper = {
  backgroundColor: '#f5f3ec',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '24px 0',
}
const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e7e5e4',
  borderRadius: 12,
  margin: '0 auto',
  maxWidth: 560,
  padding: '32px 28px',
}
const brand = {
  color: '#C4A348',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  margin: 0,
}
const heading = {
  color: '#1c1917',
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.25,
  margin: '8px 0 16px',
}
const paragraph = {
  color: '#44403c',
  fontSize: 14,
  lineHeight: 1.6,
  margin: '0 0 12px',
}
const footer = {
  color: '#a8a29e',
  fontSize: 11,
  lineHeight: 1.6,
  margin: '16px 0 0',
  textAlign: 'center' as const,
}
const hr = {
  borderColor: '#e7e5e4',
  margin: '24px 0',
}

export function EmailShell({
  preview,
  title,
  children,
}: {
  preview: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={wrapper}>
        <Container style={container}>
          <Section>
            <Text style={brand}>Guidance Tours</Text>
            <Heading style={heading}>{title}</Heading>
          </Section>
          {children}
          <Hr style={hr} />
          <Text style={footer}>
            Guidance Tours · www.guidancetours.co.uk · WhatsApp 07983 432 900
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const styles = { paragraph, hr }
