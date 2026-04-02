import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'
import { getMetadataBase } from '@/lib/seo/build-metadata'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

type Props = {
  children: ReactNode
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="no" className="light" suppressHydrationWarning>
      <head>
        {/* Material Symbols — not available via next/font */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} min-h-dvh bg-background font-body text-on-background antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
