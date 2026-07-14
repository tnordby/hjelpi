import * as React from 'react'
import { TestimonialCard } from '@hjelpi/ds'

export function Single() {
  return (
    <div style={{ maxWidth: 380 }}>
      <TestimonialCard
        quote="Fant en fantastisk fotograf til bryllupet vårt på under en time. Hele prosessen var sømløs."
        name="Erik T."
        meta="Stavanger"
        rating={5}
      />
    </div>
  )
}

export function Row() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 760 }}>
      <TestimonialCard
        quote="Veldig enkelt å bruke. Fant en trygg hundepasser samme dag."
        name="Magnus S."
        meta="Oslo"
        rating={5}
      />
      <TestimonialCard
        quote="Trengte flyttevask i Bergen og fikk tre gode tilbud med en gang."
        name="Ingrid L."
        meta="Bergen"
        rating={4}
      />
    </div>
  )
}
