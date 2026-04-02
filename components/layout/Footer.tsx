import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

export async function Footer() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-surface py-12 text-left font-body text-sm tracking-wide text-on-surface-variant">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-4 lg:items-start lg:gap-x-8 lg:gap-y-10">
        <div className="min-w-0 lg:max-w-md lg:justify-self-start">
          <p className="mb-4 font-headline text-2xl font-bold text-primary">
            {tNav('brand')}
          </p>
          <p className="mb-6 max-w-xs text-on-surface-variant">{t('tagline')}</p>
          <div className="flex space-x-4">
            <span className="text-on-surface-variant/60">
              <MaterialIcon name="language" className="text-2xl" />
            </span>
          </div>
        </div>
        <div className="min-w-0 lg:justify-self-start">
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface">
            {t('services')}
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                href="/tjenester"
                className="text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {t('links.allServices')}
              </Link>
            </li>
            <li>
              <Link
                href="/fotografi"
                className="text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {t('links.photography')}
              </Link>
            </li>
            <li>
              <Link
                href="/dyrepass"
                className="text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {t('links.dogSitting')}
              </Link>
            </li>
            <li>
              <Link
                href="/underholdning"
                className="text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {t('links.entertainment')}
              </Link>
            </li>
            <li>
              <Link
                href="/smareparasjoner"
                className="text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {t('links.homeService')}
              </Link>
            </li>
          </ul>
        </div>
        <div className="min-w-0 lg:justify-self-start">
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface">
            {t('company')}
          </h4>
          <ul className="space-y-4">
            <li>
              <span className="text-on-surface-variant">{t('links.about')}</span>
            </li>
            <li>
              <span className="text-on-surface-variant">{t('links.security')}</span>
            </li>
            <li>
              <Link
                href="/vilkar"
                className="text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {t('links.terms')}
              </Link>
            </li>
            <li>
              <Link
                href="/personvern"
                className="text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {t('links.privacy')}
              </Link>
            </li>
          </ul>
        </div>
        <div className="min-w-0 lg:justify-self-end lg:text-right">
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface">
            {t('support')}
          </h4>
          <ul className="space-y-4">
            <li>
              <span className="text-on-surface-variant">{t('links.contact')}</span>
            </li>
            <li>
              <span className="text-on-surface-variant">{t('links.help')}</span>
            </li>
            <li>
              <span className="text-on-surface-variant">{t('links.press')}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-12 w-full bg-surface-container-low px-6 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="shrink-0 text-on-surface-variant">{t('copyright', { year })}</p>
          <div className="flex shrink-0 flex-wrap gap-6 sm:justify-end">
            <span className="flex items-center gap-2 text-on-surface-variant/70">
              <MaterialIcon name="lock" className="text-sm filled" />
              {t('safePayment')}
            </span>
            <span className="flex items-center gap-2 text-on-surface-variant/70">
              <MaterialIcon name="verified" className="text-sm filled" />
              {t('bankId')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
