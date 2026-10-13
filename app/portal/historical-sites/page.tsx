import { redirect } from 'next/navigation'
import { portalBasePath, requirePortalSession } from '../../lib/portal-session'

export const dynamic = 'force-dynamic'

// The sites now live on one page per city.
export default async function Page() {
  await requirePortalSession()
  redirect(`${await portalBasePath()}/historical-sites/madinah`)
}
