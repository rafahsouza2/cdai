/**
 * Alguns exports do sistema (ex: producaoConvenio) salvam um .xls que na verdade
 * e uma tabela HTML. O SheetJS consegue ler esse formato, mas seu autodetector de
 * numeros interpreta mal valores em pt-BR (ex: "59.274,24" vira 59.27424). Por isso,
 * para arquivos HTML extraimos as celulas manualmente como texto puro e deixamos
 * o parseNumeroPtBr (lib/format.ts) fazer a conversao correta.
 */
export function isHtmlTable(buffer: Buffer): boolean {
  const inicio = buffer.subarray(0, 512).toString('utf8').trimStart().toLowerCase()
  return inicio.startsWith('<html') || inicio.startsWith('<!doctype')
}

function decodeEntidades(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

export function extrairLinhasHtml(buffer: Buffer): string[][] {
  const html = buffer.toString('utf8')
  const linhasHtml = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) ?? []
  return linhasHtml.map(linha => {
    const celulas = linha.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) ?? []
    return celulas.map(celula =>
      decodeEntidades(celula.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
    )
  })
}
