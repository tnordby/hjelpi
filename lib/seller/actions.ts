'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog-server-capture'
import { promoteBuyerToSeller } from '@/lib/seller/promote-buyer'
import { completeSellerProfileSchema } from '@/lib/seller/schemas'

export type SellerOnboardingState = {
  error?: string
}

/**
 * Logged-in users who are not full sellers yet: promote buyer → seller if needed,
 * then send them to hjelper onboarding or the hjelper dashboard.
 * Used by the nav «Selg tjenester» control so buyers skip the marketing landing.
 */
export async function startSellerOnboardingAction() {
  const locale = await getLocale()

  if (!isSupabaseConfigured()) {
    redirect({ href: '/min-side/kunde', locale })
    return
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/logg-inn', locale })
    return
  }

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) {
    redirect({ href: '/min-konto', locale })
    return
  }

  if (ctx.providerId) {
    await supabase.from('profiles').update({ active_mode: 'seller' }).eq('user_id', user.id)
    captureServerEvent(user.email ?? user.id, 'seller_mode_activated_existing_provider', {
      provider_id: ctx.providerId,
    })
    redirect({ href: '/min-side/hjelper', locale })
    return
  }

  if (ctx.role === 'seller') {
    captureServerEvent(user.email ?? user.id, 'seller_onboarding_resumed')
    redirect({ href: '/bli-hjelper/fullfor-profil', locale })
    return
  }

  if (ctx.role === 'buyer') {
    const promoted = await promoteBuyerToSeller(supabase, user.id)
    if (!promoted.ok) {
      captureServerEvent(user.email ?? user.id, 'seller_promotion_failed', {
        code: promoted.code,
      })
      redirect({ href: '/min-konto', locale })
      return
    }
    captureServerEvent(user.email ?? user.id, 'buyer_promoted_to_seller')
    redirect({ href: '/bli-hjelper/fullfor-profil', locale })
    return
  }

  redirect({ href: '/min-side/kunde', locale })
}

export async function completeSellerProviderAction(
  _prev: SellerOnboardingState | undefined,
  formData: FormData,
): Promise<SellerOnboardingState | void> {
  const t = await getTranslations('sellerOnboarding.errors')

  if (!isSupabaseConfigured()) {
    return { error: t('notConfigured') }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('notSignedIn') }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return { error: t('profileMissing') }
  }

  if (profile.role !== 'seller') {
    return { error: t('notSeller') }
  }

  const { data: existing } = await supabase
    .from('providers')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle()

  if (existing) {
    const locale = await getLocale()
    redirect({ href: '/min-side', locale })
  }

  const locRaw = formData.get('location_id')
  const locationId =
    typeof locRaw === 'string' && locRaw.length > 0 ? locRaw : undefined

  const parsed = completeSellerProfileSchema.safeParse({
    bio: formData.get('bio'),
    service_radius_km: formData.get('service_radius_km'),
    location_id: locationId,
  })

  if (!parsed.success) {
    return { error: t('invalidFields') }
  }

  const { bio, service_radius_km, location_id } = parsed.data

  const { error: insertError } = await supabase.from('providers').insert({
    profile_id: profile.id,
    bio: bio.length > 0 ? bio : null,
    service_radius_km,
    location_id: location_id ?? null,
  })

  if (insertError) {
    captureServerEvent(user.email ?? user.id, 'seller_profile_completion_failed')
    return { error: t('saveFailed') }
  }

  captureServerEvent(user.email ?? user.id, 'seller_profile_completed_server')
  const locale = await getLocale()
  redirect({ href: '/min-side', locale })
}
