import { NavbarClient } from '@/components/layout/NavbarClient'
import type { NavbarUserMenuProps } from '@/components/layout/NavbarUserMenu'
import {
  fetchNavbarNotificationCounts,
  loadDashboardUserContext,
  type NavbarNotificationCounts,
} from '@/lib/dashboard/data'
import { profileDisplayName } from '@/lib/profiles/display-name'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function dashboardHomePath(
  ctx: Awaited<ReturnType<typeof loadDashboardUserContext>>,
): '/min-side/kunde' | '/min-side/hjelper' {
  if (ctx && ctx.isSeller && ctx.activeMode === 'seller') {
    return '/min-side/hjelper'
  }
  return '/min-side/kunde'
}

export async function Navbar() {
  let isLoggedIn = false
  let userMenu: NavbarUserMenuProps | null = null
  let notificationCounts: NavbarNotificationCounts | null = null
  let modeToggle: { isSeller: boolean } | null = null
  let dashboardHomeHref: '/min-side/kunde' | '/min-side/hjelper' | null = null

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      isLoggedIn = true
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle()

      const avatarRaw = profile?.avatar_url
      userMenu = {
        avatarUrl: typeof avatarRaw === 'string' && avatarRaw.length > 0 ? avatarRaw : null,
        fullName: profileDisplayName(profile?.first_name, profile?.last_name),
        email: user.email ?? '',
      }

      const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
      if (ctx) {
        notificationCounts = await fetchNavbarNotificationCounts(supabase, ctx)
      }
      modeToggle = { isSeller: ctx?.isSeller ?? false }
      dashboardHomeHref = dashboardHomePath(ctx)
    }
  }

  return (
    <NavbarClient
      isLoggedIn={isLoggedIn}
      userMenu={userMenu}
      notificationCounts={notificationCounts}
      modeToggle={modeToggle}
      dashboardHomeHref={dashboardHomeHref}
    />
  )
}
