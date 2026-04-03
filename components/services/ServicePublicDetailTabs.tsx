'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useState } from 'react'
import { BankIdVerifiedBadge } from '@/components/providers/BankIdVerifiedBadge'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import type { ServiceFaqItem } from '@/lib/provider-services/types'

export type ServicePageReviewRow = {
  id: string
  rating: number
  comment: string | null
  dateLabel: string
  reviewerName: string
}

type TabId = 'about' | 'reviews' | 'faq'

type Props = {
  providerId: string
  hasFaq: boolean
  serviceDescription: string | null
  providerBio: string | null
  isVerified: boolean
  locationName: string | null
  totalBookings: number
  reviews: ServicePageReviewRow[]
  faqItems: ServiceFaqItem[]
}

export function ServicePublicDetailTabs({
  providerId,
  hasFaq,
  serviceDescription,
  providerBio,
  isVerified,
  locationName,
  totalBookings,
  reviews,
  faqItems,
}: Props) {
  const t = useTranslations('publicService')
  const tabs: { id: TabId; label: string }[] = [
    { id: 'about', label: t('tabAbout') },
    { id: 'reviews', label: t('tabReviews') },
    ...(hasFaq ? [{ id: 'faq' as const, label: t('tabFaq') }] : []),
  ]

  const [active, setActive] = useState<TabId>('about')

  return (
    <div className="mt-12">
      <div
        role="tablist"
        aria-label={t('tabsAria')}
        className="flex flex-wrap gap-1 border-b border-outline-variant/25"
      >
        {tabs.map((tab) => {
          const selected = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`service-tab-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`relative -mb-px px-4 py-3 text-sm font-semibold transition-colors ${
                selected
                  ? 'text-on-surface after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="pt-8">
        {active === 'about' ? (
          <div
            role="tabpanel"
            aria-labelledby="service-tab-about"
            className="space-y-10"
          >
            {serviceDescription ? (
              <section>
                <h2 className="font-headline text-xl font-bold text-on-surface">{t('aboutHeading')}</h2>
                <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-on-surface-variant">
                  {serviceDescription}
                </p>
              </section>
            ) : null}

            {providerBio ? (
              <section>
                <h2 className="font-headline text-xl font-bold text-on-surface">{t('providerBioHeading')}</h2>
                <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-on-surface-variant">
                  {providerBio}
                </p>
              </section>
            ) : null}

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <section>
                <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">
                  {t('overviewHeading')}
                </h3>
                <ul className="mt-4 space-y-4">
                  {locationName ? (
                    <li className="flex gap-3">
                      <MaterialIcon
                        name="location_on"
                        className="mt-0.5 shrink-0 text-xl text-on-surface-variant/80"
                      />
                      <span className="text-on-surface">{locationName}</span>
                    </li>
                  ) : null}
                  {isVerified ? (
                    <li className="flex items-center gap-3">
                      <BankIdVerifiedBadge label={t('bankIdVerified')} showText className="mt-0.5" />
                    </li>
                  ) : null}
                  {totalBookings > 0 ? (
                    <li className="flex gap-3">
                      <MaterialIcon
                        name="workspace_premium"
                        className="mt-0.5 shrink-0 text-xl text-on-surface-variant/80"
                      />
                      <span className="text-on-surface">
                        {t('overviewBookings', { count: totalBookings })}
                      </span>
                    </li>
                  ) : null}
                  <li className="flex gap-3">
                    <MaterialIcon
                      name="person"
                      className="mt-0.5 shrink-0 text-xl text-on-surface-variant/80"
                    />
                    <Link
                      href={`/hjelpere/${providerId}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {t('overviewProfileLink')}
                    </Link>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">
                  {t('paymentHeading')}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                  {t('paymentBody')}
                </p>
              </section>
            </div>
          </div>
        ) : null}

        {active === 'reviews' ? (
          <div role="tabpanel" aria-labelledby="service-tab-reviews">
            {reviews.length === 0 ? (
              <p className="text-on-surface-variant">{t('reviewsEmpty')}</p>
            ) : (
              <ul className="space-y-5">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-headline font-semibold text-on-surface">
                        {r.reviewerName}
                      </span>
                      <span className="text-xs text-on-surface-variant">{r.dateLabel}</span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-0.5 text-amber-500" aria-hidden>
                      {Array.from({ length: 5 }, (_, i) => (
                        <MaterialIcon
                          key={i}
                          name="star"
                          filled={i < r.rating}
                          className="text-base"
                        />
                      ))}
                    </div>
                    {r.comment ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                        {r.comment}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {active === 'faq' && hasFaq ? (
          <div role="tabpanel" aria-labelledby="service-tab-faq">
            <dl className="space-y-6">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm"
                >
                  <dt className="font-headline font-semibold text-on-surface">{item.q}</dt>
                  <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  )
}
