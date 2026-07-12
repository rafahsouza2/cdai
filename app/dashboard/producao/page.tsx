import { createClient } from '@/lib/supabase/server'
import {
  getCompetencias, getCompetenciaSelecionada, getProducaoPorCompetencia,
  getPendenciasPorCompetencia, getUploadsPorCompetencia,
} from '@/lib/data'
import CompetenciaSelect from '@/components/CompetenciaSelect'
import ProducaoTable from '@/components/ProducaoTable'
import UploadForm from '@/components/UploadForm'
import UploadsList from '@/components/UploadsList'

interface PageProps {
  searchParams: Promise<{ competencia?: string }>
}

export default async function ProducaoPage({ searchParams }: PageProps) {
  const { competencia: competenciaParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const podeEditar = user?.user_metadata?.role === 'faturista' || user?.user_metadata?.role === 'admin'

  const competencias = await getCompetencias(supabase)
  const competenciaAtual = await getCompetenciaSelecionada(supabase, competenciaParam)

  const [producao, pendencias, uploads] = competenciaAtual
    ? await Promise.all([
        getProducaoPorCompetencia(supabase, competenciaAtual.id),
        getPendenciasPorCompetencia(supabase, competenciaAtual.id),
        getUploadsPorCompetencia(supabase, competenciaAtual.id, 'producao'),
      ])
    : [[], [], []]

  const convenioIdsComPendencia = new Set(
    pendencias.filter(p => p.status === 'pendente').map(p => p.convenio.id)
  )

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          Produção e Cobrança{competenciaAtual ? ` · ${competenciaAtual.label}` : ''}
        </div>
        {competenciaAtual && (
          <CompetenciaSelect competencias={competencias} selecionadaId={competenciaAtual.id} />
        )}
      </div>

      {podeEditar && (
        <div className="action-bar">
          <UploadForm
            tipo="producao"
            titulo="Enviar arquivo de Produção"
            descricao="Planilha de atendimentos agrupados por convênio (modelo producaoConvenio)."
          />
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Produção e Cobrança por Convênio</span>
          {competenciaAtual && <span className="chip">{competenciaAtual.label}</span>}
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <ProducaoTable linhas={producao} convenioIdsComPendencia={convenioIdsComPendencia} />
        </div>
      </div>

      <UploadsList uploads={uploads} podeEditar={podeEditar} />
    </>
  )
}
