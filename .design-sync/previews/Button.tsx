import * as React from 'react'
import { Button, Icon } from '@hjelpi/ds'

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary">Kom i gang</Button>
      <Button variant="accent">Bli en hjelper</Button>
      <Button variant="outline">Se alle tjenester</Button>
      <Button variant="ghost">Logg inn</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="sm">Lagre</Button>
      <Button size="md">Send forespørsel</Button>
      <Button size="lg">Publiser annonsen</Button>
    </div>
  )
}

export function WithIcon() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary">
        Finn hjelp <Icon name="arrowRight" size={18} />
      </Button>
      <Button variant="outline" iconOnly aria-label="Søk">
        <Icon name="search" />
      </Button>
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button disabled>Sender…</Button>
      <Button variant="accent" disabled>
        Utilgjengelig
      </Button>
      <Button href="#profil" variant="outline">
        Som lenke
      </Button>
    </div>
  )
}

export function OnDarkPanel() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
        background: '#1f1c17',
        padding: 24,
        borderRadius: 16,
      }}
    >
      <Button variant="accent">Registrer deg</Button>
      <Button variant="inverseOutline">Les mer</Button>
    </div>
  )
}
