import { NavbarClient } from '@/components/layout/NavbarClient'
import type { NavbarUserMenuProps } from '@/components/layout/NavbarUserMenu'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function Navbar() {
  let isLoggedIn = false
  let userMenu: NavbarUserMenuProps | null = null

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      isLoggedIn = true
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle()

      const avatarRaw = profile?.avatar_url
      userMenu = {
        avatarUrl: typeof avatarRaw === 'string' && avatarRaw.length > 0 ? avatarRaw : null,
        fullName: typeof profile?.full_name === 'string' ? profile.full_name.trim() : '',
        email: user.email ?? '',
      }
    }
  }

  return <NavbarClient isLoggedIn={isLoggedIn} userMenu={userMenu} />
}
