'use server'

import { revalidatePath } from 'next/cache'
import { getLocale, getTranslations } from 'next-intl/server'
import { isMarketplaceSubcategory } from '@/lib/categories/marketplace-subcategory-keys'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { fetchFlexibleCancellationPolicyId } from '@/lib/provider-services/data'
import {
  normalizeFaqFromUnknown,
  parseFaqJsonFromForm,
  parseSearchTagsFromForm,
  serviceBasePriceOreFromInput,
  upsertProviderServiceSchema,
} from '@/lib/provider-services/schemas'
import { ensureProviderCanPublishServices } from '@/lib/provider-services/stripe-services-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ZodIssue } from 'zod'

export type ProviderServiceActionState = {
  error?: string
  ok?: boolean
}

async function requireSellerContext() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { supabase, ctx: null as Awaited<ReturnType<typeof loadDashboardUserContext>>, tKey: 'notSignedIn' as const }
  }
  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx?.providerId) {
    return { supabase, ctx: null, tKey: 'noProvider' as const }
  }
  return { supabase, ctx, tKey: null as null }
}

function translateUpsertIssue(
  t: Awaited<ReturnType<typeof getTranslations>>,
  issues: ZodIssue[],
): string {
  for (const issue of issues) {
    const msg = issue.message
    switch (msg) {
      case 'title_short':
      case 'title_long':
      case 'title_chars':
      case 'description_short':
      case 'description_long':
      case 'subcategory_invalid':
      case 'price_invalid':
      case 'delivery_required':
        return t(msg)
      default:
        break
    }
    const path0 = issue.path[0]
    if (path0 === 'faq') {
      return t('faq_invalid')
    }
    if (path0 === 'search_tags') {
      return t('tags_invalid')
    }
  }
  return t('invalid')
}

async function revalidateSubcategoryMarketplacePage(
  locale: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  subcategoryId: string,
) {
  const { data: subMeta } = await supabase
    .from('subcategories')
    .select('slug, categories ( slug )')
    .eq('id', subcategoryId)
    .maybeSingle()
  if (!subMeta) return
  const sm = subMeta as {
    slug?: string
    categories?: { slug?: string } | { slug?: string }[] | null
  }
  const subSlug = typeof sm.slug === 'string' ? sm.slug : ''
  const catRaw = sm.categories
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw
  const categorySlug = cat && typeof cat === 'object' && typeof cat.slug === 'string' ? cat.slug : ''
  if (categorySlug && subSlug) {
    revalidatePath(`/${locale}/${categorySlug}/${subSlug}`, 'page')
  }
}

export async function upsertProviderServiceAction(
  _prev: ProviderServiceActionState | undefined,
  formData: FormData,
): Promise<ProviderServiceActionState> {
  const t = await getTranslations('dashboard.sellerServices.errors')
  try {
    return await runUpsertProviderService(t, formData)
  } catch (e) {
    console.error('[upsertProviderServiceAction]', e)
    return { error: t('saveFailed') }
  }
}

async function runUpsertProviderService(
  t: Awaited<ReturnType<typeof getTranslations>>,
  formData: FormData,
): Promise<ProviderServiceActionState> {
  const { supabase, ctx, tKey } = await requireSellerContext()
  if (tKey) return { error: t(tKey) }
  if (!ctx) return { error: t('notSignedIn') }
  if (!ctx.providerId) return { error: t('noProvider') }

  const paymentsGate = await ensureProviderCanPublishServices(supabase, ctx.providerId)
  if (!paymentsGate.ok) {
    return { error: t('paymentsNotReady') }
  }

  const idRaw = formData.get('id')
  const id = typeof idRaw === 'string' && idRaw.length > 0 ? idRaw : undefined

  const faq = normalizeFaqFromUnknown(parseFaqJsonFromForm(formData))
  const search_tags = parseSearchTagsFromForm(formData)

  const parsed = upsertProviderServiceSchema.safeParse({
    id,
    title: formData.get('title'),
    description: formData.get('description'),
    subcategory_id: formData.get('subcategory_id'),
    pricing_type: formData.get('pricing_type'),
    price_kr: formData.get('price_kr'),
    is_active: formData.get('is_active') === 'true',
    search_tags,
    delivery_days: formData.get('delivery_days'),
    revisions_included: formData.get('revisions_included'),
    faq,
  })

  if (!parsed.success) {
    return { error: translateUpsertIssue(t, parsed.error.issues) }
  }

  const {
    title,
    description,
    subcategory_id: subcategoryIdParsed,
    pricing_type,
    is_active,
    search_tags: tags,
    delivery_days,
    revisions_included,
    faq: faqOut,
  } = parsed.data
  const subcategory_id = subcategoryIdParsed

  const { data: subMeta, error: subMetaErr } = await supabase
    .from('subcategories')
    .select('slug, categories ( slug )')
    .eq('id', subcategory_id)
    .maybeSingle()

  if (subMetaErr || !subMeta) {
    return { error: t('subcategory_invalid') }
  }

  const sm = subMeta as {
    slug?: string
    categories?: { slug?: string } | { slug?: string }[] | null
  }
  const subSlug = typeof sm.slug === 'string' ? sm.slug : ''
  const catRaw = sm.categories
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw
  const categorySlug = cat && typeof cat === 'object' && typeof cat.slug === 'string' ? cat.slug : ''
  if (!subSlug || !categorySlug || !isMarketplaceSubcategory(categorySlug, subSlug)) {
    return { error: t('subcategory_not_on_site') }
  }

  const base_price_ore = serviceBasePriceOreFromInput(pricing_type, formData.get('price_kr'))

  if (pricing_type !== 'quote' && base_price_ore == null) {
    return { error: t('price_invalid') }
  }

  let cancellation_policy_id: string | null = null
  if (!id) {
    cancellation_policy_id = await fetchFlexibleCancellationPolicyId(supabase)
    if (!cancellation_policy_id) {
      return { error: t('policyMissing') }
    }
  }

  const payload = {
    title,
    description: description.length > 0 ? description : null,
    subcategory_id,
    pricing_type,
    base_price_ore,
    is_active,
    search_tags: tags,
    delivery_days,
    revisions_included,
    faq: faqOut,
  }

  if (id) {
    const { data: existing, error: exErr } = await supabase
      .from('provider_services')
      .select('id, provider_id, cancellation_policy_id, subcategory_id')
      .eq('id', id)
      .maybeSingle()

    if (exErr || !existing || (existing as { provider_id: string }).provider_id !== ctx.providerId) {
      return { error: t('notFound') }
    }

    const previousSubcategoryId = (existing as { subcategory_id: string }).subcategory_id

    const { error } = await supabase
      .from('provider_services')
      .update(payload)
      .eq('id', id)
      .eq('provider_id', ctx.providerId)

    if (error) {
      console.error('[provider_services update]', error.message, error.code, error.details)
      return { error: t('saveFailed') }
    }

    const locale = await getLocale()
    await revalidateSubcategoryMarketplacePage(locale, supabase, subcategory_id)
    if (previousSubcategoryId !== subcategory_id) {
      await revalidateSubcategoryMarketplacePage(locale, supabase, previousSubcategoryId)
    }
    revalidatePath(`/${locale}/min-side/hjelper/tjenester`)
    revalidatePath(`/${locale}/min-side/hjelper`)
    revalidatePath(`/${locale}/hjelpere/${ctx.providerId}`)
    revalidatePath(`/${locale}/hjelpere/${ctx.providerId}/tjenester/${id}`)
    return { ok: true }
  }

  const { error } = await supabase.from('provider_services').insert({
    provider_id: ctx.providerId,
    cancellation_policy_id,
    ...payload,
  })

  if (error) {
    console.error('[provider_services insert]', error.message, error.code, error.details)
    return { error: t('saveFailed') }
  }

  const locale = await getLocale()
  await revalidateSubcategoryMarketplacePage(locale, supabase, subcategory_id)
  revalidatePath(`/${locale}/min-side/hjelper/tjenester`)
  revalidatePath(`/${locale}/min-side/hjelper`)
  revalidatePath(`/${locale}/hjelpere/${ctx.providerId}`)
  return { ok: true }
}

export async function deleteProviderServiceAction(
  _prev: ProviderServiceActionState | undefined,
  formData: FormData,
): Promise<ProviderServiceActionState> {
  const t = await getTranslations('dashboard.sellerServices.errors')
  try {
    return await runDeleteProviderService(t, formData)
  } catch (e) {
    console.error('[deleteProviderServiceAction]', e)
    return { error: t('saveFailed') }
  }
}

async function runDeleteProviderService(
  t: Awaited<ReturnType<typeof getTranslations>>,
  formData: FormData,
): Promise<ProviderServiceActionState> {
  const { supabase, ctx, tKey } = await requireSellerContext()
  if (tKey) return { error: t(tKey) }
  if (!ctx) return { error: t('notSignedIn') }

  const idRaw = formData.get('id')
  const id = typeof idRaw === 'string' ? idRaw : ''
  if (!id) return { error: t('invalid') }

  const { count, error: cErr } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('provider_service_id', id)

  if (cErr) return { error: t('saveFailed') }
  if ((count ?? 0) > 0) return { error: t('deleteHasBookings') }

  const { data: toDelete } = await supabase
    .from('provider_services')
    .select('subcategory_id')
    .eq('id', id)
    .eq('provider_id', ctx.providerId)
    .maybeSingle()

  const { error } = await supabase
    .from('provider_services')
    .delete()
    .eq('id', id)
    .eq('provider_id', ctx.providerId)

  if (error) {
    console.error('[provider_services delete]', error.message, error.code, error.details)
    return { error: t('saveFailed') }
  }

  const locale = await getLocale()
  const removedSubId =
    toDelete && typeof toDelete === 'object' && 'subcategory_id' in toDelete
      ? (toDelete as { subcategory_id: string }).subcategory_id
      : null
  if (removedSubId) {
    await revalidateSubcategoryMarketplacePage(locale, supabase, removedSubId)
  }
  revalidatePath(`/${locale}/min-side/hjelper/tjenester`)
  revalidatePath(`/${locale}/min-side/hjelper`)
  revalidatePath(`/${locale}/hjelpere/${ctx.providerId}`)
  revalidatePath(`/${locale}/hjelpere/${ctx.providerId}/tjenester/${id}`)
  return { ok: true }
}
