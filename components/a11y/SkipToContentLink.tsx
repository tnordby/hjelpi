'use client'

import { useTranslations } from 'next-intl'

const linkClass =
  'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-on-primary focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary'

export function SkipToContentLink() {
  const t = useTranslations('a11y')

  return (
    <a
      href="#main-content"
      className={linkClass}
      onClick={(e) => {
        e.preventDefault()
        const el = document.getElementById('main-content')
        if (!el) return
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.setTimeout(() => {
          try {
            el.focus({ preventScroll: true })
          } catch {
            el.focus()
          }
        }, 0)
      }}
    >
      {t('skipToContent')}
    </a>
  )
}
