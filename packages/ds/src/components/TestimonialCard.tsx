import * as React from 'react'
import { Card } from './Card'
import { Rating } from './Rating'
import { Avatar } from './Avatar'

export type TestimonialCardProps = {
  /** The customer quote, without surrounding quote marks. */
  quote: string
  /** Customer name, e.g. "Ingrid L." */
  name: string
  /** City or context line under the name, e.g. "Bergen". */
  meta?: string
  /** Star rating 0–5. Default 5. */
  rating?: number
  /** Avatar image URL (initials fallback when absent). */
  avatarSrc?: string
  className?: string
}

/** Review card: oversized accent quote mark, gold stars, quote, and person row. */
export function TestimonialCard({
  quote,
  name,
  meta,
  rating = 5,
  avatarSrc,
  className,
}: TestimonialCardProps) {
  return (
    <Card flush className={className}>
      <article className="hj-testimonial">
        <span className="hj-testimonial__mark" aria-hidden>
          &ldquo;
        </span>
        <Rating value={rating} />
        <p className="hj-testimonial__quote">«{quote}»</p>
        <div className="hj-testimonial__person">
          <Avatar src={avatarSrc} name={name} />
          <div>
            <p className="hj-testimonial__name">{name}</p>
            {meta ? <p className="hj-testimonial__meta">{meta}</p> : null}
          </div>
        </div>
      </article>
    </Card>
  )
}
