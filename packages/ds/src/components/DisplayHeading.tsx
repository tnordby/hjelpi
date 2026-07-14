import * as React from 'react'

export type DisplayHeadingProps = {
  /** Plain leading text of the headline. */
  children: React.ReactNode
  /** The word(s) wrapped in the terracotta sticker highlight, e.g. "til rett tid." */
  sticker?: string
  /** Heading level. Default h1 (hero use). */
  level?: 1 | 2
  className?: string
}

/**
 * Hero-scale headline with the signature terracotta sticker highlight
 * (slightly rotated solid-accent block) on part of the text.
 */
export function DisplayHeading({ children, sticker, level = 1, className }: DisplayHeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2'
  return (
    <Tag className={['hj-display', className ?? ''].filter(Boolean).join(' ')}>
      {children}
      {sticker ? (
        <>
          {' '}
          <span className="hj-sticker">{sticker}</span>
        </>
      ) : null}
    </Tag>
  )
}
