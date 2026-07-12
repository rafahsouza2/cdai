import { normalizeConvenio, parseNumeroPtBr, toISODate, isConvenioExcluido } from './format'
import { lerLinhas } from './read-rows'

export interface LinhaPendencia {
  convenioNome: string
  convenioGrupo: 'DIRETO' | 'AMHP'
  dataAtendimento: string | null
  paciente: string
  tipoProcedimento: string | null
  medico: string | null
  executante: string | null
  valorProduzido: number
}

const COLUNA_ESPERADA = 'DATA ATEND.'

/**
 * Le a planilha de pendencias (nao cobrado) por convenio, ex: Amil.xlsx. A planilha
 * costuma ter uma linha de titulo antes do cabecalho real, e uma linha de rodape/
 * subtotal ao final (onde a coluna "Paciente" fica vazia).
 */
export function parsePendencias(buffer: Buffer): LinhaPendencia[] {
  const rows = lerLinhas(buffer, { cellDates: true })

  const headerIndex = rows.findIndex(
    row => typeof row[0] === 'string' && row[0].trim().toUpperCase() === COLUNA_ESPERADA
  )
  if (headerIndex === -1) {
    throw new Error('Cabecalho "Data Atend." nao encontrado. Verifique o modelo utilizado.')
  }

  const header = (rows[headerIndex] as string[]).map(h => (h ?? '').toString().trim().toLowerCase())
  const idx = (nome: string) => header.indexOf(nome)

  const iData = idx('data atend.')
  const iPaciente = idx('paciente')
  const iTipo = idx('tipo')
  const iConvenio = idx('convenio')
  const iMedico = idx('medico')
  const iExecutante = idx('executante')
  const iValorProduzido = idx('valor produzido')

  if (iPaciente === -1 || iConvenio === -1 || iValorProduzido === -1) {
    throw new Error('Colunas obrigatorias (Paciente, Convenio, Valor Produzido) nao encontradas.')
  }

  const linhas: LinhaPendencia[] = []

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row) break

    const paciente = row[iPaciente]
    if (typeof paciente !== 'string' || !paciente.trim()) break

    const { nome, grupo } = normalizeConvenio(String(row[iConvenio] ?? ''))
    if (isConvenioExcluido(nome)) continue

    const valorProduzido = parseNumeroPtBr(row[iValorProduzido])
    if (valorProduzido <= 0) continue

    linhas.push({
      convenioNome: nome,
      convenioGrupo: grupo,
      dataAtendimento: iData !== -1 ? toISODate(row[iData]) : null,
      paciente: paciente.trim(),
      tipoProcedimento: iTipo !== -1 ? (row[iTipo] as string | null) : null,
      medico: iMedico !== -1 ? (row[iMedico] as string | null) : null,
      executante: iExecutante !== -1 ? (row[iExecutante] as string | null) : null,
      valorProduzido,
    })
  }

  if (linhas.length === 0) {
    throw new Error('Nenhuma linha de pendencia encontrada no arquivo.')
  }

  return linhas
}
