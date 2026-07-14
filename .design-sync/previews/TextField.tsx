import * as React from 'react'
import { TextField } from '@hjelpi/ds'

const col = { display: 'grid', gap: 20, maxWidth: 380 } as const

export function Basic() {
  return (
    <div style={col}>
      <TextField label="E-post" type="email" placeholder="navn@eksempel.no" />
      <TextField
        label="Telefon"
        type="tel"
        placeholder="+47 900 00 000"
        hint="Vi deler aldri nummeret ditt."
      />
    </div>
  )
}

export function ErrorState() {
  return (
    <div style={col}>
      <TextField
        label="Passord"
        type="password"
        defaultValue="123"
        error="Passordet må ha minst 8 tegn."
      />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={col}>
      <TextField label="Organisasjonsnummer" defaultValue="912 345 678" disabled />
    </div>
  )
}

export function Multiline() {
  return (
    <div style={col}>
      <TextField
        label="Beskriv oppdraget"
        multiline
        rows={4}
        placeholder="Fortell hva du trenger hjelp til, når det passer og hvor du bor…"
        hint="Jo mer detaljer, jo bedre tilbud får du."
      />
    </div>
  )
}
