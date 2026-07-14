import * as React from 'react'
import { DisplayHeading } from '@hjelpi/ds'

export function HeroWithSticker() {
  return (
    <div style={{ maxWidth: 720 }}>
      <DisplayHeading sticker="til rett tid.">Finn rett hjelp</DisplayHeading>
    </div>
  )
}

export function SectionLevelTwo() {
  return (
    <div style={{ maxWidth: 720 }}>
      <DisplayHeading level={2}>Populære tjenester i Oslo</DisplayHeading>
    </div>
  )
}
