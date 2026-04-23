import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'
import InstallPrompt from '@/components/InstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevPulse',
  description: 'Your AI developer dashboard',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DevPulse',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/icons/icon-192.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}