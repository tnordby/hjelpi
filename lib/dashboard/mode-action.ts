'use server'

import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Persists `profiles.active_mode` and sends the user to the matching dashboard.
 * Used by the main nav toggle (Kjøp / Selg) so «Min side» and /min-side stay in sync.
 */
export async function switchDashboardModeAction(formData: FormData) {
  const raw = formData.get('mode')
  const mode = raw === 'seller' ? 'seller' : 'buyer'

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = await getLocale()
    return redirect({ href: '/logg-inn', locale })
  }

  const locale = await getLocale()

  if (mode === 'seller') {
    const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
    if (!ctx?.isSeller) {
      return redirect({ href: '/min-side/hjelper', locale })
    }
  }

  await supabase.from('profiles').update({ active_mode: mode }).eq('user_id', user.id)

  if (mode === 'seller') {
    return redirect({ href: '/min-side/hjelper', locale })
  }
  return redirect({ href: '/min-side/kunde', locale })
}
