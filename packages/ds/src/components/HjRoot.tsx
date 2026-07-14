import * as React from 'react'

export type HjRootProps = {
  /** Extra class names merged onto the root. */
  className?: string
  children: React.ReactNode
}

/**
 * Brand root wrapper. Applies the Hjelpi body font, ink text color, white
 * canvas and selection styles to everything inside. Wrap your app (or any
 * DS-using subtree) in this once — components render with fallback browser
 * fonts without it.
 */
export function HjRoot({ className, children }: HjRootProps) {
  return <div className={['hj-root', className ?? ''].filter(Boolean).join(' ')}>{children}</div>
}
