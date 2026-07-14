import * as React from 'react'
import { Avatar } from '@hjelpi/ds'

export function WithImage() {
  return (
    <Avatar
      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=70"
      name="Kari Nordmann"
    />
  )
}

export function InitialsFallback() {
  return <Avatar name="Magnus Solberg" />
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar name="Ingrid Larsen" size="sm" />
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=70"
        name="Kari Nordmann"
        size="md"
      />
      <Avatar name="Ole Kristian Berg" size="lg" />
    </div>
  )
}
