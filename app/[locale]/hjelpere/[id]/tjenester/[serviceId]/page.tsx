import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { redirect } from '@/i18n/routing'
import { ServiceBookingPanel } from '@/components/bookings/ServiceBookingPanel'
import {
  ServiceBreadcrumbs,
  type BreadcrumbItem,
} from '@/components/categories/ServiceBreadcrumbs'
import { formatServicePriceLong } from '@/lib/provider-services/display'
import { fetchPublicProviderServiceById } from '@/lib/provider-services/data'
import { getCategoryBySlug, getSubcategory } from '@/lib/categories/taxonomy'
import { profileDisplayName } from '@/lib/profiles/display-name'
import { providerLocationName } from '@/lib/providers/provider-location'
import { resolveRouteProviderId } from '@/lib/providers/resolve-route-provider-id'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withPageSeo } from '@/lib/seo/build-metadata'
import { ServiceProviderProfileHero } from '@/components/services/ServiceProviderProfileHero'
import { ServicePublicDetailTabs } from '@/components/services/ServicePublicDetailTabs'
import { absoluteAppUrl } from '@/lib/url/app-base'

type Props = { params: Promise<{ locale: string; id: string; serviceId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id: routeId, serviceId } = await params
  const t = await getTranslations({ locale, namespace: 'publicService' })
  const supabase = await createSupabaseServerClient()
  const providerId = await resolveRouteProviderId(supabase, routeId)
  if (!providerId) {
    return withPageSeo(
      {
        title: t('metaNotFoundTitle'),
        description: t('metaNotFoundDescription'),
      },
      {
        locale,
        pathSegments: ['hjelpere', routeId, 'tjenester', serviceId],
        indexable: false,
      },
    )
  }

  const service = await fetchPublicProviderServiceById(supabase, providerId, serviceId)
  if (!service) {
    return withPageSeo(
      {
        title: t('metaNotFoundTitle'),
        description: t('metaNotFoundDescription'),
      },
      {
        locale,
        pathSegments: ['hjelpere', routeId, 'tjenester', serviceId],
        indexable: false,
      },
    )
  }
  const { data: prov } = await supabase
    .from('providers')
    .select('profiles!providers_profile_id_fkey ( first_name, last_name )')
    .eq('id', providerId)
    .maybeSingle()

  const th = await getTranslations({ locale, namespace: 'publicHelperProfile' })
  let helperName = th('displayNameFallback')
  const raw = prov?.profiles
  const prof = Array.isArray(raw) ? raw[0] : raw
  if (prof && typeof prof === 'object') {
    const n = profileDisplayName(
      'first_name' in prof ? (prof.first_name as string | null) : null,
      'last_name' in prof ? (prof.last_name as string | null) : null,
    )
    if (n.length > 0) helperName = n
  }

  const body = service.description?.trim() ?? ''
  const snippet =
    body.length > 0
      ? body.length > 120
        ? `${body.slice(0, 119).trimEnd()}…`
        : body
      : ''
  const description = snippet
    ? t('metaDescriptionWithBody', {
        serviceTitle: service.title,
        helperName,
        snippet,
      })
    : t('metaDescriptionFallback', {
        serviceTitle: service.title,
        helperName,
      })

  return withPageSeo(
    {
      title: t('metaTitle', {
        serviceTitle: service.title,
        helperName,
      }),
      description,
    },
    {
      locale,
      pathSegments: ['hjelpere', providerId, 'tjenester', serviceId],
      keywords: [service.title, helperName, 'lokale tjenester', 'Hjelpi'],
    },
  )
}

export default async function HjelperServiceDetailPage({ params }: Props) {
  const { locale, id: routeId, serviceId } = await params
  const supabase = await createSupabaseServerClient()
  const providerId = await resolveRouteProviderId(supabase, routeId)
  if (!providerId) notFound()
  if (providerId !== routeId) {
    redirect({ href: `/hjelpere/${providerId}/tjenester/${serviceId}`, locale })
  }

  const service = await fetchPublicProviderServiceById(supabase, providerId, serviceId)
  if (!service) notFound()

  const { data: prov, error: pErr } = await supabase
    .from('providers')
    .select(
      `
      id,
      profile_id,
      is_verified,
      bio,
      avg_rating,
      total_reviews,
      total_bookings,
      locations ( name ),
      profiles!providers_profile_id_fkey ( first_name, last_name, deleted_at, avatar_url )
    `,
    )
    .eq('id', providerId)
    .maybeSingle()

  if (pErr || !prov) notFound()

  const rawProf = prov.profiles
  const profile = Array.isArray(rawProf) ? rawProf[0] : rawProf

  if (!profile || typeof profile !== 'object' || ('deleted_at' in profile && profile.deleted_at != null)) {
    notFound()
  }

  const th = await getTranslations('publicHelperProfile')
  const publicName =
    profileDisplayName(
      'first_name' in profile ? (profile.first_name as string | null) : null,
      'last_name' in profile ? (profile.last_name as string | null) : null,
    ).trim() || th('displayNameFallback')

  const t = await getTranslations('publicService')
  const tSub = await getTranslations('subcategoryPage')
  const priceLine = formatServicePriceLong(service.basePriceOre, service.pricingType)

  const catSlug = service.marketplaceCategorySlug
  const subSlug = service.marketplaceSubcategorySlug
  const catName = service.marketplaceCategoryName
  const subName = service.marketplaceSubcategoryName

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tSub('breadcrumbHome'), href: '/' },
    { label: tSub('breadcrumbServices'), href: '/tjenester' },
  ]
  if (catName) {
    const catHref =
      catSlug && getCategoryBySlug(catSlug) ? `/${catSlug}` : undefined
    breadcrumbItems.push({ label: catName, href: catHref })
  }
  if (subName) {
    const subHref =
      catSlug && subSlug && getSubcategory(catSlug, subSlug)
        ? `/${catSlug}/${subSlug}`
        : undefined
    breadcrumbItems.push({ label: subName, href: subHref })
  }
  breadcrumbItems.push({ label: publicName })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let buyerProfileId: string | null = null
  if (user) {
    const { data: bp } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    buyerProfileId = bp && typeof (bp as { id?: string }).id === 'string' ? (bp as { id: string }).id : null
  }

  const sellerProfileId =
    typeof prov.profile_id === 'string' ? prov.profile_id : null
  const isOwnService =
    Boolean(buyerProfileId && sellerProfileId && buyerProfileId === sellerProfileId)
  const loginNextPath = `/hjelpere/${providerId}/tjenester/${serviceId}`
  const isVerified = Boolean(prov.is_verified)
  const avatarUrl =
    'avatar_url' in profile && typeof profile.avatar_url === 'string' ? profile.avatar_url : null
  const providerBio =
    typeof prov.bio === 'string' && prov.bio.trim().length > 0 ? prov.bio.trim() : null
  const avgRating =
    prov.avg_rating != null && !Number.isNaN(Number(prov.avg_rating)) ? Number(prov.avg_rating) : 0
  const totalReviews =
    typeof prov.total_reviews === 'number' && prov.total_reviews > 0 ? prov.total_reviews : 0
  const totalBookings =
    typeof prov.total_bookings === 'number' && prov.total_bookings > 0 ? prov.total_bookings : 0
  const locationName = providerLocationName(prov.locations)

  const { data: rawReviews } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      profiles!reviews_reviewer_id_fkey ( first_name, last_name, deleted_at )
    `,
    )
    .eq('provider_id', providerId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20)

  const dateFmt = new Intl.DateTimeFormat(locale === 'no' ? 'nb-NO' : locale, {
    dateStyle: 'medium',
  })
  const reviewRows =
    rawReviews?.map((row) => {
      const rp = row.profiles
      const prof = Array.isArray(rp) ? rp[0] : rp
      let reviewerName = 'Kunde'
      if (prof && typeof prof === 'object' && !('deleted_at' in prof && prof.deleted_at != null)) {
        const n = profileDisplayName(
          'first_name' in prof ? (prof.first_name as string | null) : null,
          'last_name' in prof ? (prof.last_name as string | null) : null,
        ).trim()
        if (n.length > 0) reviewerName = n
      }
      return {
        id: row.id as string,
        rating: Number(row.rating),
        comment: typeof row.comment === 'string' && row.comment.trim() ? row.comment.trim() : null,
        dateLabel: dateFmt.format(new Date(row.created_at as string)),
        reviewerName,
      }
    }) ?? []

  const shareUrl = absoluteAppUrl(locale, `/hjelpere/${providerId}/tjenester/${serviceId}`)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest pb-24 pt-[var(--hj-navbar-height)]">
        <div className="border-b border-outline-variant/15 bg-gradient-to-b from-primary/[0.06] via-surface-container-lowest to-surface-container-lowest">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ServiceBreadcrumbs items={breadcrumbItems} className="py-4" />

            <div className="grid gap-10 pb-10 lg:grid-cols-[1fr,minmax(288px,380px)] lg:items-start lg:gap-12">
              <div className="min-w-0">
                <ServiceProviderProfileHero
                  locale={locale}
                  providerId={providerId}
                  publicName={publicName}
                  avatarUrl={avatarUrl}
                  isVerified={isVerified}
                  locationName={locationName}
                  avgRating={avgRating}
                  totalReviews={totalReviews}
                  shareUrl={shareUrl}
                  serviceTitle={service.title}
                />

                {service.subcategoryLabel ? (
                  <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/90">
                    {service.subcategoryLabel}
                  </p>
                ) : null}
                <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
                  {service.title}
                </h1>

                {service.searchTags.length > 0 ? (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {service.searchTags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-outline-variant/30 bg-white px-3 py-1 text-sm font-medium text-on-surface shadow-sm"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {service.pricingType !== 'quote' && service.deliveryDays != null ? (
                    <div className="rounded-2xl border border-outline-variant/25 bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                        {t('deliveryHeading')}
                      </p>
                      <p className="mt-1 font-medium text-on-surface">
                        {t('deliveryDays', { days: service.deliveryDays })}
                      </p>
                    </div>
                  ) : null}
                  <div
                    className={`rounded-2xl border border-outline-variant/25 bg-white p-4 shadow-sm ${
                      service.pricingType === 'quote' || service.deliveryDays == null ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                      {t('revisionsHeading')}
                    </p>
                    <p className="mt-1 font-medium text-on-surface">
                      {service.revisionsIncluded > 0
                        ? t('revisionsIncluded', { count: service.revisionsIncluded })
                        : t('revisionsNone')}
                    </p>
                  </div>
                </div>

                <ServicePublicDetailTabs
                  providerId={providerId}
                  hasFaq={service.faq.length > 0}
                  serviceDescription={service.description?.trim() || null}
                  providerBio={providerBio}
                  isVerified={isVerified}
                  locationName={locationName}
                  totalBookings={totalBookings}
                  reviews={reviewRows}
                  faqItems={service.faq}
                />
              </div>

              <aside className="lg:sticky lg:top-[calc(var(--hj-navbar-height)+1.5rem)] lg:self-start">
                <div className="rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04]">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t('priceEyebrow')}
                  </p>
                  <p className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
                    {priceLine}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{t('priceHint')}</p>

                  <ServiceBookingPanel
                    providerId={providerId}
                    serviceId={serviceId}
                    pricingType={service.pricingType}
                    basePriceOre={service.basePriceOre}
                    loginNextPath={loginNextPath}
                    isAuthenticated={Boolean(user)}
                    isOwnService={isOwnService}
                    variant="embedded"
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
