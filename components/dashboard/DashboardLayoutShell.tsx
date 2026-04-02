'use client'

import type { ReactNode } from 'react'
import { usePathname } from '@/i18n/routing'
import { DashboardModeSwitcher } from '@/components/dashboard/DashboardModeSwitcher'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

type Props = {
  dbActiveMode: 'buyer' | 'seller'
  isSeller: boolean
  children: ReactNode
}

function navVariantFromPath(pathname: string, dbActive: 'buyer' | 'seller'): 'kunde' | 'hjelper' {
  if (pathname.includes('/dashboard/hjelper')) return 'hjelper'
  if (pathname.includes('/dashboard/kunde')) return 'kunde'
  return dbActive === 'seller' ? 'hjelper' : 'kunde'
}

export function DashboardLayoutShell({ dbActiveMode, isSeller, children }: Props) {
  const pathname = usePathname()
  const variant = navVariantFromPath(pathname, dbActiveMode)

  return (
    <div className="min-h-dvh bg-background pb-16 pt-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:gap-10">
        <div className="flex w-full flex-col gap-6 md:w-60 md:shrink-0">
          <DashboardModeSwitcher dbActiveMode={dbActiveMode} isSeller={isSeller} />
          <DashboardNav variant={variant} />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
