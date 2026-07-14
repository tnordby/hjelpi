import * as React from 'react'

export type SectionHeadingProps = {
  /** Small gold uppercase kicker above the title, e.g. "SLIK FUNGERER DET". */
  eyebrow?: string
  /** The heading itself (Schibsted Grotesk, extrabold). */
  title: string
  /** Muted supporting line under the title. */
  subtitle?: string
  /** Center the block (defaults to left-aligned). */
  align?: 'left' | 'center'
  /** Heading level for the title element. Default h2. */
  level?: 2 | 3
  className?: string
}

/** Standard section opener: eyebrow + display title + subtitle. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  level = 2,
  className,
}: SectionHeadingProps) {
  const Tag = `h${level}` as 'h2' | 'h3'
  return (
    <div
      className={[
        'hj-section-heading',
        align === 'center' ? 'hj-section-heading--center' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {eyebrow ? <p className="hj-section-heading__eyebrow">{eyebrow}</p> : null}
      <Tag className="hj-section-heading__title">{title}</Tag>
      {subtitle ? <p className="hj-section-heading__subtitle">{subtitle}</p> : null}
    </div>
  )
}
