'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { getStripe } from '@/lib/stripe/server'
import { absoluteAppUrl } from '@/lib/url/app-base'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type StripeConnectState = {
  error?: string
}

export async function startStripeConnectOnboardingAction(
  _prev: StripeConnectState | void,
  _formData: FormData,
): Promise<StripeConnectState | void> {
  const tErr = await getTranslations('dashboard.stripeConnect.errors')
  const stripe = getStripe()
  if (!stripe) {
    return { error: tErr('notConfigured') }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: tErr('notSignedIn') }
  }

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx?.providerId) {
    return { error: tErr('noProvider') }
  }

  const { data: prov, error: pErr } = await supabase
    .from('providers')
    .select('id, stripe_account_id, stripe_onboarded')
    .eq('id', ctx.providerId)
    .maybeSingle()

  if (pErr || !prov) {
    return { error: tErr('noProvider') }
  }

  let accountId =
    typeof prov.stripe_account_id === 'string' && prov.stripe_account_id.length > 0
      ? prov.stripe_account_id
      : null

  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'NO',
        email: user.email ?? undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          hjelpi_provider_id: ctx.providerId,
          hjelpi_profile_id: ctx.profileId,
        },
      })
      accountId = account.id

      const { error: upErr } = await supabase
        .from('providers')
        .update({ stripe_account_id: accountId })
        .eq('id', ctx.providerId)

      if (upErr) {
        return { error: tErr('saveFailed') }
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: tErr('stripeApi', { message }) }
  }

  const locale = await getLocale()
  const returnUrl = absoluteAppUrl(locale, '/min-side/innstillinger?stripe_connect=return')
  const refreshUrl = absoluteAppUrl(locale, '/min-side/innstillinger?stripe_connect=refresh')

  const onboarded = Boolean(prov.stripe_onboarded)
  let accountLinkUrl: string
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId!,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: onboarded ? 'account_update' : 'account_onboarding',
    })
    accountLinkUrl = accountLink.url
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: tErr('stripeApi', { message }) }
  }

  revalidatePath(`/${locale}/min-side/innstillinger`)
  redirect(accountLinkUrl)
}
