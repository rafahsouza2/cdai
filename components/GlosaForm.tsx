'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarGlosa } from '@/app/dashboard/glosas/actions'
import type { Convenio, Competencia } from '@/lib/data'

interface GlosaFormProps {
  convenios: Convenio[]
  competencias: Competencia[]
  competenciaAtualId: string
}

export default function GlosaForm({ convenios, competencias, competenciaAtualId }: GlosaFormProps) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function fechar() {
    setAberto(false)
    setErro('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const formData = new FormData(e.currentTarget)
    const resultado = await criarGlosa(formData)
    setSalvando(false)
    if (resultado?.erro) {
      setErro(resultado.erro)
      return
    }
    fechar()
    router.refresh()
  }

  if (convenios.length === 0 || competencias.length === 0) {
    return null
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setAberto(true)}>＋ Lançar glosa</button>

      {aberto && (
        <div className="modal-overlay" onClick={fechar}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Lançar glosa</div>
            <div className="modal-sub">Registre um valor negado pelo convênio e o motivo informado.</div>

            <form onSubmit={handleSubmit}>
              <div className="field-row">
                <div className="field">
                  <label>Competência</label>
                  <select name="competenciaId" className="select-input" defaultValue={competenciaAtualId}>
                    {competencias.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Convênio</label>
                  <select name="convenioId" className="select-input" required defaultValue="">
                    <option value="" disabled>Selecione…</option>
                    {convenios.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Valor glosado (R$)</label>
                  <input className="file-input" style={{ padding: '10px 12px', border: '1px solid var(--line-strong)', borderRadius: 9, width: '100%' }} type="number" step="0.01" min="0" name="valor" required />
                </div>
                <div className="field">
                  <label>Código (opcional)</label>
                  <input className="file-input" style={{ padding: '10px 12px', border: '1px solid var(--line-strong)', borderRadius: 9, width: '100%' }} type="text" name="codigo" placeholder="ex: 1814" />
                </div>
              </div>

              <div className="field">
                <label>Paciente (opcional)</label>
                <input className="file-input" style={{ padding: '10px 12px', border: '1px solid var(--line-strong)', borderRadius: 9, width: '100%' }} type="text" name="paciente" />
              </div>

              <div className="field">
                <label>Motivo da glosa</label>
                <textarea name="motivo" required rows={2}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line-strong)', borderRadius: 9, fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }}
                  placeholder="ex: guia vencida, cobrança em duplicidade…" />
              </div>

              <div className="field">
                <label>Observação (opcional)</label>
                <textarea name="observacao" rows={2}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line-strong)', borderRadius: 9, fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }}
                  placeholder="ex: recurso protocolado em 10/07" />
              </div>

              {erro && <div className="form-erro">{erro}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={fechar}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Lançar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
