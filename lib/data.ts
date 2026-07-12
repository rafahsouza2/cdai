import type { SupabaseClient } from '@supabase/supabase-js'
import { competenciaLabel } from './format'

export interface Competencia {
  id: string
  mes: number
  ano: number
  label: string
}

export interface Convenio {
  id: string
  nome: string
  grupo: 'DIRETO' | 'AMHP'
}

export interface ProducaoLinha {
  id: string
  quantidade: number
  produzido: number
  cobrado: number
  recebido: number
  ir: number
  liquido: number
  convenio: Convenio
}

export interface PendenciaLinha {
  id: string
  data_atendimento: string | null
  paciente: string
  tipo_procedimento: string | null
  medico: string | null
  executante: string | null
  valor_produzido: number
  status: 'pendente' | 'justificada'
  categoria_justificativa: string | null
  observacao: string | null
  justificado_por: string | null
  justificado_em: string | null
  convenio: Convenio
}

function ordenarPorConvenio<T extends { convenio: Convenio }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.convenio.grupo !== b.convenio.grupo) return a.convenio.grupo === 'DIRETO' ? -1 : 1
    return a.convenio.nome.localeCompare(b.convenio.nome, 'pt-BR')
  })
}

export async function getCompetencias(supabase: SupabaseClient): Promise<Competencia[]> {
  const { data, error } = await supabase
    .from('competencias')
    .select('id, mes, ano, label')
    .order('ano', { ascending: false })
    .order('mes', { ascending: false })

  if (error) throw error
  return data ?? []
}

async function getCompetenciasComDados(supabase: SupabaseClient): Promise<Set<string>> {
  const [producao, pendencias] = await Promise.all([
    supabase.from('producao_convenio').select('competencia_id'),
    supabase.from('pendencias').select('competencia_id'),
  ])
  const ids = new Set<string>()
  for (const row of producao.data ?? []) ids.add(row.competencia_id as string)
  for (const row of pendencias.data ?? []) ids.add(row.competencia_id as string)
  return ids
}

/** Retorna a competencia pedida (via searchParam); se nenhuma for pedida (ou a
 *  pedida nao existir mais), cai sempre na mais recente que tenha alguma
 *  producao ou pendencia lancada — nunca num mes vazio so por ser o mais novo. */
export async function getCompetenciaSelecionada(
  supabase: SupabaseClient,
  competenciaId?: string
): Promise<Competencia | null> {
  const competencias = await getCompetencias(supabase)
  if (competencias.length === 0) return null

  if (competenciaId) {
    const encontrada = competencias.find(c => c.id === competenciaId)
    if (encontrada) return encontrada
  }

  const comDados = await getCompetenciasComDados(supabase)
  const maisRecenteComDados = competencias.find(c => comDados.has(c.id))
  return maisRecenteComDados ?? competencias[0]
}

export async function getProducaoPorCompetencia(
  supabase: SupabaseClient,
  competenciaId: string
): Promise<ProducaoLinha[]> {
  const { data, error } = await supabase
    .from('producao_convenio')
    .select('id, quantidade, produzido, cobrado, recebido, ir, liquido, convenio:convenios(id, nome, grupo)')
    .eq('competencia_id', competenciaId)

  if (error) throw error
  return ordenarPorConvenio((data ?? []) as unknown as ProducaoLinha[])
}

export async function getPendenciasPorCompetencia(
  supabase: SupabaseClient,
  competenciaId: string
): Promise<PendenciaLinha[]> {
  const { data, error } = await supabase
    .from('pendencias')
    .select(
      `id, data_atendimento, paciente, tipo_procedimento, medico, executante, valor_produzido,
       status, categoria_justificativa, observacao, justificado_por, justificado_em,
       convenio:convenios(id, nome, grupo)`
    )
    .eq('competencia_id', competenciaId)

  if (error) throw error
  const linhas = ordenarPorConvenio((data ?? []) as unknown as PendenciaLinha[])
  return linhas.sort((a, b) => {
    if (a.convenio.nome !== b.convenio.nome) return 0
    return (a.data_atendimento ?? '').localeCompare(b.data_atendimento ?? '')
  })
}

export interface UploadLinha {
  id: string
  tipo: 'producao' | 'pendencia'
  nome_arquivo: string
  linhas_processadas: number
  enviado_em: string
}

export async function getUploadsPorCompetencia(
  supabase: SupabaseClient,
  competenciaId: string,
  tipo: 'producao' | 'pendencia'
): Promise<UploadLinha[]> {
  const { data, error } = await supabase
    .from('uploads')
    .select('id, tipo, nome_arquivo, linhas_processadas, enviado_em')
    .eq('competencia_id', competenciaId)
    .eq('tipo', tipo)
    .order('enviado_em', { ascending: false })

  if (error) throw error
  return data ?? []
}

export interface Kpis {
  totalProduzido: number
  totalCobrado: number
  totalNaoCobrado: number
  taxaNaoCobranca: number
}

export function calcularKpis(linhas: ProducaoLinha[]): Kpis {
  const totalProduzido = linhas.reduce((s, l) => s + l.produzido, 0)
  const totalCobrado = linhas.reduce((s, l) => s + l.cobrado, 0)
  const totalNaoCobrado = totalProduzido - totalCobrado
  const taxaNaoCobranca = totalProduzido > 0 ? (totalNaoCobrado / totalProduzido) * 100 : 0
  return { totalProduzido, totalCobrado, totalNaoCobrado, taxaNaoCobranca }
}

export { competenciaLabel }
