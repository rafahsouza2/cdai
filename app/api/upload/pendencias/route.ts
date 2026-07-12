import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parsePendencias, type LinhaPendencia } from '@/lib/parse-pendencias'
import { competenciaLabel } from '@/lib/format'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const role = user.user_metadata?.role
  if (role !== 'faturista' && role !== 'admin') {
    return NextResponse.json({ erro: 'Sem permissão para enviar arquivos.' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const mes = Number(formData.get('mes'))
  const ano = Number(formData.get('ano'))

  if (!file) return NextResponse.json({ erro: 'Arquivo não enviado.' }, { status: 400 })
  if (!mes || !ano) return NextResponse.json({ erro: 'Competência (mês/ano) inválida.' }, { status: 400 })

  let linhas: LinhaPendencia[]
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    linhas = parsePendencias(buffer)
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : 'Falha ao ler o arquivo.' }, { status: 400 })
  }

  const { data: competencia, error: erroCompetencia } = await supabase
    .from('competencias')
    .upsert({ mes, ano, label: competenciaLabel(mes, ano) }, { onConflict: 'mes,ano' })
    .select('id')
    .single()
  if (erroCompetencia || !competencia) {
    return NextResponse.json({ erro: erroCompetencia?.message ?? 'Erro ao gravar competência.' }, { status: 500 })
  }

  const { data: upload, error: erroUpload } = await supabase
    .from('uploads')
    .insert({
      competencia_id: competencia.id,
      tipo: 'pendencia',
      nome_arquivo: file.name,
      linhas_processadas: linhas.length,
      enviado_por: user.id,
    })
    .select('id')
    .single()
  if (erroUpload || !upload) {
    return NextResponse.json({ erro: erroUpload?.message ?? 'Erro ao registrar upload.' }, { status: 500 })
  }

  const porConvenio = new Map<string, { grupo: 'DIRETO' | 'AMHP'; linhas: LinhaPendencia[] }>()
  for (const linha of linhas) {
    if (!porConvenio.has(linha.convenioNome)) {
      porConvenio.set(linha.convenioNome, { grupo: linha.convenioGrupo, linhas: [] })
    }
    porConvenio.get(linha.convenioNome)!.linhas.push(linha)
  }

  for (const [nome, grupo] of porConvenio) {
    const { data: convenio, error: erroConvenio } = await supabase
      .from('convenios')
      .upsert({ nome, grupo: grupo.grupo }, { onConflict: 'nome' })
      .select('id')
      .single()
    if (erroConvenio || !convenio) {
      return NextResponse.json({ erro: erroConvenio?.message ?? `Erro ao gravar convênio ${nome}.` }, { status: 500 })
    }

    // Reenvio da mesma competencia+convenio substitui os lancamentos anteriores
    const { error: erroDelete } = await supabase
      .from('pendencias')
      .delete()
      .eq('competencia_id', competencia.id)
      .eq('convenio_id', convenio.id)
    if (erroDelete) {
      return NextResponse.json({ erro: erroDelete.message }, { status: 500 })
    }

    const rows = grupo.linhas.map(l => ({
      competencia_id: competencia.id,
      convenio_id: convenio.id,
      data_atendimento: l.dataAtendimento,
      paciente: l.paciente,
      tipo_procedimento: l.tipoProcedimento,
      medico: l.medico,
      executante: l.executante,
      valor_produzido: l.valorProduzido,
      upload_id: upload.id,
    }))

    const { error: erroInsert } = await supabase.from('pendencias').insert(rows)
    if (erroInsert) {
      return NextResponse.json({ erro: erroInsert.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, linhas: linhas.length })
}
