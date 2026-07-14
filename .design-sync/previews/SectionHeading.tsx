import * as React from 'react'
import { SectionHeading } from '@hjelpi/ds'

export function WithEyebrow() {
  return (
    <div style={{ maxWidth: 560 }}>
      <SectionHeading
        eyebrow="SLIK FUNGERER DET"
        title="Det har aldri vært enklere å få ting gjort."
        subtitle="Beskriv jobben, sammenlign tilbud fra lokale hjelpere og velg den som passer best."
      />
    </div>
  )
}

export function Centered() {
  return (
    <div style={{ maxWidth: 560 }}>
      <SectionHeading
        align="center"
        eyebrow="POPULÆRE TJENESTER"
        title="Hjelp til alt du ikke rekker selv"
        subtitle="Fra flyttevask til barnepass — finn en pålitelig hjelper i nærheten."
      />
    </div>
  )
}

export function TitleOnly() {
  return (
    <div style={{ maxWidth: 560 }}>
      <SectionHeading title="Anmeldelser fra fornøyde kunder" />
    </div>
  )
}
