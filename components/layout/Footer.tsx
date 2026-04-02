import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

export async function Footer() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-surface py-12 font-body text-sm tracking-wide text-on-surface-variant">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-4">
        <div className="col-span-1">
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
        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface">
            {t('services')}
          </h4>
          <ul className="space-y-4">
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
        <div>
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
        <div>
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
      <div className="mx-auto mt-12 max-w-7xl bg-surface-container-low px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-on-surface-variant">{t('copyright', { year })}</p>
          <div className="flex gap-6">
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
