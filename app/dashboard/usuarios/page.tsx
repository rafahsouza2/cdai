import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import UsuariosPage from '@/components/UsuariosPage'

export default async function UsuariosAdminPage() {
  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()

  if (me?.user_metadata?.role !== 'admin') {
    redirect('/dashboard')
  }

  let usuarios: {
    id: string; email: string; nome: string; role: string
    confirmado: boolean; ultimoAcesso: string | null; criado: string
  }[] = []
  let erroConfig: string | undefined

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
    if (error) throw error
    usuarios = (data?.users ?? [])
      .filter(u => u.email !== me?.email)
      .map(u => ({
        id: u.id,
        email: u.email ?? '',
        nome: (u.user_metadata?.full_name ?? '') as string,
        role: (u.user_metadata?.role ?? 'gestor') as string,
        confirmado: !!u.email_confirmed_at,
        ultimoAcesso: u.last_sign_in_at ?? null,
        criado: u.created_at,
      }))
  } catch (e: unknown) {
    erroConfig = e instanceof Error ? e.message : 'Erro desconhecido'
  }

  return <UsuariosPage usuarios={usuarios} erroConfig={erroConfig} />
}
