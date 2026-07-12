import * as XLSX from 'xlsx'
import { isHtmlTable, extrairLinhasHtml } from './parse-html-table'
import { extrairLinhasCsv } from './parse-csv-table'

function isZipXlsx(buffer: Buffer): boolean {
  return buffer.length > 2 && buffer[0] === 0x50 && buffer[1] === 0x4b // assinatura "PK" de arquivo .xlsx real (zip)
}

/**
 * Le um arquivo de upload (.xls HTML disfarçado, .xlsx real, ou .csv) e retorna
 * as linhas como array de arrays. Só usamos o autodetector de tipos do SheetJS
 * para arquivos .xlsx reais (zip) — para HTML e CSV extraimos tudo como texto
 * puro, porque o SheetJS interpreta mal numeros/datas em formato pt-BR nesses
 * dois formatos (ver parse-html-table.ts e parse-csv-table.ts).
 */
export function lerLinhas(buffer: Buffer, opts?: { cellDates?: boolean }): unknown[][] {
  if (isZipXlsx(buffer)) {
    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: opts?.cellDates })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null })
  }
  if (isHtmlTable(buffer)) {
    return extrairLinhasHtml(buffer)
  }
  return extrairLinhasCsv(buffer)
}
