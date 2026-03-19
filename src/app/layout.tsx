import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MotoSafe — Tu moto, protegida',
  description: 'Gestiona el mantenimiento de tu moto con inteligencia artificial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
