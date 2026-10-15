import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SKM Questionnaire - Survei Kepuasan Masyarakat',
  description: 'Citizen satisfaction survey for public service feedback',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
