import * as React from 'react'
import { Sparkle } from '@hjelpi/ds'

export function PaaMorktPanel() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        background: '#1f1c17',
        padding: 32,
        borderRadius: 16,
      }}
    >
      <Sparkle tone="mint" size={40} />
      <Sparkle tone="accent" size={40} rotate={15} />
      <Sparkle tone="mint" size={24} rotate={-10} />
      <Sparkle tone="accent" size={24} />
    </div>
  )
}

export function GullPaaHvitt() {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', padding: 8 }}>
      <Sparkle tone="gold" size={40} />
      <Sparkle tone="gold" size={28} rotate={20} />
      <Sparkle tone="gold" size={18} rotate={-15} />
    </div>
  )
}

export function Storrelsesskala() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'flex-end',
        background: '#1f1c17',
        padding: 24,
        borderRadius: 16,
      }}
    >
      {[16, 24, 32, 48].map((size) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <Sparkle tone="mint" size={size} />
          <span style={{ fontSize: 12, color: '#a89f91' }}>{size}px</span>
        </div>
      ))}
    </div>
  )
}

export function DekorIHjornet() {
  return (
    <div
      style={{
        position: 'relative',
        background: '#1f1c17',
        color: '#ffffff',
        padding: '40px 32px',
        borderRadius: 16,
        maxWidth: 420,
      }}
    >
      <Sparkle tone="mint" size={36} rotate={12} />
      <div style={{ position: 'absolute', top: 16, right: 20 }}>
        <Sparkle tone="accent" size={22} rotate={-18} />
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 18, fontWeight: 600 }}>
        Bli en hjelper – tjen penger på det du kan best
      </p>
    </div>
  )
}
