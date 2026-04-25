import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '../../lib/admin-session'
import { adminLogout } from '../../actions/admin'

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
      <header className="bg-stone-900 border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-[#C4A348] font-bold text-sm uppercase tracking-widest"
            >
              Guidance Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-5 text-sm">
              <Link href="/admin" className="text-stone-300 hover:text-white transition">
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-stone-500">
              signed in as <span className="text-stone-300 font-medium">{user}</span>
            </span>
            <form action={adminLogout}>
              <button
                type="submit"
                className="text-xs text-stone-300 hover:text-white border border-stone-700 hover:border-stone-500 rounded-full px-3 py-1.5 transition"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
    </div>
  )
}
