import * as React from 'react'
import { Badge } from '@hjelpi/ds'

export function AlleToner() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge tone="verified" icon="verified">
        BankID-verifisert
      </Badge>
      <Badge tone="accent" icon="star">
        Toppvurdert
      </Badge>
      <Badge tone="neutral" icon="lock">
        Sikker betaling
      </Badge>
      <Badge tone="danger">Avlyst</Badge>
    </div>
  )
}

export function TillitssignalerPaaProfil() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge tone="verified" icon="verified">
        BankID-verifisert
      </Badge>
      <Badge tone="verified" icon="check">
        Bakgrunnssjekket
      </Badge>
      <Badge tone="neutral" icon="location">
        Grünerløkka, Oslo
      </Badge>
    </div>
  )
}

export function UtenIkon() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge tone="verified">Fullført</Badge>
      <Badge tone="accent">Ny hjelper</Badge>
      <Badge tone="neutral">Venter på svar</Badge>
      <Badge tone="danger">Ikke tilgjengelig</Badge>
    </div>
  )
}
