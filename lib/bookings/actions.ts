'use server'

import { revalidatePath } from 'next/cache'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { computeBaseAmountOre } from '@/lib/bookings/compute-base'
import { createBookingRequestSchema } from '@/lib/bookings/schemas'
import { createBookingCheckoutSession } from '@/lib/stripe/booking-checkout'
import { platformFeesFromBaseOre } from '@/lib/stripe/fees'
import { refreshProviderStripeOnboardedIfReady } from '@/lib/stripe/refresh-connect-status'
import { getStripe } from '@/lib/stripe/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type CreateBookingActionState = {
  error?: string
  checkoutUrl?: string
}

type ProviderJoin = {
  profile_id: string
  stripe_account_id: string | null
  stripe_onboarded: boolean
}

type ServiceRow = {
  id: string
  title: string
  pricing_type: string
  base_price_ore: number | null
  cancellation_policy_id: string | null
  provider_id: string
  providers: ProviderJoin | ProviderJoin[] | null
}

export async function createBookingRequestAction(
  _prev: CreateBookingActionState | undefined,
  formData: FormData,
): Promise<CreateBookingActionState | void> {
  const t = await getTranslations('publicService')
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('bookingErrors.notSignedIn') }
  }

  const { data: buyerProfile, error: bpErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (bpErr || !buyerProfile) {
    return { error: t('bookingErrors.noProfile') }
  }

  const buyerId = buyerProfile.id as string

  const parsed = createBookingRequestSchema.safeParse({
    provider_id: formData.get('provider_id'),
    provider_service_id: formData.get('provider_service_id'),
    scheduled_at: formData.get('scheduled_at'),
    duration_minutes: formData.get('duration_minutes'),
    buyer_message: formData.get('buyer_message'),
    pricing_type: formData.get('pricing_type'),
  })

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message
    if (msg === 'scheduled_invalid') return { error: t('bookingErrors.scheduledInvalid') }
    if (msg === 'scheduled_past') return { error: t('bookingErrors.scheduledPast') }
    if (msg === 'duration_required') return { error: t('bookingErrors.durationRequired') }
    if (msg === 'duration_invalid') return { error: t('bookingErrors.durationInvalid') }
    if (msg === 'message_short') return { error: t('bookingErrors.messageShort') }
    return { error: t('bookingErrors.invalid') }
  }

  const { provider_id, provider_service_id, scheduled_at, duration_minutes, buyer_message, pricing_type } =
    parsed.data

  const { data: svc, error: svcErr } = await supabase
    .from('provider_services')
    .select(
      `
      id,
      title,
      pricing_type,
      base_price_ore,
      cancellation_policy_id,
      provider_id,
      providers ( profile_id, stripe_account_id, stripe_onboarded )
    `,
    )
    .eq('id', provider_service_id)
    .eq('provider_id', provider_id)
    .eq('is_active', true)
    .maybeSingle()

  if (svcErr || !svc) {
    return { error: t('bookingErrors.serviceUnavailable') }
  }

  const row = svc as ServiceRow
  if (row.pricing_type !== pricing_type) {
    return { error: t('bookingErrors.invalid') }
  }

  const rawProv = row.providers
  const prov = Array.isArray(rawProv) ? rawProv[0] : rawProv
  const sellerProfileId =
    prov && typeof prov === 'object' && 'profile_id' in prov && typeof prov.profile_id === 'string'
      ? prov.profile_id
      : null

  if (!sellerProfileId) {
    return { error: t('bookingErrors.serviceUnavailable') }
  }

  if (sellerProfileId === buyerId) {
    return { error: t('bookingErrors.selfBooking') }
  }

  const baseOre = computeBaseAmountOre(
    pricing_type,
    row.base_price_ore,
    duration_minutes ?? null,
  )
  if (baseOre === null) {
    return { error: t('bookingErrors.priceMissing') }
  }

  const amounts = platformFeesFromBaseOre(baseOre)

  const payNow = pricing_type === 'fixed' || pricing_type === 'hourly'
  if (payNow) {
    let stripeAccountId =
      prov && typeof prov === 'object' && 'stripe_account_id' in prov
        ? (prov.stripe_account_id as string | null)
        : null
    let onboarded =
      prov && typeof prov === 'object' && 'stripe_onboarded' in prov
        ? Boolean(prov.stripe_onboarded)
        : false

    const stripe = getStripe()
    if (stripe && stripeAccountId && !onboarded) {
      try {
        const nowReady = await refreshProviderStripeOnboardedIfReady(stripe, stripeAccountId)
        if (nowReady) onboarded = true
      } catch (e) {
        console.warn('[booking] stripe connect refresh failed', e)
      }
    }

    if (!stripeAccountId || !onboarded) {
      return { error: t('bookingErrors.sellerPayoutsNotReady') }
    }
  }

  const scheduledIso = new Date(scheduled_at).toISOString()

  const insertPayload: Record<string, unknown> = {
    buyer_id: buyerId,
    provider_service_id: row.id,
    cancellation_policy_id: row.cancellation_policy_id,
    status: 'pending',
    scheduled_at: scheduledIso,
    duration_minutes: pricing_type === 'hourly' ? duration_minutes ?? null : null,
    total_amount_ore: amounts.total_amount_ore,
    base_amount_ore: amounts.base_amount_ore,
    buyer_fee_ore: amounts.buyer_fee_ore,
    seller_fee_ore: amounts.seller_fee_ore,
    buyer_message: buyer_message.length > 0 ? buyer_message : null,
  }

  const { data: inserted, error: insErr } = await supabase
    .from('bookings')
    .insert(insertPayload)
    .select('id')
    .maybeSingle()

  if (insErr || !inserted?.id) {
    return { error: t('bookingErrors.saveFailed') }
  }

  const bookingId = inserted.id as string
  const locale = await getLocale()

  if (payNow) {
    const stripe = getStripe()
    if (!stripe) {
      await supabase.from('bookings').delete().eq('id', bookingId)
      return { error: t('bookingErrors.stripeNotConfigured') }
    }

    const stripeAccountId = (prov as ProviderJoin).stripe_account_id as string

    try {
      const session = await createBookingCheckoutSession(stripe, {
        bookingId,
        serviceTitle: row.title,
        amounts,
        connectedAccountId: stripeAccountId,
        customerEmail: user.email ?? null,
        locale,
      })
      const url = session.url
      if (!url) {
        await supabase.from('bookings').delete().eq('id', bookingId)
        return { error: t('bookingErrors.checkoutFailed') }
      }
      revalidatePath(`/${locale}/min-side/kunde/bestillinger`)
      revalidatePath(`/${locale}/min-side/hjelper/foresporsler`)
      return { checkoutUrl: url }
    } catch {
      await supabase.from('bookings').delete().eq('id', bookingId)
      return { error: t('bookingErrors.checkoutFailed') }
    }
  }

  revalidatePath(`/${locale}/min-side/kunde/bestillinger`)
  revalidatePath(`/${locale}/min-side/hjelper/foresporsler`)

  redirect({ href: '/min-side/kunde/bestillinger?forespurt=1', locale })
}
