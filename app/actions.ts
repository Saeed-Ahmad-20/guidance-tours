'use server'

import { createClient } from '@supabase/supabase-js'

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
  const countryCode = formData.get('countryCode') as string
  const phoneNumber = (formData.get('phoneNumber') as string)?.trim()
  const travelerCount = parseInt(formData.get('travelerCount') as string)

  if (!name || !email || !countryCode || !phoneNumber || !travelerCount) {
    return { success: false, error: 'Please complete all fields before submitting.' }
  }

  if (isNaN(travelerCount) || travelerCount < 1 || travelerCount > 50) {
    return { success: false, error: 'Please enter a valid number of travellers (1–50).' }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.from('registrations').insert({
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
