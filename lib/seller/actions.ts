'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { completeSellerProfileSchema } from '@/lib/seller/schemas'

export type SellerOnboardingState = {
  error?: string
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
    redirect({ href: '/min-konto', locale })
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
    return { error: t('saveFailed') }
  }

  const locale = await getLocale()
  redirect({ href: '/min-konto', locale })
}
