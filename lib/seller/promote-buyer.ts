import type { SupabaseClient } from '@supabase/supabase-js'

export type PromoteBuyerResult =
  | { ok: true }
  | { ok: false; code: 'no_profile' | 'update_failed' }

/**
 * Sets `profiles.role` to seller for buyers so they can complete `providers` onboarding.
 * No-op if already seller or admin.
 */
export async function promoteBuyerToSeller(
  supabase: SupabaseClient,
  userId: string,
): Promise<PromoteBuyerResult> {
  const { data: profile, error: fetchErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchErr || !profile) {
    return { ok: false, code: 'no_profile' }
  }

  const role = profile.role as string
  if (role === 'seller' || role === 'admin') {
    return { ok: true }
  }

  if (role !== 'buyer') {
    return { ok: true }
  }

  const { error: upErr } = await supabase
    .from('profiles')
    .update({ role: 'seller', active_mode: 'seller' })
    .eq('user_id', userId)

  if (upErr) {
    return { ok: false, code: 'update_failed' }
  }

  return { ok: true }
}
