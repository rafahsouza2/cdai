import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CDAI · Intranet',
  description: 'Sistema interno de gestão de produção e cobrança — CDAI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  )
}
