import type { Kpis } from '@/lib/data'
import { formatBRL, formatPercent } from '@/lib/format'

interface KpiCardsProps {
  kpis: Kpis
  convenioCount: number
  pendenciasAbertas: number
}

const META_TAXA_NAO_COBRANCA = 5

export default function KpiCards({ kpis, convenioCount, pendenciasAbertas }: KpiCardsProps) {
  const percentCobrado = kpis.totalProduzido > 0 ? 100 - kpis.taxaNaoCobranca : 0
  const dentroDaMeta = kpis.taxaNaoCobranca <= META_TAXA_NAO_COBRANCA

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-label">Total Produzido</div>
        <div className="kpi-value">{formatBRL(kpis.totalProduzido)}</div>
        <span className="kpi-badge badge-plum">{convenioCount} convênio{convenioCount === 1 ? '' : 's'}</span>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Total Cobrado</div>
        <div className="kpi-value">{formatBRL(kpis.totalCobrado)}</div>
        <span className="kpi-badge badge-green">▲ {formatPercent(percentCobrado)} do produzido</span>
      </div>
      <div className="kpi-card red">
        <div className="kpi-label">Total Não Cobrado</div>
        <div className="kpi-value">{formatBRL(kpis.totalNaoCobrado)}</div>
        <span className="kpi-badge badge-amber">
          {pendenciasAbertas} pendência{pendenciasAbertas === 1 ? '' : 's'} aberta{pendenciasAbertas === 1 ? '' : 's'}
        </span>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Taxa de Não Cobrança</div>
        <div className="kpi-value">{formatPercent(kpis.taxaNaoCobranca)}</div>
        <span className={`kpi-badge ${dentroDaMeta ? 'badge-green' : 'badge-amber'}`}>
          meta: até {META_TAXA_NAO_COBRANCA}%
        </span>
      </div>
    </div>
  )
}
