import * as React from 'react'
import { Icon, type IconName } from './Icon'

export type BadgeProps = {
  /** `verified` = green (BankID etc.), `accent` = peach, `neutral` = gray, `danger` = red. */
  tone?: 'verified' | 'accent' | 'neutral' | 'danger'
  /** Optional leading icon. */
  icon?: IconName
  className?: string
  children: React.ReactNode
}

/** Small status pill — trust signals like "BankID-verifisert". */
export function Badge({ tone = 'neutral', icon, className, children }: BadgeProps) {
  return (
    <span className={['hj-badge', `hj-badge--${tone}`, className ?? ''].filter(Boolean).join(' ')}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  )
}
