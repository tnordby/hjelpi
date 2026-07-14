import * as React from 'react'
import { Chip } from '@hjelpi/ds'

export function PopulaereTagger() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 14, color: '#6b6459' }}>Populært:</span>
      <Chip>Fotograf</Chip>
      <Chip>Hundepasser</Chip>
      <Chip>Flyttevask</Chip>
      <Chip>Barnepass</Chip>
    </div>
  )
}

export function NoytralTone() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Chip tone="neutral">Hagearbeid</Chip>
      <Chip tone="neutral">Snømåking</Chip>
      <Chip tone="neutral">Maling</Chip>
      <Chip tone="neutral">Møbelmontering</Chip>
    </div>
  )
}

export function ValgtTilstand() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Chip selected>Flyttevask</Chip>
      <Chip>Fotograf</Chip>
      <Chip selected>Oslo</Chip>
      <Chip tone="neutral">Bergen</Chip>
    </div>
  )
}

export function Filterrad() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', maxWidth: 480 }}>
      <Chip selected>Alle kategorier</Chip>
      <Chip tone="neutral">Rengjøring</Chip>
      <Chip tone="neutral">Håndverk</Chip>
      <Chip tone="neutral">Dyrepass</Chip>
      <Chip tone="neutral">Flyttehjelp</Chip>
      <Chip tone="neutral">Undervisning</Chip>
    </div>
  )
}
