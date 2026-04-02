import type { SupabaseClient } from '@supabase/supabase-js'

export type PostAuthAccountHref = '/min-side' | '/bli-hjelper/fullfor-profil' | '/min-konto'

/**
 * After sign-in (or email confirmation), sellers without a `providers` row go to onboarding.
 * Everyone else goes to the dashboard entry (which routes to buyer or seller views).
 * If there is no profile row yet, send users to `/min-konto` so they do not hit the dashboard
 * layout (which would redirect to login when `loadDashboardUserContext` fails).
 */
export async function resolveAccountHrefAfterAuth(
  supabase: SupabaseClient,
  userId: string,
): Promise<PostAuthAccountHref> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !profile) {
    return '/min-konto'
  }

  if (profile.role !== 'seller') {
    return '/min-side'
  }

  const { data: existing } = await supabase
    .from('providers')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle()

  if (existing) {
    return '/min-side'
  }

  return '/bli-hjelper/fullfor-profil'
}
