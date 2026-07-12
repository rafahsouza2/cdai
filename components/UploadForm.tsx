'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MESES_PT } from '@/lib/format'

interface UploadFormProps {
  tipo: 'producao' | 'pendencias'
  titulo: string
  descricao: string
}

const ANO_ATUAL = new Date().getFullYear()
const ANOS = [ANO_ATUAL - 1, ANO_ATUAL, ANO_ATUAL + 1]

export default function UploadForm({ tipo, titulo, descricao }: UploadFormProps) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(ANO_ATUAL)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  function fechar() {
    setAberto(false)
    setErro('')
    setSucesso('')
    setArquivo(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!arquivo) {
      setErro('Selecione um arquivo.')
      return
    }
    setErro('')
    setSucesso('')
    setCarregando(true)

    const formData = new FormData()
    formData.set('file', arquivo)
    formData.set('mes', String(mes))
    formData.set('ano', String(ano))

    try {
      const resp = await fetch(`/api/upload/${tipo}`, { method: 'POST', body: formData })
      const json = await resp.json()
      if (!resp.ok) {
        setErro(json.erro ?? 'Falha ao processar o arquivo.')
        setCarregando(false)
        return
      }
      setSucesso(`${json.linhas} linha(s) importada(s) com sucesso.`)
      setCarregando(false)
      router.refresh()
    } catch {
      setErro('Erro de conexão ao enviar o arquivo.')
      setCarregando(false)
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setAberto(true)}>📥 Enviar arquivo</button>

      {aberto && (
        <div className="modal-overlay" onClick={fechar}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{titulo}</div>
            <div className="modal-sub">{descricao}</div>

            <form onSubmit={handleSubmit}>
              <div className="field-row">
                <div className="field">
                  <label>Mês</label>
                  <select className="select-input" value={mes} onChange={e => setMes(Number(e.target.value))}>
                    {MESES_PT.map((nome, i) => (
                      <option key={nome} value={i + 1}>{nome}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Ano</label>
                  <select className="select-input" value={ano} onChange={e => setAno(Number(e.target.value))}>
                    {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Arquivo (.xls ou .xlsx)</label>
                <input
                  className="file-input"
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                />
              </div>

              {erro && <div className="form-erro">{erro}</div>}
              {sucesso && <div className="form-sucesso">{sucesso}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={fechar}>Fechar</button>
                <button type="submit" className="btn-primary" disabled={carregando}>
                  {carregando ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
