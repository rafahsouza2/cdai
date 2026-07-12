'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavTabsProps {
  userRole: string
}

const TABS = [
  { href: '/dashboard', label: '📊 Visão Geral', exact: true },
  { href: '/dashboard/producao', label: '💳 Produção e Cobrança' },
  { href: '/dashboard/pendencias', label: '📋 Pendências' },
  { href: '/dashboard/usuarios', label: '👥 Usuários', adminOnly: true },
]

export default function NavTabs({ userRole }: NavTabsProps) {
  const pathname = usePathname()

  return (
    <div className="nav-tabs">
      {TABS.filter(t => !t.adminOnly || userRole === 'admin').map(tab => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link key={tab.href} href={tab.href} className={`nav-tab${active ? ' active' : ''}`}>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
