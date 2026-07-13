import type { Competencia, EvolucaoGlosasLinha } from '@/lib/data'
import { formatBRL } from '@/lib/format'

interface GlosasEvolucaoTableProps {
  competencias: Competencia[]
  evolucao: EvolucaoGlosasLinha[]
}

export default function GlosasEvolucaoTable({ competencias, evolucao }: GlosasEvolucaoTableProps) {
  if (evolucao.length === 0) {
    return <div className="empty-state">Nenhuma glosa lançada ainda.</div>
  }

  const cronologica = [...competencias].reverse()
  const totalPorCompetencia = cronologica.map(c =>
    evolucao.reduce((s, l) => s + (l.porCompetencia[c.id] ?? 0), 0)
  )
  const totalGeral = evolucao.reduce((s, l) => s + l.total, 0)

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Convênio</th>
            {cronologica.map(c => <th key={c.id} className="num">{c.label}</th>)}
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {evolucao.map(linha => (
            <tr key={linha.convenioId}>
              <td><strong>{linha.convenioNome}</strong></td>
              {cronologica.map(c => {
                const valor = linha.porCompetencia[c.id]
                return (
                  <td key={c.id} className="num">
                    {valor ? formatBRL(valor) : <span style={{ color: 'var(--ink-faint)' }}>—</span>}
                  </td>
                )
              })}
              <td className="num destaque-nao-cobrado">{formatBRL(linha.total)}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td>Total por mês</td>
            {totalPorCompetencia.map((valor, i) => (
              <td key={cronologica[i].id} className="num">{formatBRL(valor)}</td>
            ))}
            <td className="num">{formatBRL(totalGeral)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
