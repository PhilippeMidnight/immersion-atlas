import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Immersion Atlas — Vision & Fonctionnalités',
  description: 'Atlas analyzes every interaction inside Immersion to understand buyers, support sales teams, and give developers a real-time strategic view of their projects.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Script
          src="https://app.scroll.ai/embed-expert/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
