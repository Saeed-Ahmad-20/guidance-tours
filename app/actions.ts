'use server'

import { supabaseAdmin } from './lib/supabase-admin'
import { isValidEmail } from './lib/booking'
import { checkRateLimit, clientIp } from './lib/rate-limit'

export type RegistrationState = {
  success: boolean
  error?: string
} | null

export async function submitRegistration(
  _prevState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const countryCode = (formData.get('countryCode') as string)?.trim()
  const phoneNumber = (formData.get('phoneNumber') as string)?.trim()
  const travelerCount = parseInt(formData.get('travelerCount') as string)

  if (!name || !email || !countryCode || !phoneNumber || !travelerCount) {
    return { success: false, error: 'Please complete all fields before submitting.' }
  }

  if (!isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  if (isNaN(travelerCount) || travelerCount < 1 || travelerCount > 50) {
    return { success: false, error: 'Please enter a valid number of travellers (1–50).' }
  }

  const ip = await clientIp()
  if (!checkRateLimit('registration', ip, 10, 60 * 60 * 1000)) {
    return { success: false, error: 'Too many submissions. Please try again later.' }
  }

  const db = supabaseAdmin()
  const { error } = await db.from('registrations').insert({
    name,
    email,
    phone: `${countryCode}${phoneNumber}`,
    traveler_count: travelerCount,
  })

  if (error) {
    console.error('Registration error:', error.message)
    return { success: false, error: 'Something went wrong. Please try again shortly.' }
  }

  return { success: true }
}
