import { createClient } from '@/lib/supabase/server'
import {
  getCompetencias, getCompetenciaSelecionada, getPendenciasPorCompetencia, getUploadsPorCompetencia,
} from '@/lib/data'
import CompetenciaSelect from '@/components/CompetenciaSelect'
import UploadForm from '@/components/UploadForm'
import UploadsList from '@/components/UploadsList'
import PendenciaRow from '@/components/PendenciaRow'
import { formatBRL } from '@/lib/format'
import { podeGerenciarUploads } from '@/lib/permissoes'

interface PageProps {
  searchParams: Promise<{ competencia?: string }>
}

export default async function PendenciasPage({ searchParams }: PageProps) {
  const { competencia: competenciaParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const podeUpload = podeGerenciarUploads(user?.email)
  const podeJustificar = user?.user_metadata?.role === 'faturista' || user?.user_metadata?.role === 'admin'

  const competencias = await getCompetencias(supabase)
  const competenciaAtual = await getCompetenciaSelecionada(supabase, competenciaParam)
  const pendencias = competenciaAtual ? await getPendenciasPorCompetencia(supabase, competenciaAtual.id) : []
  const uploads = competenciaAtual && podeUpload
    ? await getUploadsPorCompetencia(supabase, competenciaAtual.id, 'pendencia')
    : []

  const porConvenio = new Map<string, typeof pendencias>()
  for (const p of pendencias) {
    const chave = p.convenio.nome
    if (!porConvenio.has(chave)) porConvenio.set(chave, [])
    porConvenio.get(chave)!.push(p)
  }

  const totalNaoJustificado = pendencias
    .filter(p => p.status === 'pendente')
    .reduce((s, p) => s + p.valor_produzido, 0)

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          Pendências{competenciaAtual ? ` · ${competenciaAtual.label}` : ''}
        </div>
        {competenciaAtual && (
          <CompetenciaSelect competencias={competencias} selecionadaId={competenciaAtual.id} />
        )}
      </div>

      {podeUpload && (
        <div className="action-bar">
          <UploadForm
            tipo="pendencias"
            titulo="Enviar arquivo de Pendências"
            descricao="Planilha de não cobrados por convênio (modelo Amil.xlsx). Reenviar substitui os lançamentos deste convênio nesta competência."
          />
        </div>
      )}

      {pendencias.length > 0 && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(200px, 1fr))', marginBottom: 18 }}>
          <div className="kpi-card red">
            <div className="kpi-label">Não Cobrado Ainda Não Justificado</div>
            <div className="kpi-value">{formatBRL(totalNaoJustificado)}</div>
          </div>
          <div className="kpi-card plum">
            <div className="kpi-label">Total de Lançamentos</div>
            <div className="kpi-value">{pendencias.length}</div>
          </div>
        </div>
      )}

      {pendencias.length === 0 && (
        <div className="panel">
          <div className="empty-state">
            Nenhuma pendência cadastrada para esta competência.
          </div>
        </div>
      )}

      {[...porConvenio.entries()].map(([nomeConvenio, linhas]) => {
        const subtotal = linhas.reduce((s, l) => s + l.valor_produzido, 0)
        const pendentes = linhas.filter(l => l.status === 'pendente').length
        return (
          <div className="panel convenio-section" key={nomeConvenio}>
            <div className="panel-header convenio-section-header">
              <span className="convenio-section-title">{nomeConvenio}</span>
              <span className="convenio-section-total">
                {formatBRL(subtotal)} não cobrado
                {pendentes > 0 && <span className="chip" style={{ marginLeft: 8 }}>{pendentes} pendente(s)</span>}
              </span>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data Atend.</th>
                      <th>Paciente</th>
                      <th>Tipo</th>
                      <th className="num">Valor Produzido (R$)</th>
                      <th>Status</th>
                      <th>Justificativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map(l => (
                      <PendenciaRow key={l.id} pendencia={l} podeEditar={podeJustificar} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })}

      <UploadsList uploads={uploads} podeEditar={podeUpload} />
    </>
  )
}
