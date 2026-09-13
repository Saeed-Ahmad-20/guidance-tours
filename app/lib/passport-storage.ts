import 'server-only'
import { supabaseAdmin } from './supabase-admin'

const BUCKET = 'passport-photos'
const SIGNED_URL_TTL_SECONDS = 60 * 60

export async function uploadPassportPhotoToStorage(params: {
  path: string
  buffer: Buffer
  mimeType: string
}): Promise<void> {
  const db = supabaseAdmin()
  // upsert:true — the "no re-upload" rule is enforced earlier, by checking
  // passport_photo_uploaded_at before this is ever called. upsert:false here
  // would instead block legitimate retries after a partial failure (e.g. the
  // Drive upload failing after Storage already succeeded once).
  const { error } = await db.storage
    .from(BUCKET)
    .upload(params.path, params.buffer, { contentType: params.mimeType, upsert: true })
  if (error) throw new Error(error.message)
}

export async function getPassportPhotoSignedUrl(path: string): Promise<string | null> {
  const db = supabaseAdmin()
  const { data, error } = await db.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error || !data) return null
  return data.signedUrl
}
