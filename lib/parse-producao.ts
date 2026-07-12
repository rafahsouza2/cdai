import { normalizeConvenio, parseNumeroPtBr, isConvenioExcluido } from './format'
import { lerLinhas } from './read-rows'

export interface LinhaProducao {
  convenioNome: string
  convenioGrupo: 'DIRETO' | 'AMHP'
  quantidade: number
  produzido: number
  cobrado: number
  recebido: number
  ir: number
  liquido: number
}

/**
 * Le a planilha "Atendimentos agrupados por Convenio" (exportada como .xls que na
 * verdade e uma tabela HTML, ou um .xlsx real com o mesmo layout). Colunas:
 * Convenio | Pct Unico | Qtd | Produzido | Cobrado | Recebido | IR | Liquido
 */
export function parseProducao(buffer: Buffer): LinhaProducao[] {
  const rows = lerLinhas(buffer)

  const linhas: LinhaProducao[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length < 8) break

    const primeiraCelula = row[0]
    if (typeof primeiraCelula !== 'string' || !primeiraCelula.trim()) break
    if (/^total/i.test(primeiraCelula.trim())) break

    const { nome, grupo } = normalizeConvenio(primeiraCelula)
    if (isConvenioExcluido(nome)) continue

    linhas.push({
      convenioNome: nome,
      convenioGrupo: grupo,
      quantidade: Math.round(parseNumeroPtBr(row[2])),
      produzido: parseNumeroPtBr(row[3]),
      cobrado: parseNumeroPtBr(row[4]),
      recebido: parseNumeroPtBr(row[5]),
      ir: parseNumeroPtBr(row[6]),
      liquido: parseNumeroPtBr(row[7]),
    })
  }

  if (linhas.length === 0) {
    throw new Error('Nenhuma linha de producao encontrada no arquivo. Verifique o modelo utilizado.')
  }

  return linhas
}
