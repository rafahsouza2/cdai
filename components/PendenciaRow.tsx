'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PendenciaLinha } from '@/lib/data'
import { formatBRL } from '@/lib/format'
import { justificarPendencia, reabrirPendencia } from '@/app/dashboard/pendencias/actions'

const CATEGORIAS = [
  { value: 'glosa', label: 'Glosa' },
  { value: 'aguardando_nf', label: 'Aguardando NF/Quitação' },
  { value: 'recurso_andamento', label: 'Recurso em andamento' },
  { value: 'erro_cadastral', label: 'Erro cadastral' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'outro', label: 'Outro' },
]

function labelCategoria(valor: string | null): string {
  return CATEGORIAS.find(c => c.value === valor)?.label ?? '—'
}

interface PendenciaRowProps {
  pendencia: PendenciaLinha
  podeEditar: boolean
}

export default function PendenciaRow({ pendencia, podeEditar }: PendenciaRowProps) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [categoria, setCategoria] = useState(pendencia.categoria_justificativa ?? CATEGORIAS[0].value)
  const [observacao, setObservacao] = useState(pendencia.observacao ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSalvar() {
    setSalvando(true)
    setErro('')
    const resultado = await justificarPendencia(pendencia.id, categoria, observacao)
    setSalvando(false)
    if (resultado?.erro) {
      setErro(resultado.erro)
      return
    }
    setEditando(false)
    router.refresh()
  }

  async function handleReabrir() {
    setSalvando(true)
    await reabrirPendencia(pendencia.id)
    setSalvando(false)
    router.refresh()
  }

  const justificada = pendencia.status === 'justificada'

  return (
    <>
      <tr>
        <td>{pendencia.data_atendimento ? new Date(pendencia.data_atendimento + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
        <td>{pendencia.paciente}</td>
        <td>{pendencia.tipo_procedimento ?? '—'}</td>
        <td className="num">{formatBRL(pendencia.valor_produzido)}</td>
        <td>
          <span className={`status-pill ${justificada ? 's-justificada' : 's-pending'}`}>
            {justificada ? 'Justificada' : 'Pendente'}
          </span>
        </td>
        <td>
          {justificada && !editando && (
            <span className="observacao-texto">
              {labelCategoria(pendencia.categoria_justificativa)}
              {pendencia.observacao ? ` — ${pendencia.observacao}` : ''}
            </span>
          )}
          {podeEditar && !editando && (
            <button className="btn-link" onClick={() => setEditando(true)} style={{ marginLeft: justificada ? 8 : 0 }}>
              {justificada ? 'Editar' : 'Justificar'}
            </button>
          )}
          {podeEditar && justificada && !editando && (
            <button className="btn-link" onClick={handleReabrir} disabled={salvando} style={{ marginLeft: 8 }}>
              Reabrir
            </button>
          )}
        </td>
      </tr>

      {editando && (
        <tr>
          <td colSpan={6}>
            <div className="justificar-form">
              <select value={categoria} onChange={e => setCategoria(e.target.value)}>
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <textarea
                placeholder="Observação (opcional)"
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
              />
              <button className="btn-primary btn-small" onClick={handleSalvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button className="btn-secondary btn-small" onClick={() => setEditando(false)} disabled={salvando}>
                Cancelar
              </button>
            </div>
            {erro && <div className="form-erro">{erro}</div>}
          </td>
        </tr>
      )}
    </>
  )
}
