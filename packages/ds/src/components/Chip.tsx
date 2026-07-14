'use client'

import * as React from 'react'

export type ChipProps = {
  /** `accent` = peach tint (popular tags), `neutral` = light gray. */
  tone?: 'accent' | 'neutral'
  /** Selected state renders as solid ink. */
  selected?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  children: React.ReactNode
}

/** Small pill for tags and filters, e.g. the "Populært:" quick searches. */
export function Chip({ tone = 'accent', selected, onClick, className, children }: ChipProps) {
  return (
    <button
      type="button"
      className={[
        'hj-chip',
        tone === 'neutral' ? 'hj-chip--neutral' : '',
        selected ? 'hj-chip--selected' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
