'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function revalidarTudo() {
  revalidatePath('/dashboard/glosas')
  revalidatePath('/dashboard')
}

function lerCampos(formData: FormData) {
  const paciente = (formData.get('paciente') as string)?.trim() || null
  const motivo = (formData.get('motivo') as string)?.trim() || ''
  const codigo = (formData.get('codigo') as string)?.trim() || null
  const valor = Number(formData.get('valor'))
  const observacao = (formData.get('observacao') as string)?.trim() || null
  return { paciente, motivo, codigo, valor, observacao }
}

export async function criarGlosa(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const competenciaId = formData.get('competenciaId') as string
  const convenioId = formData.get('convenioId') as string
  const { paciente, motivo, codigo, valor, observacao } = lerCampos(formData)

  if (!competenciaId) return { erro: 'Selecione uma competência.' }
  if (!convenioId) return { erro: 'Selecione um convênio.' }
  if (!motivo) return { erro: 'Informe o motivo da glosa.' }
  if (!Number.isFinite(valor) || valor <= 0) return { erro: 'Informe um valor válido.' }

  const { error } = await supabase.from('glosas').insert({
    competencia_id: competenciaId,
    convenio_id: convenioId,
    paciente,
    motivo,
    codigo,
    valor,
    observacao,
    criado_por: user.id,
  })
  if (error) return { erro: error.message }

  revalidarTudo()
  return { ok: true }
}

export async function editarGlosa(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const { paciente, motivo, codigo, valor, observacao } = lerCampos(formData)
  if (!motivo) return { erro: 'Informe o motivo da glosa.' }
  if (!Number.isFinite(valor) || valor <= 0) return { erro: 'Informe um valor válido.' }

  const { error } = await supabase
    .from('glosas')
    .update({ paciente, motivo, codigo, valor, observacao })
    .eq('id', id)
  if (error) return { erro: error.message }

  revalidarTudo()
  return { ok: true }
}

export async function excluirGlosa(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const { error } = await supabase.from('glosas').delete().eq('id', id)
  if (error) return { erro: error.message }

  revalidarTudo()
  return { ok: true }
}
