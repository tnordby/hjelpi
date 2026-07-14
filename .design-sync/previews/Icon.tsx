import * as React from 'react'
import { Icon, type IconName } from '@hjelpi/ds'

const ALL_ICONS: IconName[] = [
  'search',
  'star',
  'check',
  'arrowRight',
  'verified',
  'lock',
  'heart',
  'location',
  'close',
]

export function AlleIkoner() {
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', maxWidth: 520 }}>
      {ALL_ICONS.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            width: 88,
          }}
        >
          <Icon name={name} size={24} />
          <span style={{ fontSize: 12, color: '#6b6459' }}>{name}</span>
        </div>
      ))}
    </div>
  )
}

export function Storrelser() {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
      {[14, 20, 28, 40].map((size) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <Icon name="star" size={size} />
          <span style={{ fontSize: 12, color: '#6b6459' }}>{size}px</span>
        </div>
      ))}
    </div>
  )
}

export function TerrakottaFarge() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: '#c2521d' }}>
      <Icon name="heart" size={24} />
      <Icon name="star" size={24} />
      <Icon name="verified" size={24} />
      <Icon name="location" size={24} />
      <Icon name="arrowRight" size={24} />
    </div>
  )
}

export function IKontekst() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
        <Icon name="location" size={16} /> Majorstuen, Oslo
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 14,
          color: '#b8860b',
        }}
      >
        <Icon name="star" size={16} /> 4,9 (127 vurderinger)
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
        Se profil <Icon name="arrowRight" size={16} />
      </span>
    </div>
  )
}
