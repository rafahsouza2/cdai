import { createClient } from '@/lib/supabase/server'
import {
  getCompetencias, getCompetenciaSelecionada, getProducaoPorCompetencia,
  getPendenciasPorCompetencia, calcularKpis,
} from '@/lib/data'
import CompetenciaSelect from '@/components/CompetenciaSelect'
import KpiCards from '@/components/KpiCards'
import ProducaoTable from '@/components/ProducaoTable'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ competencia?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { competencia: competenciaParam } = await searchParams
  const supabase = await createClient()

  const competencias = await getCompetencias(supabase)
  const competenciaAtual = await getCompetenciaSelecionada(supabase, competenciaParam)

  if (!competenciaAtual) {
    return (
      <div className="panel">
        <div className="empty-state">
          Nenhuma competência cadastrada ainda.<br />
          Envie a primeira planilha de produção em{' '}
          <Link href="/dashboard/producao" className="btn-link">Produção e Cobrança</Link>.
        </div>
      </div>
    )
  }

  const [producao, pendencias] = await Promise.all([
    getProducaoPorCompetencia(supabase, competenciaAtual.id),
    getPendenciasPorCompetencia(supabase, competenciaAtual.id),
  ])

  const kpis = calcularKpis(producao)
  const convenioIdsComPendencia = new Set(
    pendencias.filter(p => p.status === 'pendente').map(p => p.convenio.id)
  )

  return (
    <>
      <div className="page-header">
        <div className="page-title">Visão Geral · {competenciaAtual.label}</div>
        <CompetenciaSelect competencias={competencias} selecionadaId={competenciaAtual.id} />
      </div>

      <KpiCards kpis={kpis} />

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Produção e Cobrança por Convênio</span>
          <span className="chip">{competenciaAtual.label}</span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <ProducaoTable linhas={producao} convenioIdsComPendencia={convenioIdsComPendencia} />
        </div>
      </div>
    </>
  )
}
