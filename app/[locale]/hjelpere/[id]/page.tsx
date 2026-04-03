import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/i18n/routing'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BankIdVerifiedBadge } from '@/components/providers/BankIdVerifiedBadge'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { formatServicePriceLabel } from '@/lib/provider-services/display'
import { fetchPublicProviderServices } from '@/lib/provider-services/data'
import { profileDisplayName } from '@/lib/profiles/display-name'
import { providerLocationName } from '@/lib/providers/provider-location'
import { resolveRouteProviderId } from '@/lib/providers/resolve-route-provider-id'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withPageSeo } from '@/lib/seo/build-metadata'

type Props = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id: routeId } = await params
  const supabase = await createSupabaseServerClient()
  const providerId = await resolveRouteProviderId(supabase, routeId)
  const t = await getTranslations({ locale, namespace: 'publicHelperProfile' })

  if (!providerId) {
    return withPageSeo(
      { title: t('metaTitle', { name: t('displayNameFallback') }), description: t('metaDescription', { name: t('displayNameFallback') }) },
      { locale, pathSegments: ['hjelpere', routeId], indexable: false, keywords: ['Hjelpi'] },
    )
  }

  const { data } = await supabase
    .from('providers')
    .select('profiles!providers_profile_id_fkey(first_name, last_name)')
    .eq('id', providerId)
    .maybeSingle()
  let name = t('displayNameFallback')
  if (data?.profiles) {
    const p = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    if (p && typeof p === 'object') {
      const display = profileDisplayName(
        'first_name' in p ? (p.first_name as string | null) : null,
        'last_name' in p ? (p.last_name as string | null) : null,
      )
      if (display.length > 0) name = display
    }
  }

  return withPageSeo(
    {
      title: t('metaTitle', { name }),
      description: t('metaDescription', { name }),
    },
    {
      locale,
      pathSegments: ['hjelpere', providerId],
      keywords: [name, 'hjelper', 'lokale tjenester', 'Hjelpi'],
    },
  )
}

export default async function HjelperProfilePage({ params }: Props) {
  const { locale, id: routeId } = await params
  const supabase = await createSupabaseServerClient()
  const providerId = await resolveRouteProviderId(supabase, routeId)
  if (!providerId) notFound()
  if (providerId !== routeId) {
    redirect({ href: `/hjelpere/${providerId}`, locale })
  }

  const { data, error } = await supabase
    .from('providers')
    .select(
      `
      id,
      bio,
      avg_rating,
      total_reviews,
      is_verified,
      locations ( name ),
      profiles!providers_profile_id_fkey (first_name, last_name, avatar_url, deleted_at)
    `,
    )
    .eq('id', providerId)
    .maybeSingle()

  if (error || !data) notFound()

  const rawProfile = data.profiles
  const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile

  if (
    !profile ||
    typeof profile !== 'object' ||
    ('deleted_at' in profile && profile.deleted_at != null)
  ) {
    notFound()
  }

  const t = await getTranslations('publicHelperProfile')
  const publicName =
    profileDisplayName(
      'first_name' in profile ? (profile.first_name as string | null) : null,
      'last_name' in profile ? (profile.last_name as string | null) : null,
    ).trim() || t('displayNameFallback')

  const rating = data.avg_rating != null ? Number(data.avg_rating) : 0
  const locationName = providerLocationName(data.locations)
  const services = await fetchPublicProviderServices(supabase, providerId)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest pb-20 pt-[var(--hj-navbar-height)]">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-3xl border border-outline-variant/30 bg-white p-8 shadow-sm md:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface-container-low sm:mx-0">
                {'avatar_url' in profile && profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                    width={112}
                    height={112}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-on-surface-variant/40">
                    <MaterialIcon name="person" className="text-5xl" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="font-headline text-3xl font-extrabold text-primary">{publicName}</h1>
                  {data.is_verified ? <BankIdVerifiedBadge label={t('bankIdVerified')} /> : null}
                </div>
                {locationName ? (
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-on-surface-variant sm:justify-start">
                    <MaterialIcon
                      name="location_on"
                      className="shrink-0 text-lg text-on-surface-variant/80"
                    />
                    <span>{locationName}</span>
                  </p>
                ) : null}
                {data.total_reviews > 0 ? (
                  <p className="mt-2 text-on-surface-variant">
                    {rating.toFixed(1)} av 5 · {data.total_reviews} vurderinger
                  </p>
                ) : null}
                {data.bio ? (
                  <p className="mt-4 whitespace-pre-wrap text-on-surface">{data.bio}</p>
                ) : (
                  <p className="mt-4 text-on-surface-variant">Ingen beskrivelse ennå.</p>
                )}
              </div>
            </div>
          </div>

          <section className="mt-10" aria-labelledby="helper-services-heading">
            <h2
              id="helper-services-heading"
              className="font-headline text-xl font-bold text-on-surface md:text-2xl"
            >
              {t('servicesTitle')}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t('servicesSubtitle')}</p>
            {services.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-outline-variant/50 bg-white/80 px-6 py-10 text-center text-on-surface-variant">
                {t('servicesEmpty')}
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {services.map((svc) => {
                  const price = formatServicePriceLabel(svc.basePriceOre, svc.pricingType)
                  return (
                    <li key={svc.id}>
                      <Link
                        href={`/hjelpere/${providerId}/tjenester/${svc.id}`}
                        className="group flex items-start justify-between gap-4 rounded-2xl border border-outline-variant/30 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
                      >
                        <div className="min-w-0">
                          <p className="font-headline text-lg font-bold text-on-surface group-hover:text-primary">
                            {svc.title}
                          </p>
                          {svc.subcategoryLabel ? (
                            <p className="mt-0.5 text-sm text-on-surface-variant">{svc.subcategoryLabel}</p>
                          ) : null}
                          {price ? (
                            <p className="mt-2 text-sm font-semibold text-primary">{price}</p>
                          ) : null}
                        </div>
                        <MaterialIcon
                          name="chevron_right"
                          className="mt-1 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
