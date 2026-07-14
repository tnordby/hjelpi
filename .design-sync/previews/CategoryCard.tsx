import * as React from 'react'
import { CategoryCard } from '@hjelpi/ds'

export function CategoryGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
      }}
    >
      <CategoryCard
        title="Fotografering"
        imageSrc="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=70"
        imageAlt="Fotograf i arbeid under et bryllup"
        href="#fotografering"
      />
      <CategoryCard
        title="Hundepasser"
        imageSrc="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=70"
        imageAlt="To hunder som løper i gresset"
        href="#hundepasser"
      />
      <CategoryCard
        title="Renhold"
        imageSrc="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70"
        imageAlt="Person som vasker et vindu"
        href="#renhold"
      />
    </div>
  )
}

export function WithDescription() {
  return (
    <div style={{ maxWidth: 420 }}>
      <CategoryCard
        title="Renhold"
        description="Fast hjelp eller engangsvask — finn pålitelige renholdere i ditt nabolag."
        imageSrc="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70"
        imageAlt="Person som vasker et vindu"
        href="#renhold"
        minHeightRem={20}
      />
    </div>
  )
}
