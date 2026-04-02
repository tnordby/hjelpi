'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type ModeActionState = { error?: string }

export async function setDashboardActiveModeAction(
  _prev: ModeActionState | void,
  formData: FormData,
): Promise<ModeActionState | void> {
  const t = await getTranslations('dashboard.mode.errors')
  const raw = formData.get('mode')
  const mode = raw === 'seller' ? 'seller' : 'buyer'

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('notSignedIn') }
  }

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) {
    return { error: t('noProfile') }
  }

  if (mode === 'seller' && !ctx.isSeller) {
    return { error: t('notSeller') }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ active_mode: mode })
    .eq('user_id', user.id)

  if (error) {
    return { error: t('updateFailed') }
  }

  const locale = await getLocale()
  const href = mode === 'seller' ? '/dashboard/hjelper' : '/dashboard/kunde'
  redirect({ href, locale })
}
