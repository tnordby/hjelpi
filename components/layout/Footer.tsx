import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

const SERVICE_LINKS = [
  { href: '/byer', key: 'allCities' },
  { href: '/tjenester', key: 'allServices' },
  { href: '/fotografi', key: 'photography' },
  { href: '/dyrepass', key: 'dogSitting' },
  { href: '/underholdning', key: 'entertainment' },
  { href: '/smareparasjoner', key: 'homeService' },
] as const

const footerLink =
  'text-primary-fixed/80 underline-offset-4 transition-colors hover:text-on-primary hover:underline'

export async function Footer() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-primary pt-16 text-left font-body text-sm text-primary-fixed/80">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-14 lg:grid-cols-4 lg:items-start lg:gap-x-8 lg:gap-y-10">
        <div className="min-w-0 lg:max-w-md lg:justify-self-start">
          <p className="mb-4 font-headline text-3xl font-bold tracking-tight text-on-primary">
            {tNav('brand')}
          </p>
          <p className="mb-6 max-w-xs leading-relaxed text-primary-fixed/80">
            {t('tagline')}
          </p>
          <div className="flex space-x-4">
            <span className="text-primary-fixed/50">
              <MaterialIcon name="language" className="text-2xl" />
            </span>
          </div>
        </div>
        <div className="min-w-0 lg:justify-self-start">
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-primary">
            {t('services')}
          </h4>
          <ul className="space-y-4">
            {SERVICE_LINKS.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className={footerLink}>
                  {t(`links.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 lg:justify-self-start">
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-primary">
            {t('company')}
          </h4>
          <ul className="space-y-4">
            <li>
              <span className="text-primary-fixed/60">{t('links.about')}</span>
            </li>
            <li>
              <span className="text-primary-fixed/60">{t('links.security')}</span>
            </li>
            <li>
              <Link href="/vilkar" className={footerLink}>
                {t('links.terms')}
              </Link>
            </li>
            <li>
              <Link href="/personvern" className={footerLink}>
                {t('links.privacy')}
              </Link>
            </li>
          </ul>
        </div>
        <div className="min-w-0 lg:justify-self-end lg:text-right">
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-primary">
            {t('support')}
          </h4>
          <ul className="space-y-4">
            <li>
              <span className="text-primary-fixed/60">{t('links.contact')}</span>
            </li>
            <li>
              <span className="text-primary-fixed/60">{t('links.help')}</span>
            </li>
            <li>
              <span className="text-primary-fixed/60">{t('links.press')}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full bg-black/20 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="shrink-0 text-primary-fixed/70">{t('copyright', { year })}</p>
          <div className="flex shrink-0 flex-wrap gap-6 sm:justify-end">
            <span className="flex items-center gap-2 text-primary-fixed/70">
              <MaterialIcon name="lock" className="filled text-sm" />
              {t('safePayment')}
            </span>
            <span className="flex items-center gap-2 text-primary-fixed/70">
              <MaterialIcon name="verified" className="filled text-sm" />
              {t('bankId')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
