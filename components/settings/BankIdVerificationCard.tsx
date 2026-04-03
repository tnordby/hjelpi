import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { BankIdVerifiedBadge } from '@/components/providers/BankIdVerifiedBadge'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'

type Props = {
  locale: string
  configured: boolean
  isVerified: boolean
  /** Key names only (no values); shown when Signicat is not configured. */
  signicatMissingEnvNames?: string[]
}

export async function BankIdVerificationCard({
  locale,
  configured,
  isVerified,
  signicatMissingEnvNames = [],
}: Props) {
  const t = await getTranslations({ locale, namespace: 'dashboard.settingsPage.bankId' })

  return (
    <section
      className={cn(
        'rounded-2xl p-6 shadow-sm ring-1 md:p-8',
        isVerified
          ? 'border border-primary/30 bg-gradient-to-br from-primary/12 to-primary/5 ring-primary/20'
          : 'border border-outline-variant/30 bg-surface-container-lowest ring-outline-variant/15',
      )}
      aria-labelledby="bankid-verification-heading"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
              isVerified ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant',
            )}
            aria-hidden
          >
            <MaterialIcon
              name={isVerified ? 'verified_user' : 'badge'}
              className={cn('text-3xl', isVerified && 'filled')}
            />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-bold uppercase tracking-wide',
                isVerified ? 'text-primary' : 'text-on-surface-variant',
              )}
            >
              {isVerified ? t('statusVerifiedTitle') : t('statusPendingTitle')}
            </p>
            <h2 id="bankid-verification-heading" className="font-headline mt-1 text-xl font-extrabold tracking-tight text-on-surface md:text-2xl">
              {t('title')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{t('subtitle')}</p>

            {!configured ? (
              <div className="mt-4 space-y-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                <p>{t('notConfigured')}</p>
                {signicatMissingEnvNames.length > 0 ? (
                  <p className="font-mono text-xs text-on-surface-variant/90">
                    {t('notConfiguredMissingKeys', { keys: signicatMissingEnvNames.join(', ') })}
                  </p>
                ) : null}
              </div>
            ) : null}

            {configured && isVerified ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <BankIdVerifiedBadge label={t('badgeLabel')} showText />
                <span className="text-sm text-on-surface-variant">{t('verifiedHint')}</span>
              </div>
            ) : null}
          </div>
        </div>

        {configured && !isVerified ? (
          <div className="flex w-full shrink-0 flex-col md:max-w-xs md:pt-1">
            <Link
              href="/bankid/start"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              <MaterialIcon name="fingerprint" className="mr-2 text-lg" />
              {t('cta')}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
