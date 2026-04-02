import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardRootRedirectPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) {
    return redirect({ href: '/logg-inn', locale })
  }

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) {
    return redirect({ href: '/min-konto', locale })
  }

  if (ctx.isSeller && ctx.activeMode === 'seller') {
    return redirect({ href: '/min-side/hjelper', locale })
  }

  return redirect({ href: '/min-side/kunde', locale })
}
