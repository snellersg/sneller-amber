import type { Metadata, Viewport } from 'next'
import { Roboto, Lato } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import SiteHeader from '@/components/SiteHeader'
import './globals.css'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AMBER',
  description: 'Sneller Snow & Grounds sheets, docs, and process guides',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/logo192.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: { title: 'AMBER', statusBarStyle: 'default', capable: true },
}

export const viewport: Viewport = {
  themeColor: '#0A94D5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${lato.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
