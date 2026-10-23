import { redirect } from 'next/navigation'
import { getAdminUser } from '../../lib/admin-session'
import AdminSidebar from './admin-sidebar'

export const dynamic = 'force-dynamic'

export default async function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminSidebar user={user} />
      <div className="lg:pl-60">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
      </div>
    </div>
  )
}
