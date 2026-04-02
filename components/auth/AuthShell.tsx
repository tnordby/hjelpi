import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

type Props = {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export async function AuthShell({ children, title, subtitle }: Props) {
  const t = await getTranslations('auth')
  const tNav = await getTranslations('nav')

  return (
    <div className="min-h-screen bg-background px-6 py-16 pt-28">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-headline text-2xl font-black tracking-tighter text-primary"
          >
            {tNav('brand')}
          </Link>
          <Link
            href="/"
            className="mt-4 inline-flex text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            ← {t('backToHome')}
          </Link>
        </div>
        <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-ambient md:p-10">
          <h1
            className={`font-headline text-2xl font-extrabold tracking-tight text-primary md:text-3xl ${subtitle ? 'mb-2' : 'mb-8'}`}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mb-8 text-on-surface-variant">{subtitle}</p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}
