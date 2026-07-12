'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function garantirAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') {
    throw new Error('Apenas administradores podem gerenciar usuários.')
  }
}

export async function criarUsuario(formData: FormData) {
  await garantirAdmin()
  const admin = createAdminClient()
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const nome = formData.get('nome') as string
  const role = formData.get('role') as string

  const { error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    user_metadata: { full_name: nome, role },
    email_confirm: true,
  })
  if (error) return { erro: error.message }
  revalidatePath('/dashboard/usuarios')
  return { ok: true }
}

export async function editarUsuario(id: string, formData: FormData) {
  await garantirAdmin()
  const admin = createAdminClient()
  const email = formData.get('email') as string
  const nome = formData.get('nome') as string
  const role = formData.get('role') as string
  const senha = formData.get('senha') as string

  const update: Record<string, unknown> = { email, user_metadata: { full_name: nome, role } }
  if (senha) update.password = senha

  const { error } = await admin.auth.admin.updateUserById(id, update)
  if (error) return { erro: error.message }
  revalidatePath('/dashboard/usuarios')
  return { ok: true }
}

export async function excluirUsuario(id: string) {
  await garantirAdmin()
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { erro: error.message }
  revalidatePath('/dashboard/usuarios')
  return { ok: true }
}
