import * as React from 'react'
import { StepItem } from '@hjelpi/ds'

export function HowItWorks() {
  return (
    <ol
      style={{
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 32,
        padding: 0,
        margin: 0,
      }}
    >
      <StepItem number={1} title="Beskriv behovet">
        Fortell oss hva du trenger hjelp til, når og hvor. Det tar under to
        minutter.
      </StepItem>
      <StepItem number={2} title="Få tilbud">
        Kvalifiserte hjelpere i nærheten sender deg uforpliktende tilbud med
        pris.
      </StepItem>
      <StepItem number={3} title="Velg din ekspert" connector={false}>
        Sammenlign vurderinger og priser, og velg den som passer deg best.
      </StepItem>
    </ol>
  )
}

export function SingleStep() {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: 360 }}>
      <StepItem number={1} title="Beskriv behovet" connector={false}>
        Fortell oss hva du trenger hjelp til, når og hvor.
      </StepItem>
    </ol>
  )
}
