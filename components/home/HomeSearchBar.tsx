'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { FormEvent, useState } from 'react'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { cn } from '@/lib/utils'
import posthog from 'posthog-js'

const POPULAR_TAGS = ['photographer', 'dogSitting', 'moveClean'] as const

type Layout = 'hero' | 'default'

export function HomeSearchBar({ layout = 'default' }: { layout?: Layout }) {
  const t = useTranslations('home.hero')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const hero = layout === 'hero'

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    posthog.capture('search_submitted', { query: q, layout })
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`)
      return
    }
    router.push('/tjenester')
  }

  return (
    <div className={cn('group relative w-full', hero ? 'max-w-2xl' : 'max-w-xl')}>
      <form
        onSubmit={onSubmit}
        className={cn(
          'flex items-center gap-1 rounded-full border bg-white p-1.5 pl-4 shadow-sm transition-shadow focus-within:border-primary/40 focus-within:shadow-md md:pl-5',
          hero ? 'border-outline-variant/80 pr-1.5' : 'border-outline-variant/60',
        )}
      >
        {!hero ? (
          <MaterialIcon name="search" className="ml-1 shrink-0 text-primary" />
        ) : null}
        <input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent py-2.5 text-base text-on-surface placeholder:text-on-surface-variant/55 focus:outline-none focus:ring-0 md:py-3 md:text-[1.05rem]"
          placeholder={t('searchPlaceholder')}
          type="search"
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label={t('searchSubmitAria')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-transform hover:scale-[1.02] active:scale-[0.98] md:h-12 md:w-12"
        >
          <MaterialIcon name="search" className="text-[22px] md:text-2xl" />
        </button>
      </form>
      <div
        className={cn(
          'mt-5 flex flex-wrap items-center gap-2',
          hero && 'justify-center',
        )}
      >
        <span className="text-sm text-on-surface-variant">{t('popularLabel')}</span>
        {POPULAR_TAGS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              const tag = t(`popularTags.${key}`)
              setQuery(tag)
              posthog.capture('popular_tag_clicked', { tag, key })
            }}
            className="rounded-full border border-outline-variant/70 bg-white px-3.5 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:border-primary/50 hover:text-primary md:text-sm"
          >
            {t(`popularTags.${key}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
