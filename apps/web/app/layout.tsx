import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Receipto — Deine Rechte. Dein Geld zurück.',
  description:
    'Receipto scannt Kassenbons, überwacht Garantiefristen (§437/§477 BGB) und erstellt rechtssichere Reklamationsschreiben für deutsche Verbraucher — automatisch per KI.',
  openGraph: {
    title: 'Receipto — Deine Rechte. Dein Geld zurück.',
    description:
      'KI-App für deutsche Verbraucher: Kassenbons scannen, Garantiefristen überwachen, Reklamationsschreiben per KI erstellen.',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
