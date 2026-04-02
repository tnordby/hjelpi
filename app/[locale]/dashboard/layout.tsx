import type { ReactNode } from 'react'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { DashboardLayoutShell } from '@/components/dashboard/DashboardLayoutShell'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-28 text-center text-on-surface-variant">
          Dashbord er ikke tilgjengelig uten Supabase-konfigurasjon.
        </div>
        <Footer />
      </>
    )
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = await getLocale()
    return redirect({ href: '/logg-inn', locale })
  }

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) {
    const locale = await getLocale()
    return redirect({ href: '/logg-inn', locale })
  }

  return (
    <>
      <Navbar />
      <DashboardLayoutShell dbActiveMode={ctx.activeMode} isSeller={ctx.isSeller}>
        {children}
      </DashboardLayoutShell>
      <Footer />
    </>
  )
}
