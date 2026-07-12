import * as XLSX from 'xlsx'
import { normalizeConvenio, parseNumeroPtBr } from './format'
import { isHtmlTable, extrairLinhasHtml } from './parse-html-table'

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
  let rows: unknown[][]
  if (isHtmlTable(buffer)) {
    rows = extrairLinhasHtml(buffer)
  } else {
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null })
  }

  const linhas: LinhaProducao[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length < 8) break

    const primeiraCelula = row[0]
    if (typeof primeiraCelula !== 'string' || !primeiraCelula.trim()) break
    if (/^total/i.test(primeiraCelula.trim())) break

    const { nome, grupo } = normalizeConvenio(primeiraCelula)

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
