import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseProducao } from '@/lib/parse-producao'
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

  let linhas
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    linhas = parseProducao(buffer)
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
      tipo: 'producao',
      nome_arquivo: file.name,
      linhas_processadas: linhas.length,
      enviado_por: user.id,
    })
    .select('id')
    .single()
  if (erroUpload || !upload) {
    return NextResponse.json({ erro: erroUpload?.message ?? 'Erro ao registrar upload.' }, { status: 500 })
  }

  for (const linha of linhas) {
    const { data: convenio, error: erroConvenio } = await supabase
      .from('convenios')
      .upsert({ nome: linha.convenioNome, grupo: linha.convenioGrupo }, { onConflict: 'nome' })
      .select('id')
      .single()
    if (erroConvenio || !convenio) {
      return NextResponse.json(
        { erro: erroConvenio?.message ?? `Erro ao gravar convênio ${linha.convenioNome}.` },
        { status: 500 }
      )
    }

    const { error: erroProducao } = await supabase.from('producao_convenio').upsert(
      {
        competencia_id: competencia.id,
        convenio_id: convenio.id,
        quantidade: linha.quantidade,
        produzido: linha.produzido,
        cobrado: linha.cobrado,
        recebido: linha.recebido,
        ir: linha.ir,
        liquido: linha.liquido,
        upload_id: upload.id,
      },
      { onConflict: 'competencia_id,convenio_id' }
    )
    if (erroProducao) {
      return NextResponse.json({ erro: erroProducao.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, linhas: linhas.length })
}
