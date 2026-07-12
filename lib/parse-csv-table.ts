/**
 * Alguns exports do sistema (ex: relatorio_igut) saem como CSV separado por ";",
 * com BOM UTF-8 e numeros/datas em formato pt-BR (ex: "268,26", "18/6/2026").
 * O SheetJS tenta "adivinhar" tipos numericos/data ao ler CSV e usa convencao
 * americana: interpreta a virgula como separador de milhar (vira 26826 em vez
 * de 268.26) e a data como mes/dia (vira 6 de janeiro em vez de 18 de junho).
 * Por isso lemos o CSV manualmente, mantendo tudo como texto, e deixamos o
 * parseNumeroPtBr/toISODate (lib/format.ts) interpretarem os valores certos.
 */
function removerBOM(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

function parseLinhaCsv(linha: string, delimitador: string): string[] {
  const campos: string[] = []
  let atual = ''
  let dentroAspas = false

  for (let i = 0; i < linha.length; i++) {
    const c = linha[i]
    if (dentroAspas) {
      if (c === '"') {
        if (linha[i + 1] === '"') {
          atual += '"'
          i++
        } else {
          dentroAspas = false
        }
      } else {
        atual += c
      }
    } else if (c === '"') {
      dentroAspas = true
    } else if (c === delimitador) {
      campos.push(atual)
      atual = ''
    } else {
      atual += c
    }
  }
  campos.push(atual)
  return campos.map(c => c.trim())
}

export function extrairLinhasCsv(buffer: Buffer): string[][] {
  const texto = removerBOM(buffer.toString('utf8'))
  const linhas = texto.split(/\r\n|\n|\r/).filter(l => l.length > 0)
  if (linhas.length === 0) return []

  const delimitador = linhas[0].includes(';') ? ';' : ','
  return linhas.map(linha => parseLinhaCsv(linha, delimitador))
}
