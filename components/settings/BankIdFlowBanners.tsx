import { getTranslations } from 'next-intl/server'

const bannerClass = 'rounded-2xl px-4 py-3 text-sm'

type Props = {
  bankid?: string
  bankidReason?: string
}

/** Result / error messages after BankID OIDC redirect (Signicat). */
export async function BankIdFlowBanners({ bankid: bankidQuery, bankidReason }: Props) {
  if (!bankidQuery) return null

  const t = await getTranslations('dashboard.settingsPage.bankId.banners')

  return (
    <div className="flex flex-col gap-3">
      {bankidQuery === 'verified' ? (
        <p className={`${bannerClass} border border-primary/25 bg-primary/8 text-on-surface`} role="status">
          {t('verified')}
        </p>
      ) : null}
      {bankidQuery === 'cancelled' ? (
        <p
          className={`${bannerClass} border border-outline-variant/30 bg-surface-container-low text-on-surface-variant`}
          role="status"
        >
          {t('cancelled')}
        </p>
      ) : null}
      {bankidQuery === 'already' ? (
        <p
          className={`${bannerClass} border border-outline-variant/30 bg-surface-container-low text-on-surface-variant`}
          role="status"
        >
          {t('already')}
        </p>
      ) : null}
      {bankidQuery === 'notSeller' || bankidQuery === 'noProvider' ? (
        <p className={`${bannerClass} border border-amber-200 bg-amber-50 text-amber-950`} role="status">
          {t('needProvider')}
        </p>
      ) : null}
      {bankidQuery === 'config' ? (
        <p className={`${bannerClass} border border-amber-200 bg-amber-50 text-amber-950`} role="status">
          {t('config')}
        </p>
      ) : null}
      {bankidQuery === 'state' ||
      bankidQuery === 'token' ||
      bankidQuery === 'session' ||
      bankidQuery === 'profile' ? (
        <p className={`${bannerClass} border border-amber-200 bg-amber-50 text-amber-950`} role="status">
          {t('failed')}
        </p>
      ) : null}
      {bankidQuery === 'db' ? (
        <p className={`${bannerClass} border border-amber-200 bg-amber-50 text-amber-950`} role="status">
          {t('db')}
        </p>
      ) : null}
      {bankidQuery === 'error' ? (
        <p className={`${bannerClass} border border-amber-200 bg-amber-50 text-amber-950`} role="status">
          {bankidReason ? t('oidcError', { reason: bankidReason }) : t('failed')}
        </p>
      ) : null}
    </div>
  )
}
