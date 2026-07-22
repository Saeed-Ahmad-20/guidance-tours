import { randomBytes } from 'node:crypto'

const CODE_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// 256 mod 62 != 0 → reject bytes >= 248 (4 * 62) to avoid modulo bias.
const CODE_ACCEPT_CEILING = 256 - (256 % CODE_ALPHABET.length)

export function generateReservationCode(): string {
  let out = ''
  while (out.length < 8) {
    for (const b of randomBytes(16)) {
      if (b >= CODE_ACCEPT_CEILING) continue
      out += CODE_ALPHABET[b % CODE_ALPHABET.length]
      if (out.length === 8) break
    }
  }
  return out
}
