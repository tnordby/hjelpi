'use client'

import type { ReactNode } from 'react'
import { usePathname } from '@/i18n/routing'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

type Props = {
  dbActiveMode: 'buyer' | 'seller'
  children: ReactNode
}

function navVariantFromPath(pathname: string, dbActive: 'buyer' | 'seller'): 'kunde' | 'hjelper' {
  if (pathname.includes('/min-side/hjelper')) return 'hjelper'
  if (pathname.includes('/min-side/kunde')) return 'kunde'
  return dbActive === 'seller' ? 'hjelper' : 'kunde'
}

export function DashboardLayoutShell({ dbActiveMode, children }: Props) {
  const pathname = usePathname()
  const variant = navVariantFromPath(pathname, dbActiveMode)

  return (
    <div className="min-h-dvh bg-background pb-16 pt-[var(--hj-navbar-height)]">
      <header className="sticky top-[var(--hj-navbar-height)] z-40 border-b border-outline-variant/25 bg-white/90 shadow-ambient-soft backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-2">
          <DashboardNav variant={variant} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8 md:py-10">{children}</main>
    </div>
  )
}
