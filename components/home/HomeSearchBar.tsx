'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { FormEvent, useState } from 'react'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

const POPULAR_TAGS = ['photographer', 'dogSitting', 'moveClean'] as const

export function HomeSearchBar() {
  const t = useTranslations('home.hero')
  const router = useRouter()
  const [query, setQuery] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`)
      return
    }
    router.push('/')
  }

  return (
    <div className="group relative max-w-xl">
      <form
        onSubmit={onSubmit}
        className="flex items-center rounded-full bg-surface-container-lowest p-2 shadow-ambient-md transition-all focus-within:ring-2 focus-within:ring-primary/20"
      >
        <MaterialIcon name="search" className="ml-4 text-primary" />
        <input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-none bg-transparent px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
          placeholder={t('searchPlaceholder')}
          type="search"
          autoComplete="off"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-8 py-3 font-bold text-on-primary transition-transform hover:scale-[0.98]"
        >
          {t('search')}
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="mr-2 text-sm text-on-surface-variant">
          {t('popularLabel')}
        </span>
        {POPULAR_TAGS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setQuery(t(`popularTags.${key}`))}
            className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-surface-container"
          >
            {t(`popularTags.${key}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
