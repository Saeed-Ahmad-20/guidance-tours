// One-time setup script: mints a long-lived Google OAuth refresh token for
// the account that owns the passport-photos Drive folder, so the server can
// upload on its behalf without ever prompting a login again.
//
// Usage:
//   node --env-file=.env.local scripts/get-drive-refresh-token.mjs
//
// Requires GOOGLE_DRIVE_OAUTH_CLIENT_ID and GOOGLE_DRIVE_OAUTH_CLIENT_SECRET
// to already be set (from a Desktop-app OAuth client in Google Cloud
// Console). Prints a URL — open it, sign in as the account that owns the
// Drive folder, approve access, then this script prints the refresh token
// to save as GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN.

import http from 'node:http'
import { google } from 'googleapis'

const PORT = 53682
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`

async function main() {
  const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    console.error('Set GOOGLE_DRIVE_OAUTH_CLIENT_ID and GOOGLE_DRIVE_OAUTH_CLIENT_SECRET first.')
    process.exit(1)
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI)

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // forces a refresh_token even if this app was authorized before
    scope: ['https://www.googleapis.com/auth/drive'],
  })

  console.log('\nOpen this URL and sign in as the account that owns the Drive folder:\n')
  console.log(authUrl)
  console.log('\nWaiting for you to approve access...\n')

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI)
      if (url.pathname !== '/oauth2callback') {
        res.writeHead(404).end()
        return
      }
      const err = url.searchParams.get('error')
      const code = url.searchParams.get('code')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(err ? `<p>Authorization failed: ${err}. You can close this window.</p>` : '<p>Success — you can close this window.</p>')
      server.close()
      if (err) reject(new Error(err))
      else resolve(code)
    })
    server.listen(PORT)
  })

  const { tokens } = await oauth2Client.getToken(code)
  if (!tokens.refresh_token) {
    console.error(
      '\nNo refresh_token was returned. This usually means the account already\n' +
        'authorized this app before without prompt=consent forcing a new one.\n' +
        'Go to https://myaccount.google.com/permissions, remove access for this\n' +
        'app, and run this script again.'
    )
    process.exit(1)
  }

  console.log('\nSuccess. Add this to your environment as GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN:\n')
  console.log(tokens.refresh_token)
  console.log()
}

main().catch(e => {
  console.error('Failed:', e.message)
  process.exit(1)
})
