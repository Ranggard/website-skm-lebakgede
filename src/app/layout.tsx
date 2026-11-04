import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Survei Kepuasan Masyarakat - Kelurahan Lebakgede',
  description: 'Survei Kepuasan Masyarakat - Kelurahan Lebakgede, Kecamatan Coblong, Kota Bandung',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Grand+Hotel&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full min-h-screen">{children}</body>
    </html>
  )
}
