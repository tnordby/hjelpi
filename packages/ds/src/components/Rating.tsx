import * as React from 'react'
import { Icon } from './Icon'

export type RatingProps = {
  /** Star value 0–5 (whole stars are filled, the rest render dimmed). */
  value: number
  /** Show the numeric value next to the stars, e.g. "4,9". */
  showValue?: boolean
  /** Review count, rendered as "(123)". */
  count?: number
  /** Accessible label. Default derives from the value. */
  'aria-label'?: string
  className?: string
}

/** Gold five-star rating row with optional value and count. */
export function Rating({
  value,
  showValue,
  count,
  'aria-label': ariaLabel,
  className,
}: RatingProps) {
  const rounded = Math.round(Math.min(5, Math.max(0, value)))
  const nf = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 })
  return (
    <span
      className={['hj-rating', className ?? ''].filter(Boolean).join(' ')}
      role="img"
      aria-label={ariaLabel ?? `${nf.format(value)} av 5 stjerner`}
    >
      <span className="hj-rating__stars" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon key={i} name="star" size={18} className={i < rounded ? '' : 'hj-rating__star--empty'} />
        ))}
      </span>
      {showValue ? <span className="hj-rating__value">{nf.format(value)}</span> : null}
      {count !== undefined ? (
        <span className="hj-rating__count">({new Intl.NumberFormat('nb-NO').format(count)})</span>
      ) : null}
    </span>
  )
}
