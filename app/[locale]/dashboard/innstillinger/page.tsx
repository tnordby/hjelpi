import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { SignOutForm } from '@/components/auth/SignOutForm'
import { loadDashboardUserContext } from '@/lib/dashboard/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.meta' })
  return {
    title: t('settingsTitle'),
    description: t('settingsDescription'),
  }
}

export default async function DashboardInnstillingerPage() {
  const t = await getTranslations('dashboard.settingsPage')
  const tAccount = await getTranslations('auth.account')
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const ctx = await loadDashboardUserContext(supabase, user.id, user.email ?? '')
  if (!ctx) return null

  const publicProfileHref = ctx.providerId ? `/hjelpere/${ctx.providerId}` : null

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
          {t('title')}
        </h1>
        <p className="mt-2 text-on-surface-variant">{t('subtitle')}</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            href="/min-konto"
            className="flex h-full flex-col rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
          >
            <span className="font-headline font-bold text-on-surface">{t('linkAccount')}</span>
            <span className="mt-1 text-sm text-on-surface-variant">{t('linkAccountDesc')}</span>
          </Link>
        </li>
        <li>
          <Link
            href="/glemt-passord"
            className="flex h-full flex-col rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
          >
            <span className="font-headline font-bold text-on-surface">{t('linkPassword')}</span>
            <span className="mt-1 text-sm text-on-surface-variant">{t('linkPasswordDesc')}</span>
          </Link>
        </li>
        {!ctx.isSeller ? (
          <li>
            <Link
              href="/bli-hjelper"
              className="flex h-full flex-col rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
            >
              <span className="font-headline font-bold text-on-surface">{t('linkBecomeSeller')}</span>
              <span className="mt-1 text-sm text-on-surface-variant">
                {t('linkBecomeSellerDesc')}
              </span>
            </Link>
          </li>
        ) : null}
        {publicProfileHref ? (
          <li>
            <Link
              href={publicProfileHref}
              className="flex h-full flex-col rounded-2xl bg-surface-container-lowest p-5 shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:ring-primary/25"
            >
              <span className="font-headline font-bold text-on-surface">{t('linkPublicProfile')}</span>
              <span className="mt-1 text-sm text-on-surface-variant">
                {t('linkPublicProfileDesc')}
              </span>
            </Link>
          </li>
        ) : null}
      </ul>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/40 px-5 py-6">
        <h2 className="font-headline text-lg font-bold text-on-surface">{t('sessionTitle')}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{t('sessionHint')}</p>
        <div className="mt-4">
          <SignOutForm
            label={tAccount('signOut')}
            className="inline-flex rounded-full border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
          />
        </div>
      </section>

      <section className="rounded-2xl bg-primary/5 px-5 py-5">
        <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
          {t('comingTitle')}
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-on-surface-variant">
          <li>{t('comingItem1')}</li>
          <li>{t('comingItem2')}</li>
          <li>{t('comingItem3')}</li>
          <li>{t('comingItem4')}</li>
        </ul>
      </section>
    </div>
  )
}
