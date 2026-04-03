import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { BankIdVerifiedBadge } from '@/components/providers/BankIdVerifiedBadge'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { ServiceShareButton } from '@/components/services/ServiceShareButton'

type Props = {
  locale: string
  providerId: string
  publicName: string
  avatarUrl: string | null
  isVerified: boolean
  locationName: string | null
  avgRating: number
  totalReviews: number
  shareUrl: string
  serviceTitle: string
}

export async function ServiceProviderProfileHero({
  locale,
  providerId,
  publicName,
  avatarUrl,
  isVerified,
  locationName,
  avgRating,
  totalReviews,
  shareUrl,
  serviceTitle,
}: Props) {
  const t = await getTranslations({ locale, namespace: 'publicService' })

  const shareText = t('shareServiceText', { serviceTitle, helperName: publicName })

  return (
    <div className="mb-10 border-b border-outline-variant/20 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <Link
          href={`/hjelpere/${providerId}`}
          className="relative mx-auto h-[7.5rem] w-[7.5rem] shrink-0 overflow-hidden rounded-full bg-surface-container-low ring-1 ring-black/[0.06] transition-opacity hover:opacity-95 sm:mx-0"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase / OAuth avatars
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              width={120}
              height={120}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-on-surface-variant/45">
              <MaterialIcon name="person" className="text-6xl" />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Link
              href={`/hjelpere/${providerId}`}
              className="inline-block font-headline text-2xl font-extrabold tracking-tight text-on-surface transition-colors hover:text-primary md:text-3xl"
            >
              {publicName}
            </Link>
            {isVerified ? <BankIdVerifiedBadge label={t('bankIdVerified')} /> : null}
          </div>

          {locationName ? (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-on-surface-variant sm:justify-start">
              <MaterialIcon name="location_on" className="shrink-0 text-lg text-on-surface-variant/80" />
              <span>{locationName}</span>
            </p>
          ) : null}

          {totalReviews > 0 ? (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="text-sm font-semibold text-primary">
                {t('ratingSummary', { rating: avgRating.toFixed(1) })}
              </span>
              <span className="inline-flex items-center gap-0.5 text-tertiary" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => (
                  <MaterialIcon
                    key={i}
                    name="star"
                    filled={i < Math.round(avgRating)}
                    className="text-lg"
                  />
                ))}
              </span>
              <span className="text-sm text-on-surface-variant">
                ({t('reviewCount', { count: totalReviews })})
              </span>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
            <ServiceShareButton
              url={shareUrl}
              title={serviceTitle}
              text={shareText}
            />
            <Link
              href={`/hjelpere/${providerId}`}
              className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
            >
              {t('sellerViewProfile')} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
