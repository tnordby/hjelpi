import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Schibsted_Grotesk, Instrument_Sans } from 'next/font/google'
import './globals.css'
import { getMetadataBase } from '@/lib/seo/build-metadata'

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
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
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0&display=swap"
        />
      </head>
      <body
        className={`${schibstedGrotesk.variable} ${instrumentSans.variable} min-h-dvh bg-background font-body text-on-background antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
