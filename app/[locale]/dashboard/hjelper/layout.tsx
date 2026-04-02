import type { ReactNode } from 'react'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HjelperDashboardSegmentLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  const locale = await getLocale()

  if (!ctx?.isSeller) {
    return redirect({ href: '/dashboard/kunde', locale })
  }

  return children
}
