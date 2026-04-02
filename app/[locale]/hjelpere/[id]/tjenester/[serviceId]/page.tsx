import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Link } from '@/i18n/routing'
import { ServiceBookingPanel } from '@/components/bookings/ServiceBookingPanel'
import { formatServicePriceLong } from '@/lib/provider-services/display'
import { fetchPublicProviderServiceById } from '@/lib/provider-services/data'
import { profileDisplayName } from '@/lib/profiles/display-name'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withPageSeo } from '@/lib/seo/build-metadata'

type Props = { params: Promise<{ locale: string; id: string; serviceId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id, serviceId } = await params
  const t = await getTranslations({ locale, namespace: 'publicService' })
  const supabase = await createSupabaseServerClient()
  const service = await fetchPublicProviderServiceById(supabase, id, serviceId)
  if (!service) {
    return withPageSeo(
      {
        title: t('metaNotFoundTitle'),
        description: t('metaNotFoundDescription'),
      },
      {
        locale,
        pathSegments: ['hjelpere', id, 'tjenester', serviceId],
        indexable: false,
      },
    )
  }
  const { data: prov } = await supabase
    .from('providers')
    .select('profiles ( first_name, last_name )')
    .eq('id', id)
    .maybeSingle()

  let helperName = 'Hjelper'
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
      pathSegments: ['hjelpere', id, 'tjenester', serviceId],
      keywords: [service.title, helperName, 'lokale tjenester', 'Hjelpi'],
    },
  )
}

export default async function HjelperServiceDetailPage({ params }: Props) {
  const { id, serviceId } = await params
  const supabase = await createSupabaseServerClient()
  const service = await fetchPublicProviderServiceById(supabase, id, serviceId)
  if (!service) notFound()

  const { data: prov, error: pErr } = await supabase
    .from('providers')
    .select(
      `
      id,
      profile_id,
      profiles ( first_name, last_name, deleted_at )
    `,
    )
    .eq('id', id)
    .maybeSingle()

  if (pErr || !prov) notFound()

  const rawProf = prov.profiles
  const profile = Array.isArray(rawProf) ? rawProf[0] : rawProf
  const publicName = profileDisplayName(
    profile && typeof profile === 'object' && 'first_name' in profile
      ? (profile.first_name as string | null)
      : null,
    profile && typeof profile === 'object' && 'last_name' in profile
      ? (profile.last_name as string | null)
      : null,
  )

  if (
    !profile ||
    typeof profile !== 'object' ||
    publicName.length === 0 ||
    ('deleted_at' in profile && profile.deleted_at != null)
  ) {
    notFound()
  }

  const t = await getTranslations('publicService')
  const priceLine = formatServicePriceLong(service.basePriceOre, service.pricingType)

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
  const loginNextPath = `/hjelpere/${id}/tjenester/${serviceId}`

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-lowest pb-20 pt-[var(--hj-navbar-height)]">
        <div className="mx-auto max-w-3xl px-6">
          <nav className="py-4 text-sm text-on-surface-variant">
            <Link href={`/hjelpere/${id}`} className="font-medium text-primary hover:underline">
              ← {publicName}
            </Link>
          </nav>

          <article className="rounded-3xl border border-outline-variant/30 bg-white p-8 shadow-sm md:p-10">
            {service.subcategoryLabel ? (
              <p className="text-sm font-medium text-on-surface-variant">{service.subcategoryLabel}</p>
            ) : null}
            <h1 className="mt-2 font-headline text-3xl font-extrabold text-primary md:text-4xl">
              {service.title}
            </h1>
            <p className="mt-4 text-lg font-semibold text-on-surface">{priceLine}</p>

            {service.searchTags.length > 0 ? (
              <div className="mt-6">
                <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">
                  {t('tagsHeading')}
                </h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {service.searchTags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 text-sm text-on-surface sm:grid-cols-2">
              {service.pricingType !== 'quote' && service.deliveryDays != null ? (
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{t('deliveryHeading')}</p>
                  <p className="mt-1 font-medium text-on-surface">{t('deliveryDays', { days: service.deliveryDays })}</p>
                </div>
              ) : null}
              <div
                className={`rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 px-4 py-3 ${
                  service.pricingType === 'quote' || service.deliveryDays == null ? 'sm:col-span-2' : ''
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{t('revisionsHeading')}</p>
                <p className="mt-1 font-medium text-on-surface">
                  {service.revisionsIncluded > 0
                    ? t('revisionsIncluded', { count: service.revisionsIncluded })
                    : t('revisionsNone')}
                </p>
              </div>
            </div>

            {service.description ? (
              <div className="mt-8 border-t border-outline-variant/20 pt-8">
                <h2 className="font-headline text-lg font-bold text-on-surface">{t('aboutHeading')}</h2>
                <p className="mt-3 whitespace-pre-wrap text-on-surface">{service.description}</p>
              </div>
            ) : null}

            {service.faq.length > 0 ? (
              <div className="mt-8 border-t border-outline-variant/20 pt-8">
                <h2 className="font-headline text-lg font-bold text-on-surface">{t('faqHeading')}</h2>
                <dl className="mt-4 space-y-4">
                  {service.faq.map((item, i) => (
                    <div key={i}>
                      <dt className="font-semibold text-on-surface">{item.q}</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-on-surface-variant">{item.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <ServiceBookingPanel
              providerId={id}
              serviceId={serviceId}
              pricingType={service.pricingType}
              basePriceOre={service.basePriceOre}
              loginNextPath={loginNextPath}
              isAuthenticated={Boolean(user)}
              isOwnService={isOwnService}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  )
}
