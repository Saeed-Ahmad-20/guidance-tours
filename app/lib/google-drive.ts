import { google } from 'googleapis'
import { Readable } from 'node:stream'
import { getGoogleDriveConfig } from './env'

// Full drive scope: we're writing into a pre-existing folder the account
// already owns, and the narrower drive.file scope only ever sees files this
// app itself created — it can't see or write into a folder that already
// existed, even when that folder belongs to the same account.
const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive']

let cachedAuth: InstanceType<typeof google.auth.OAuth2> | null = null

function driveClient() {
  const { clientId, clientSecret, refreshToken } = getGoogleDriveConfig()
  if (!cachedAuth) {
    cachedAuth = new google.auth.OAuth2(clientId, clientSecret)
    cachedAuth.setCredentials({ refresh_token: refreshToken, scope: DRIVE_SCOPES.join(' ') })
  }
  return google.drive({ version: 'v3', auth: cachedAuth })
}

export async function uploadPassportPhotoToDrive(params: {
  buffer: Buffer
  filename: string
  mimeType: string
}): Promise<{ id: string }> {
  const { folderId } = getGoogleDriveConfig()
  const drive = driveClient()

  const res = await drive.files.create({
    requestBody: { name: params.filename, parents: [folderId] },
    media: { mimeType: params.mimeType, body: Readable.from(params.buffer) },
    fields: 'id',
    supportsAllDrives: true,
  })

  if (!res.data.id) throw new Error('Drive upload did not return a file id.')
  return { id: res.data.id }
}
