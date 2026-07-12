'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

interface TopBarProps {
  userName: string
  userInitials: string
}

export default function TopBar({ userName, userInitials }: TopBarProps) {
  const router = useRouter()
  const [dataAtual, setDataAtual] = useState('')

  useEffect(() => {
    const s = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    setDataAtual(s.charAt(0).toUpperCase() + s.slice(1))
  }, [])

  async function handleSair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo-wrap">
          <svg width="26" height="26" viewBox="0 0 60 60">
            <ellipse cx="18" cy="50" rx="3" ry="9" fill="#B5C184" />
            <ellipse cx="18" cy="43" rx="6" ry="8" fill="#6B845E" />
            <circle cx="18" cy="30" r="12" fill="rgba(255,255,255,0.9)" />
            <circle cx="33" cy="38" r="4" fill="#9E8797" />
            <circle cx="41" cy="30" r="5.5" fill="#B4B19F" />
            <circle cx="50" cy="24" r="5" fill="#B5C184" />
            <circle cx="43" cy="15" r="6" fill="#B5C184" />
            <circle cx="54" cy="11" r="8" fill="#6D8661" />
          </svg>
        </div>
        <div>
          <div className="topbar-title">CDAI · Sistema de Gestão</div>
          <div className="topbar-sub">Controle de Produção e Cobrança</div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-date">{dataAtual}</div>
        <div className="avatar" title={userName}>{userInitials}</div>
        <button className="logout-btn" onClick={handleSair}>Sair</button>
      </div>
    </div>
  )
}
