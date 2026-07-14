import * as React from 'react'

export type ButtonProps = {
  /** Visual style. `primary` = solid ink pill (default action), `accent` = terracotta (the one loud CTA per view), `outline` = 2px ink outline, `ghost` = borderless, `inverseOutline` = for dark ink panels. */
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'inverseOutline'
  /** Control height. Default `md`. */
  size?: 'sm' | 'md' | 'lg'
  /** Render as an anchor instead of a button. */
  href?: string
  /** Icon-only button (square padding, pass an Icon as children with an aria-label). */
  iconOnly?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLElement>
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'hj-btn--primary',
  accent: 'hj-btn--accent',
  outline: 'hj-btn--outline',
  ghost: 'hj-btn--ghost',
  inverseOutline: 'hj-btn--inverse-outline',
}

/** Pill button in the Hjelpi Ink style. Solid ink by default; use `accent` sparingly — one terracotta CTA per view. */
export function Button({
  variant = 'primary',
  size = 'md',
  href,
  iconOnly,
  disabled,
  type = 'button',
  onClick,
  className,
  children,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const cls = [
    'hj-btn',
    `hj-btn--${size}`,
    VARIANT_CLASS[variant],
    iconOnly ? 'hj-btn--icon-only' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  if (href && !disabled) {
    return (
      <a className={cls} href={href} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </a>
    )
  }
  return (
    <button
      className={cls}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
