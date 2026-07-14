import * as React from 'react'
import { Rating } from '@hjelpi/ds'

export function ValueSweep() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Rating value={5} showValue />
      <Rating value={4} showValue />
      <Rating value={3.5} showValue />
    </div>
  )
}

export function WithCount() {
  return <Rating value={4.8} showValue count={127} />
}

export function BareStars() {
  return <Rating value={4} />
}
