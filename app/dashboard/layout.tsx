import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TopBar from '@/components/TopBar'
import NavTabs from '@/components/NavTabs'

function getInitials(email: string, name?: string): string {
  if (name) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = user.user_metadata?.full_name ?? user.email ?? 'Usuário'
  const userRole = user.user_metadata?.role ?? 'gestor'
  const userInitials = getInitials(user.email ?? '', user.user_metadata?.full_name)

  return (
    <div className="dashboard-screen">
      <TopBar userName={userName} userInitials={userInitials} />
      <NavTabs userRole={userRole} />
      <div className="main-content">{children}</div>
    </div>
  )
}
