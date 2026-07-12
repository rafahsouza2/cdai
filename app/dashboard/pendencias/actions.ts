'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function revalidarTudo() {
  revalidatePath('/dashboard/pendencias')
  revalidatePath('/dashboard/producao')
  revalidatePath('/dashboard')
}

export async function justificarPendencia(id: string, categoria: string, observacao: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const { error } = await supabase
    .from('pendencias')
    .update({
      status: 'justificada',
      categoria_justificativa: categoria,
      observacao,
      justificado_por: user.id,
      justificado_em: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { erro: error.message }
  revalidarTudo()
  return { ok: true }
}

export async function reabrirPendencia(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('pendencias')
    .update({
      status: 'pendente',
      categoria_justificativa: null,
      observacao: null,
      justificado_por: null,
      justificado_em: null,
    })
    .eq('id', id)

  if (error) return { erro: error.message }
  revalidarTudo()
  return { ok: true }
}
