import { createClient } from '@/lib/supabase/server'
import {
  getCompetencias, getCompetenciaSelecionada, getGlosasPorCompetencia,
  getEvolucaoGlosas, calcularKpisGlosas, getConvenios, type GlosaLinha,
} from '@/lib/data'
import CompetenciaSelect from '@/components/CompetenciaSelect'
import GlosaForm from '@/components/GlosaForm'
import GlosaRow from '@/components/GlosaRow'
import GlosasEvolucaoTable from '@/components/GlosasEvolucaoTable'
import { formatBRL } from '@/lib/format'

interface PageProps {
  searchParams: Promise<{ competencia?: string }>
}

export default async function GlosasPage({ searchParams }: PageProps) {
  const { competencia: competenciaParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const podeEditar = user?.user_metadata?.role === 'faturista' || user?.user_metadata?.role === 'admin'

  const competencias = await getCompetencias(supabase)
  const competenciaAtual = await getCompetenciaSelecionada(supabase, competenciaParam)
  const convenios = await getConvenios(supabase)

  const [glosas, evolucao] = await Promise.all([
    competenciaAtual
      ? getGlosasPorCompetencia(supabase, competenciaAtual.id)
      : Promise.resolve([] as GlosaLinha[]),
    getEvolucaoGlosas(supabase),
  ])

  const kpis = calcularKpisGlosas(glosas)
  const totalAcumulado = evolucao.reduce((s, l) => s + l.total, 0)
  const convenioComMaisGlosa = evolucao[0]

  const porConvenio = new Map<string, GlosaLinha[]>()
  for (const g of glosas) {
    const chave = g.convenio.nome
    if (!porConvenio.has(chave)) porConvenio.set(chave, [])
    porConvenio.get(chave)!.push(g)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Glosas{competenciaAtual ? ` · ${competenciaAtual.label}` : ''}</div>
        {competenciaAtual && (
          <CompetenciaSelect competencias={competencias} selecionadaId={competenciaAtual.id} />
        )}
      </div>

      {podeEditar && competenciaAtual && (
        <div className="action-bar">
          <GlosaForm convenios={convenios} competencias={competencias} competenciaAtualId={competenciaAtual.id} />
        </div>
      )}

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))' }}>
        <div className="kpi-card red">
          <div className="kpi-label">Total Glosado{competenciaAtual ? ` · ${competenciaAtual.label}` : ''}</div>
          <div className="kpi-value">{formatBRL(kpis.totalGlosado)}</div>
          <span className="kpi-badge badge-amber">
            {kpis.quantidade} ocorrência{kpis.quantidade === 1 ? '' : 's'}
          </span>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Convênio com mais glosas</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{convenioComMaisGlosa?.convenioNome ?? '—'}</div>
          <span className="kpi-badge badge-plum">
            {formatBRL(convenioComMaisGlosa?.total ?? 0)} acumulado
          </span>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Acumulado Geral</div>
          <div className="kpi-value">{formatBRL(totalAcumulado)}</div>
          <span className="kpi-badge badge-plum">
            {competencias.length} competência{competencias.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Evolução de Glosas por Convênio</span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <GlosasEvolucaoTable competencias={competencias} evolucao={evolucao} />
        </div>
      </div>

      {competenciaAtual && glosas.length === 0 && (
        <div className="panel">
          <div className="empty-state">Nenhuma glosa lançada em {competenciaAtual.label}.</div>
        </div>
      )}

      {[...porConvenio.entries()].map(([nomeConvenio, linhas]) => {
        const subtotal = linhas.reduce((s, l) => s + l.valor, 0)
        return (
          <div className="panel convenio-section" key={nomeConvenio}>
            <div className="panel-header convenio-section-header">
              <span className="convenio-section-title">{nomeConvenio}</span>
              <span className="convenio-section-total">{formatBRL(subtotal)} glosado</span>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Paciente</th>
                      <th>Motivo</th>
                      <th className="num">Valor (R$)</th>
                      <th>Observação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map(g => (
                      <GlosaRow key={g.id} glosa={g} podeEditar={podeEditar} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
