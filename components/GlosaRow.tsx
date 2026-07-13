'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GlosaLinha } from '@/lib/data'
import { formatBRL } from '@/lib/format'
import { editarGlosa, excluirGlosa } from '@/app/dashboard/glosas/actions'

interface GlosaRowProps {
  glosa: GlosaLinha
  podeEditar: boolean
}

export default function GlosaRow({ glosa, podeEditar }: GlosaRowProps) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSalvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const formData = new FormData(e.currentTarget)
    const resultado = await editarGlosa(glosa.id, formData)
    setSalvando(false)
    if (resultado?.erro) {
      setErro(resultado.erro)
      return
    }
    setEditando(false)
    router.refresh()
  }

  async function handleExcluir() {
    if (!confirm('Excluir este lançamento de glosa?')) return
    setSalvando(true)
    await excluirGlosa(glosa.id)
    setSalvando(false)
    router.refresh()
  }

  if (editando) {
    return (
      <tr>
        <td colSpan={6}>
          <form className="justificar-form" onSubmit={handleSalvar} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div className="field-row">
              <div className="field">
                <label>Paciente</label>
                <input name="paciente" defaultValue={glosa.paciente ?? ''} style={{ padding: '8px 10px', border: '1px solid var(--line-strong)', borderRadius: 8, width: '100%', fontFamily: 'inherit', fontSize: 12.5 }} />
              </div>
              <div className="field">
                <label>Código</label>
                <input name="codigo" defaultValue={glosa.codigo ?? ''} style={{ padding: '8px 10px', border: '1px solid var(--line-strong)', borderRadius: 8, width: '100%', fontFamily: 'inherit', fontSize: 12.5 }} />
              </div>
              <div className="field">
                <label>Valor (R$)</label>
                <input name="valor" type="number" step="0.01" min="0" defaultValue={glosa.valor} required style={{ padding: '8px 10px', border: '1px solid var(--line-strong)', borderRadius: 8, width: '100%', fontFamily: 'inherit', fontSize: 12.5 }} />
              </div>
            </div>
            <div className="field">
              <label>Motivo</label>
              <textarea name="motivo" defaultValue={glosa.motivo} required rows={2} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line-strong)', borderRadius: 8, fontFamily: 'inherit', fontSize: 12.5, resize: 'vertical' }} />
            </div>
            <div className="field">
              <label>Observação</label>
              <textarea name="observacao" defaultValue={glosa.observacao ?? ''} rows={2} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line-strong)', borderRadius: 8, fontFamily: 'inherit', fontSize: 12.5, resize: 'vertical' }} />
            </div>
            {erro && <div className="form-erro">{erro}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary btn-small" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
              <button type="button" className="btn-secondary btn-small" onClick={() => setEditando(false)} disabled={salvando}>Cancelar</button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>{new Date(glosa.created_at).toLocaleDateString('pt-BR')}</td>
      <td>{glosa.paciente ?? '—'}</td>
      <td>{glosa.motivo}{glosa.codigo ? ` (${glosa.codigo})` : ''}</td>
      <td className="num destaque-nao-cobrado">{formatBRL(glosa.valor)}</td>
      <td className="observacao-texto">{glosa.observacao ?? '—'}</td>
      <td>
        {podeEditar && (
          <>
            <button className="btn-link" onClick={() => setEditando(true)}>Editar</button>
            <button className="btn-link" style={{ marginLeft: 8, color: 'var(--bad)' }} onClick={handleExcluir} disabled={salvando}>
              Excluir
            </button>
          </>
        )}
      </td>
    </tr>
  )
}
