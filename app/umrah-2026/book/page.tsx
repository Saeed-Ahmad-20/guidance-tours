import { getAvailability } from '../../actions/booking'
import BookingWizard from './booking-wizard'

export const dynamic = 'force-dynamic'

export default async function BookPage() {
  const availability = await getAvailability()
  return <BookingWizard initialAvailability={availability} />
}
