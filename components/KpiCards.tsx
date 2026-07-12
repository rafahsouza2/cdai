import type { Kpis } from '@/lib/data'
import { formatBRL, formatPercent } from '@/lib/format'

export default function KpiCards({ kpis }: { kpis: Kpis }) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card plum">
        <div className="kpi-label">Total Produzido</div>
        <div className="kpi-value">{formatBRL(kpis.totalProduzido)}</div>
      </div>
      <div className="kpi-card red">
        <div className="kpi-label">Total Não Cobrado</div>
        <div className="kpi-value">{formatBRL(kpis.totalNaoCobrado)}</div>
      </div>
      <div className="kpi-card amber">
        <div className="kpi-label">Taxa de Não Cobrança</div>
        <div className="kpi-value">{formatPercent(kpis.taxaNaoCobranca)}</div>
      </div>
      <div className="kpi-card pistache">
        <div className="kpi-label">Total Cobrado</div>
        <div className="kpi-value">{formatBRL(kpis.totalCobrado)}</div>
      </div>
    </div>
  )
}
