import * as React from 'react'
import { SearchField } from '@hjelpi/ds'

export function Hero() {
  return (
    <div style={{ maxWidth: 560 }}>
      <SearchField placeholder="Hva trenger du hjelp til?" />
    </div>
  )
}

export function MedVerdi() {
  return (
    <div style={{ maxWidth: 560 }}>
      <SearchField value="Flyttevask i Oslo" onChange={() => {}} />
    </div>
  )
}

export function EgenKnappetekst() {
  return (
    <div style={{ maxWidth: 560 }}>
      <SearchField placeholder="Søk etter hundepasser i nærheten" submitLabel="Finn hjelpere" />
    </div>
  )
}

export function SmalKolonne() {
  return (
    <div style={{ maxWidth: 380 }}>
      <SearchField placeholder="Hva trenger du hjelp til?" />
    </div>
  )
}
