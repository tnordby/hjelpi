'use server'

import { revalidatePath } from 'next/cache'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/routing'
import { computeBaseAmountOre } from '@/lib/bookings/compute-base'
import { createBookingRequestSchema } from '@/lib/bookings/schemas'
import { platformFeesFromBaseOre } from '@/lib/stripe/fees'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type CreateBookingActionState = {
  error?: string
}

type ServiceRow = {
  id: string
  pricing_type: string
  base_price_ore: number | null
  cancellation_policy_id: string | null
  provider_id: string
  providers: { profile_id: string } | { profile_id: string }[] | null
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
      pricing_type,
      base_price_ore,
      cancellation_policy_id,
      provider_id,
      providers ( profile_id )
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

  const { error: insErr } = await supabase.from('bookings').insert(insertPayload)

  if (insErr) {
    return { error: t('bookingErrors.saveFailed') }
  }

  const locale = await getLocale()
  revalidatePath(`/${locale}/min-side/kunde/bestillinger`)
  revalidatePath(`/${locale}/min-side/hjelper/foresporsler`)

  redirect({ href: '/min-side/kunde/bestillinger?forespurt=1', locale })
}
