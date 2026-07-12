import type { Metadata } from 'next'
import { Lora, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const lora = Lora({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' })
const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-ui' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-data' })

export const metadata: Metadata = {
  title: 'CDAI · Intranet',
  description: 'Sistema interno de gestão de produção e cobrança — CDAI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={`${lora.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
