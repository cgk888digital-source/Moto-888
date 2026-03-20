import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'MotoVerse — El mundo completo de tu moto',
  description: 'Mantenimiento AI, comunidad, marketplace y seguridad para motociclistas venezolanos',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MotoVerse',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* iOS Safari PWA */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MotoVerse" />
        {/* MS Tile */}
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
      </head>
      <body>
        {children}
        {/* Registro del Service Worker */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {})
              })
            }
          `}
        </Script>
      </body>
    </html>
  )
}
