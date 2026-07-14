import * as React from 'react'
import { Sparkle } from './Sparkle'

export type CtaPanelProps = {
  /** Big display-type headline. */
  title: string
  /** Supporting paragraph in the soft on-ink tone. */
  subtitle?: string
  /** Action buttons — use Button variant="accent" for the main CTA and variant="inverseOutline" for the secondary. */
  children?: React.ReactNode
  /** Show the corner sparkles and glows. Default true. */
  decorated?: boolean
  className?: string
}

/** Full-width ink panel with glows and sparkles — the site's big conversion moment. */
export function CtaPanel({ title, subtitle, children, decorated = true, className }: CtaPanelProps) {
  return (
    <section className={['hj-cta-panel', className ?? ''].filter(Boolean).join(' ')}>
      {decorated ? (
        <>
          <div className="hj-cta-panel__glow hj-cta-panel__glow--accent" />
          <div className="hj-cta-panel__glow hj-cta-panel__glow--mint" />
          <Sparkle
            tone="mint"
            size={40}
            rotate={12}
            className="hj-cta-panel__sparkle-decor"
          />
        </>
      ) : null}
      <div className="hj-cta-panel__content">
        <h2 className="hj-cta-panel__title">{title}</h2>
        {subtitle ? <p className="hj-cta-panel__subtitle">{subtitle}</p> : null}
        {children ? <div className="hj-cta-panel__actions">{children}</div> : null}
      </div>
    </section>
  )
}
