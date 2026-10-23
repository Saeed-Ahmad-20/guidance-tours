// Builds a vCard (.vcf) file. Phones (iPhone and Android) and most address books import it directly,
// adding every contact in the file in one go.

export type VCardContact = {
  givenNames: string
  surname: string
  email?: string | null
  phone?: string | null
  org?: string
  note?: string
}

const escape = (v: string) =>
  v.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')

export function buildVCards(contacts: VCardContact[]): string {
  return contacts
    .map(c => {
      const given = c.givenNames.trim()
      const family = c.surname.trim()
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escape(family)};${escape(given)};;;`,
        `FN:${escape(`${given} ${family}`.trim())}`,
        ...(c.org ? [`ORG:${escape(c.org)}`] : []),
        ...(c.phone?.trim() ? [`TEL;TYPE=CELL:${escape(c.phone.trim())}`] : []),
        ...(c.email?.trim() ? [`EMAIL;TYPE=INTERNET:${escape(c.email.trim())}`] : []),
        ...(c.note ? [`NOTE:${escape(c.note)}`] : []),
        'END:VCARD',
      ]
      return lines.join('\r\n')
    })
    .join('\r\n') + '\r\n'
}
