import { redirect } from 'next/navigation'
import { getAdminUser } from '../../lib/admin-session'
import AdminLoginForm from './login-form'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const user = await getAdminUser()
  if (user) redirect('/admin')
  return <AdminLoginForm />
}
