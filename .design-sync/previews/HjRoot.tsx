import * as React from 'react'
import { HjRoot } from '@hjelpi/ds'

export function BrandCanvas() {
  return (
    <HjRoot>
      <div style={{ maxWidth: 520, padding: 24 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>Finn lokale hjelpere</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          Alt inni HjRoot arver Hjelpis merkevare: Instrument Sans som
          brødtekst, Schibsted Grotesk på overskrifter, blekksvart tekst på hvit
          bakgrunn — og terrakotta markering når du merker teksten.
        </p>
      </div>
    </HjRoot>
  )
}
