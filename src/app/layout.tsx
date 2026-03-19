import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-noto-sans-thai',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Agent Dashboard — KikiTrades',
  description: 'ระบบควบคุม AI agents หลายตัวจาก dashboard เดียว',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="dark">
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
