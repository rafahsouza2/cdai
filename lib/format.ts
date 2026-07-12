const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

/** Converte "59.274,24" (pt-BR) ou um numero ja pronto em number. */
export function parseNumeroPtBr(value: unknown): number {
  if (typeof value === 'number') return value
  if (value == null) return 0
  const s = String(value).replace(/[^\d,.-]/g, '').trim()
  if (!s) return 0
  const normalizado = s.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(normalizado)
  return Number.isFinite(n) ? n : 0
}

/** Extrai data no formato ISO (yyyy-mm-dd) de um valor Date ou string "dd/mm/yyyy". */
export function toISODate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string') {
    const m = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (m) return `${m[3]}-${m[2]}-${m[1]}`
  }
  return null
}

/** Normaliza nomes de convenio vindos das planilhas (formatos inconsistentes) em
 *  { nome, grupo }, ex: "AMIL - DIRETO" -> { nome: "AMIL", grupo: "DIRETO" },
 *  "BACEN - AMHPDF" -> { nome: "BACEN", grupo: "AMHP" }. */
export function normalizeConvenio(raw: string): { nome: string; grupo: 'DIRETO' | 'AMHP' } {
  let s = (raw ?? '').replace(/\s+/g, ' ').trim()
  s = s.replace(/-+\s*$/, '').trim()

  const grupo: 'DIRETO' | 'AMHP' = /AMHP/i.test(s) ? 'AMHP' : 'DIRETO'

  let nome = s
    .replace(/\s*-?\s*AMHPDF\s*$/i, '')
    .replace(/\s*-?\s*AMHP\s*$/i, '')
    .replace(/\s*-?\s*DIRETO\s*$/i, '')
    .replace(/-+\s*$/, '')
    .trim()

  if (!nome) nome = s

  return { nome, grupo }
}

export function competenciaLabel(mes: number, ano: number): string {
  return `${MESES[mes - 1] ?? mes}/${ano}`
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

export const MESES_PT = MESES
