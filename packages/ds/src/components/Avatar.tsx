import * as React from 'react'

export type AvatarProps = {
  /** Image URL. Falls back to initials when absent. */
  src?: string
  /** Person's name — used for alt text and to derive initials. */
  name: string
  /** Default `md` (3rem). */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

/** Round avatar with image or initials fallback. */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={['hj-avatar', `hj-avatar--${size}`, className ?? ''].filter(Boolean).join(' ')}
    >
      {src ? <img src={src} alt={name} /> : <span aria-hidden>{initials(name)}</span>}
    </span>
  )
}
