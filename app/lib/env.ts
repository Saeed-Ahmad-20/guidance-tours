// Centralised environment-variable validators. Read each var through these
// helpers so the surrounding code never sees an unset, too-short, or weakly
// shaped secret. Validators throw at first use (request time on serverless),
// which fails closed rather than silently downgrading security.

const SESSION_SECRET_MIN = 64 // 256 bits when treated as hex / base64url
const ADMIN_PASSWORD_MIN = 12
const CRON_SECRET_MIN = 32
const SUPABASE_KEY_MIN = 40 // service-role JWTs are well over this

function read(name: string): string | undefined {
  const v = process.env[name]
  return v && v.length > 0 ? v : undefined
}

function requireMinLen(name: string, value: string | undefined, min: number): string {
  if (!value) throw new Error(`${name} must be set.`)
  if (value.length < min) {
    throw new Error(`${name} must be at least ${min} characters.`)
  }
  return value
}

export function getSessionSecret(name: 'ADMIN_SESSION_SECRET' | 'PORTAL_SESSION_SECRET'): string {
  return requireMinLen(name, read(name), SESSION_SECRET_MIN)
}

export function getCronSecret(): string {
  return requireMinLen('CRON_SECRET', read('CRON_SECRET'), CRON_SECRET_MIN)
}

export function getAdminCredentials(): { username: string; password: string } {
  const username = read('ADMIN_USERNAME')
  const password = read('ADMIN_PASSWORD')
  if (!username || !password) {
    throw new Error('Admin credentials are not configured.')
  }
  if (password.length < ADMIN_PASSWORD_MIN) {
    throw new Error(`ADMIN_PASSWORD must be at least ${ADMIN_PASSWORD_MIN} characters.`)
  }
  // Require some character-class diversity so a long but trivial password
  // (e.g. "aaaaaaaaaaaa") is rejected at startup.
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(re => re.test(password)).length
  if (classes < 3) {
    throw new Error(
      'ADMIN_PASSWORD must mix at least three of: lowercase, uppercase, digits, symbols.'
    )
  }
  return { username, password }
}

export function getSupabaseAdminConfig(): { url: string; serviceRoleKey: string } {
  const url = read('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = read('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)(\/.*)?$/i.test(url)) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase URL.')
  }
  // Service-role keys are JWTs. Two dots is the cheapest meaningful shape check
  // — catches accidentally pasting an anon key URL or a placeholder.
  if (serviceRoleKey.split('.').length !== 3 || serviceRoleKey.length < SUPABASE_KEY_MIN) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY does not look like a valid JWT.')
  }
  return { url, serviceRoleKey }
}

// Folder from https://drive.google.com/drive/folders/<id> — override via env
// if the destination folder ever changes.
const DEFAULT_PASSPORT_FOLDER_ID = '1rdV3qq6k7sW5khlwReNN8ER6gimhaZ-C'

// A service account can't own files in a personal Google account (it has no
// storage quota of its own — confirmed by testing, not a hunch), so uploads
// authenticate as the real Google account that owns the destination folder
// via OAuth, using a refresh token minted once during setup (see
// scripts/get-drive-refresh-token.js).
export function getGoogleDriveConfig(): {
  clientId: string
  clientSecret: string
  refreshToken: string
  folderId: string
} {
  const clientId = read('GOOGLE_DRIVE_OAUTH_CLIENT_ID')
  const clientSecret = read('GOOGLE_DRIVE_OAUTH_CLIENT_SECRET')
  const refreshToken = read('GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN')
  const folderId = read('GOOGLE_DRIVE_PASSPORT_FOLDER_ID') ?? DEFAULT_PASSPORT_FOLDER_ID
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Passport photo upload requires GOOGLE_DRIVE_OAUTH_CLIENT_ID, GOOGLE_DRIVE_OAUTH_CLIENT_SECRET, and GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN.'
    )
  }
  return { clientId, clientSecret, refreshToken, folderId }
}
