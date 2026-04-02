import type { SupabaseClient } from '@supabase/supabase-js'

export type PostAuthAccountHref = '/min-konto' | '/bli-hjelper/fullfor-profil'

/**
 * After sign-in (or email confirmation), sellers without a `providers` row go to onboarding.
 */
export async function resolveAccountHrefAfterAuth(
  supabase: SupabaseClient,
  userId: string,
): Promise<PostAuthAccountHref> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', userId)
    .maybeSingle()

  if (profile?.role !== 'seller') {
    return '/min-konto'
  }

  const { data: existing } = await supabase
    .from('providers')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle()

  if (existing) {
    return '/min-konto'
  }

  return '/bli-hjelper/fullfor-profil'
}
