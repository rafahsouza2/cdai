import { Fragment } from 'react'
import type { ProducaoLinha } from '@/lib/data'
import { formatBRL, formatPercent } from '@/lib/format'

interface ProducaoTableProps {
  linhas: ProducaoLinha[]
  convenioIdsComPendencia: Set<string>
}

const GRUPOS: Array<'DIRETO' | 'AMHP'> = ['DIRETO', 'AMHP']

export default function ProducaoTable({ linhas, convenioIdsComPendencia }: ProducaoTableProps) {
  if (linhas.length === 0) {
    return <div className="empty-state">Nenhum dado de produção para esta competência ainda.</div>
  }

  const totais = linhas.reduce(
    (acc, l) => ({
      quantidade: acc.quantidade + l.quantidade,
      produzido: acc.produzido + l.produzido,
      cobrado: acc.cobrado + l.cobrado,
    }),
    { quantidade: 0, produzido: 0, cobrado: 0 }
  )
  const naoCobradoTotal = totais.produzido - totais.cobrado
  const taxaTotal = totais.produzido > 0 ? (naoCobradoTotal / totais.produzido) * 100 : 0

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Convênio</th>
            <th>Tipo</th>
            <th className="num">Qtd</th>
            <th className="num">Produzido (R$)</th>
            <th className="num">Cobrado (R$)</th>
            <th className="num">Não Cobrado (R$)</th>
            <th className="num">% Não Cobrado</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {GRUPOS.map(grupo => {
            const doGrupo = linhas.filter(l => l.convenio.grupo === grupo)
            if (doGrupo.length === 0) return null
            return (
              <Fragment key={grupo}>
                <tr className="group-row">
                  <td colSpan={8}>Convênios {grupo === 'DIRETO' ? 'Direto' : 'AMHP'}</td>
                </tr>
                {doGrupo.map(l => {
                  const naoCobrado = l.produzido - l.cobrado
                  const taxa = l.produzido > 0 ? (naoCobrado / l.produzido) * 100 : 0
                  const temPendencia = convenioIdsComPendencia.has(l.convenio.id)
                  return (
                    <tr key={l.id}>
                      <td>{l.convenio.nome}</td>
                      <td>{grupo}</td>
                      <td className="num">{l.quantidade}</td>
                      <td className="num">{formatBRL(l.produzido)}</td>
                      <td className="num">{formatBRL(l.cobrado)}</td>
                      <td className={`num${naoCobrado > 0.004 ? ' destaque-nao-cobrado' : ''}`}>{formatBRL(naoCobrado)}</td>
                      <td className="num">{formatPercent(taxa)}</td>
                      <td>
                        <span className={`status-pill ${temPendencia ? 's-pending' : 's-ok'}`}>
                          {temPendencia ? 'Pendência' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </Fragment>
            )
          })}
          <tr className="total-row">
            <td colSpan={2}>TOTAIS</td>
            <td className="num">{totais.quantidade}</td>
            <td className="num">{formatBRL(totais.produzido)}</td>
            <td className="num">{formatBRL(totais.cobrado)}</td>
            <td className="num">{formatBRL(naoCobradoTotal)}</td>
            <td className="num">{formatPercent(taxaTotal)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
