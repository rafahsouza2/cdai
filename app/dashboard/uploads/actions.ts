'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function excluirUpload(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const role = user.user_metadata?.role
  if (role !== 'faturista' && role !== 'admin') {
    return { erro: 'Sem permissão para excluir arquivos.' }
  }

  const { data: upload, error: erroUpload } = await supabase
    .from('uploads')
    .select('id, tipo')
    .eq('id', id)
    .single()
  if (erroUpload || !upload) {
    return { erro: erroUpload?.message ?? 'Arquivo não encontrado.' }
  }

  const tabela = upload.tipo === 'producao' ? 'producao_convenio' : 'pendencias'

  const { error: erroDados } = await supabase.from(tabela).delete().eq('upload_id', id)
  if (erroDados) return { erro: erroDados.message }

  const { error: erroExcluir } = await supabase.from('uploads').delete().eq('id', id)
  if (erroExcluir) return { erro: erroExcluir.message }

  revalidatePath('/dashboard/producao')
  revalidatePath('/dashboard/pendencias')
  revalidatePath('/dashboard')
  return { ok: true }
}
