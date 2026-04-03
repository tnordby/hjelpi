'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { startStripeConnectOnboardingAction, type StripeConnectState } from '@/lib/stripe/connect-actions'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { hjBtnPrimary } from '@/lib/button-classes'

const initial: StripeConnectState = {}

type Props = {
  stripeOnboarded: boolean
  hasStripeAccount: boolean
  /** Onboarding form submitted to Stripe; payouts not enabled yet (under review) */
  stripeAwaitingApproval: boolean
  stripeConfigured: boolean
}

export function SellerStripeConnectCard({
  stripeOnboarded,
  hasStripeAccount,
  stripeAwaitingApproval,
  stripeConfigured,
}: Props) {
  const t = useTranslations('dashboard.stripeConnect')
  const [state, formAction, pending] = useActionState(startStripeConnectOnboardingAction, initial)

  return (
    <section
      id="stripe-connect"
      className="rounded-2xl border border-outline-variant/25 bg-white p-6 shadow-sm ring-1 ring-outline-variant/10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-headline text-lg font-bold text-on-surface">{t('title')}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{t('body')}</p>
          {stripeOnboarded ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <MaterialIcon name="check_circle" className="text-xl filled" />
              {t('statusReady')}
            </p>
          ) : stripeAwaitingApproval ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-900">
              <MaterialIcon name="hourglass_top" className="text-xl" />
              {t('statusPendingReview')}
            </p>
          ) : hasStripeAccount ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-tertiary">
              <MaterialIcon name="schedule" className="text-xl" />
              {t('statusIncomplete')}
            </p>
          ) : (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-on-surface-variant">
              <MaterialIcon name="payments" className="text-xl" />
              {t('statusNotStarted')}
            </p>
          )}
        </div>
      </div>

      {!stripeConfigured ? (
        <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          {t('notConfiguredDev')}
        </p>
      ) : (
        <form action={formAction} className="mt-6">
          {state?.error ? (
            <p className="mb-4 rounded-xl bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className={hjBtnPrimary}
          >
            <MaterialIcon name="open_in_new" className="text-lg" />
            {stripeOnboarded ? t('ctaManage') : t('ctaStart')}
          </button>
        </form>
      )}
    </section>
  )
}
