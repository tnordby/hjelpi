import * as React from 'react'

export type CategoryCardProps = {
  /** Category name, e.g. "Fotografering". */
  title: string
  /** Photo URL — real photography, never illustration (see DESIGN.md). */
  imageSrc: string
  /** Alt text describing the photo. */
  imageAlt: string
  /** Link target. */
  href: string
  /** Supporting line, shown on larger cards. */
  description?: string
  /** Minimum card height in rem. Default 16. */
  minHeightRem?: number
  className?: string
}

/** Photo category tile with a dark gradient scrim and display-type title. */
export function CategoryCard({
  title,
  imageSrc,
  imageAlt,
  href,
  description,
  minHeightRem = 16,
  className,
}: CategoryCardProps) {
  return (
    <a
      className={['hj-category-card', className ?? ''].filter(Boolean).join(' ')}
      href={href}
      style={{ minHeight: `${minHeightRem}rem` }}
    >
      <img src={imageSrc} alt={imageAlt} />
      <div className="hj-category-card__content">
        <h3 className="hj-category-card__title">{title}</h3>
        {description ? <p className="hj-category-card__description">{description}</p> : null}
      </div>
    </a>
  )
}
