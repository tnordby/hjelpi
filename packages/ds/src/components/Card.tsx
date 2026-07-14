import * as React from 'react'

export type CardProps = {
  /** Makes the whole card a link with hover lift. */
  href?: string
  /** Hover lift + pointer without being a link (e.g. onClick handled upstream). */
  interactive?: boolean
  /** Remove the default body padding (for image-bleed layouts). */
  flush?: boolean
  onClick?: React.MouseEventHandler<HTMLElement>
  className?: string
  children: React.ReactNode
}

/** White surface with a hairline ring and soft ambient shadow — the standard Hjelpi card. */
export function Card({ href, interactive, flush, onClick, className, children }: CardProps) {
  const cls = [
    'hj-card',
    href || interactive ? 'hj-card--interactive' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  const body = flush ? children : <div className="hj-card__body">{children}</div>

  if (href) {
    return (
      <a className={cls} href={href} onClick={onClick}>
        {body}
      </a>
    )
  }
  return (
    <div className={cls} onClick={onClick}>
      {body}
    </div>
  )
}
