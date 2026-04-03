'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

type Props = {
  url: string
  title: string
  text: string
}

export function ServiceShareButton({ url, title, text }: Props) {
  const t = useTranslations('publicService')
  const [copied, setCopied] = useState(false)

  const onShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [text, title, url])

  return (
    <button
      type="button"
      onClick={onShare}
      className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-4 py-2 text-sm font-semibold text-on-surface shadow-sm transition-colors hover:border-primary/30 hover:bg-surface-container-low"
    >
      <MaterialIcon name="share" className="text-lg text-on-surface-variant" />
      {copied ? t('shareCopied') : t('share')}
    </button>
  )
}
