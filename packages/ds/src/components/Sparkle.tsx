import * as React from 'react'

export type SparkleProps = {
  /** `mint` and `accent` are for dark ink panels; `gold` works on light surfaces. */
  tone?: 'accent' | 'mint' | 'gold'
  /** Pixel size. Default 32. */
  size?: number
  /** Rotation in degrees for a hand-placed feel. */
  rotate?: number
  className?: string
}

/** Decorative 4-point sparkle (the nettbil-style accent). Purely visual — always aria-hidden. */
export function Sparkle({ tone = 'accent', size = 32, rotate = 0, className }: SparkleProps) {
  return (
    <svg
      aria-hidden
      className={['hj-sparkle', `hj-sparkle--${tone}`, className ?? ''].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="currentColor"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path d="M24 2c2 10 6 16 10 19s8 4 12 3c-10 2-16 6-19 10s-4 8-3 12c-2-10-6-16-10-19s-8-4-12-3c10-2 16-6 19-10s4-8 3-12z" />
    </svg>
  )
}
