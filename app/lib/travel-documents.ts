import 'server-only'
import { supabaseAdmin } from './supabase-admin'

const BUCKET = 'travel-documents'
const SIGNED_URL_TTL_SECONDS = 60 * 60

export async function uploadTravelDocumentToStorage(params: {
  path: string
  buffer: Buffer
  mimeType: string
}): Promise<void> {
  const { error } = await supabaseAdmin()
    .storage.from(BUCKET)
    .upload(params.path, params.buffer, { contentType: params.mimeType, upsert: false })
  if (error) throw new Error(error.message)
}

export async function removeTravelDocumentFromStorage(path: string): Promise<void> {
  const { error } = await supabaseAdmin().storage.from(BUCKET).remove([path])
  if (error) throw new Error(error.message)
}

export async function getTravelDocumentSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin()
    .storage.from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error || !data) return null
  return data.signedUrl
}
