import * as React from 'react'
import { Button, CtaPanel } from '@hjelpi/ds'

export function BecomeHelper() {
  return (
    <CtaPanel
      title="Er du en ekspert?"
      subtitle="Bli med i Norges raskest voksende nettverk av hjelpere og få nye oppdrag i ditt nærområde."
    >
      <Button variant="accent">Bli en hjelper</Button>
      <Button variant="inverseOutline">Les mer</Button>
    </CtaPanel>
  )
}

export function Undecorated() {
  return (
    <CtaPanel
      title="Klar til å komme i gang?"
      subtitle="Beskriv jobben i dag, og få uforpliktende tilbud innen kort tid."
      decorated={false}
    >
      <Button variant="accent">Legg ut jobb</Button>
    </CtaPanel>
  )
}
