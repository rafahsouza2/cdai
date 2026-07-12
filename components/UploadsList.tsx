'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { excluirUpload } from '@/app/dashboard/uploads/actions'
import type { UploadLinha } from '@/lib/data'

interface UploadsListProps {
  uploads: UploadLinha[]
  podeEditar: boolean
}

export default function UploadsList({ uploads, podeEditar }: UploadsListProps) {
  const router = useRouter()
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  if (uploads.length === 0) return null

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Excluir o arquivo "${nome}"? Todos os dados importados por ele serão removidos.`)) {
      return
    }
    setExcluindo(id)
    setErro('')
    const resultado = await excluirUpload(id)
    setExcluindo(null)
    if (resultado?.erro) {
      setErro(resultado.erro)
      return
    }
    router.refresh()
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Arquivos enviados</span>
      </div>
      <div className="panel-body" style={{ padding: 0 }}>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Arquivo</th>
                <th className="num">Linhas</th>
                <th>Enviado em</th>
                {podeEditar && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {uploads.map(u => (
                <tr key={u.id}>
                  <td>{u.nome_arquivo}</td>
                  <td className="num">{u.linhas_processadas}</td>
                  <td>{new Date(u.enviado_em).toLocaleString('pt-BR')}</td>
                  {podeEditar && (
                    <td>
                      <button
                        className="btn-link"
                        style={{ color: 'var(--red)' }}
                        disabled={excluindo === u.id}
                        onClick={() => handleExcluir(u.id, u.nome_arquivo)}
                      >
                        {excluindo === u.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {erro && <div className="form-erro" style={{ padding: '0 18px 12px' }}>{erro}</div>}
      </div>
    </div>
  )
}
