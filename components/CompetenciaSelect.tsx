'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { Competencia } from '@/lib/data'

interface CompetenciaSelectProps {
  competencias: Competencia[]
  selecionadaId: string
}

export default function CompetenciaSelect({ competencias, selecionadaId }: CompetenciaSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (competencias.length === 0) return null

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('competencia', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select className="select-input" style={{ maxWidth: 220 }} value={selecionadaId} onChange={onChange}>
      {competencias.map(c => (
        <option key={c.id} value={c.id}>{c.label}</option>
      ))}
    </select>
  )
}
