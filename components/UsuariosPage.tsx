'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarUsuario, editarUsuario, excluirUsuario } from '@/app/dashboard/usuarios/actions'

interface Usuario {
  id: string
  email: string
  nome: string
  role: string
  confirmado: boolean
  ultimoAcesso: string | null
  criado: string
}

const PAPEIS = [
  { value: 'faturista', label: 'Faturista' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'admin', label: 'Admin' },
]

function labelPapel(role: string): string {
  return PAPEIS.find(p => p.value === role)?.label ?? role
}

interface UsuariosPageProps {
  usuarios: Usuario[]
  erroConfig?: string
}

export default function UsuariosPage({ usuarios, erroConfig }: UsuariosPageProps) {
  const router = useRouter()
  const [modalAberto, setModalAberto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function abrirNovo() {
    setUsuarioEditando(null)
    setErro('')
    setModalAberto(true)
  }

  function abrirEdicao(u: Usuario) {
    setUsuarioEditando(u)
    setErro('')
    setModalAberto(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const formData = new FormData(e.currentTarget)

    const resultado = usuarioEditando
      ? await editarUsuario(usuarioEditando.id, formData)
      : await criarUsuario(formData)

    setSalvando(false)
    if (resultado?.erro) {
      setErro(resultado.erro)
      return
    }
    setModalAberto(false)
    router.refresh()
  }

  async function handleExcluir(u: Usuario) {
    if (!confirm(`Excluir o usuário ${u.nome || u.email}?`)) return
    await excluirUsuario(u.id)
    router.refresh()
  }

  if (erroConfig) {
    return (
      <div className="panel">
        <div className="empty-state">
          Erro ao carregar usuários: {erroConfig}<br />
          Verifique se SUPABASE_SERVICE_ROLE_KEY está configurada em .env.local.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Usuários</div>
      </div>

      <div className="action-bar">
        <button className="btn-primary" onClick={abrirNovo}>＋ Novo usuário</button>
      </div>

      <div className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th><th>E-mail</th><th>Papel</th><th>Confirmado</th><th>Último acesso</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.nome || '—'}</td>
                    <td>{u.email}</td>
                    <td><span className="chip">{labelPapel(u.role)}</span></td>
                    <td>{u.confirmado ? 'Sim' : 'Não'}</td>
                    <td>{u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleString('pt-BR') : 'Nunca'}</td>
                    <td>
                      <button className="btn-link" onClick={() => abrirEdicao(u)}>Editar</button>
                      <button className="btn-link" style={{ marginLeft: 8, color: 'var(--red)' }} onClick={() => handleExcluir(u)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr><td colSpan={6} className="empty-state">Nenhum outro usuário cadastrado ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{usuarioEditando ? 'Editar usuário' : 'Novo usuário'}</div>
            <div className="modal-sub">
              {usuarioEditando ? 'Atualize os dados do colaborador.' : 'Defina o acesso do novo colaborador.'}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Nome</label>
                <input
                  className="file-input"
                  style={{ padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 10, width: '100%' }}
                  name="nome"
                  defaultValue={usuarioEditando?.nome ?? ''}
                  required
                />
              </div>
              <div className="field">
                <label>E-mail</label>
                <input
                  type="email"
                  style={{ padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 10, width: '100%' }}
                  name="email"
                  defaultValue={usuarioEditando?.email ?? ''}
                  required
                />
              </div>
              <div className="field">
                <label>Papel</label>
                <select className="select-input" name="role" defaultValue={usuarioEditando?.role ?? 'faturista'}>
                  {PAPEIS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>{usuarioEditando ? 'Nova senha (opcional)' : 'Senha'}</label>
                <input
                  type="password"
                  style={{ padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 10, width: '100%' }}
                  name="senha"
                  required={!usuarioEditando}
                />
              </div>

              {erro && <div className="form-erro">{erro}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
