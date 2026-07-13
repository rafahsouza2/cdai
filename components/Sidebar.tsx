'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

interface NavItem {
  href: string
  label: string
  exact?: boolean
  adminOnly?: boolean
  icon: ReactNode
}

interface NavGroup {
  section: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    section: 'Geral',
    items: [
      {
        href: '/dashboard',
        label: 'Visão geral',
        exact: true,
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Faturamento',
    items: [
      {
        href: '/dashboard/producao',
        label: 'Produção e cobrança',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        ),
      },
      {
        href: '/dashboard/pendencias',
        label: 'Pendências',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      },
      {
        href: '/dashboard/glosas',
        label: 'Glosas',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" /><line x1="14.5" y1="9.5" x2="9.5" y2="14.5" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Configurações',
    items: [
      {
        href: '/dashboard/usuarios',
        label: 'Usuários',
        adminOnly: true,
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
]

interface SidebarProps {
  userName: string
  userRole: string
  userInitials: string
}

function labelPapel(role: string): string {
  if (role === 'admin') return 'Admin'
  if (role === 'faturista') return 'Faturista'
  return 'Gestor'
}

export default function Sidebar({ userName, userRole, userInitials }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="side">
      <div className="side-brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="14" r="6" fill="#f0e2ea" />
          <circle cx="16" cy="10" r="4.2" fill="#9fb882" />
        </svg>
        <div>
          <div className="side-brand-word">CDAI</div>
          <div className="side-brand-sub">Gestão</div>
        </div>
      </div>

      {NAV.map(group => {
        const items = group.items.filter(item => !item.adminOnly || userRole === 'admin')
        if (items.length === 0) return null
        return (
          <div className="side-group" key={group.section}>
            <div className="side-group-label">{group.section}</div>
            {items.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} className={`side-item${active ? ' active' : ''}`}>
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>
        )
      })}

      <div className="side-foot">
        <div className="side-avatar">{userInitials}</div>
        <div>
          <div className="side-foot-name">{userName}</div>
          <div className="side-foot-role">{labelPapel(userRole)}</div>
        </div>
        <button className="side-logout" onClick={handleSair} aria-label="Sair" title="Sair">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
