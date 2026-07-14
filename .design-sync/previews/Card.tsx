import * as React from 'react'
import { Card } from '@hjelpi/ds'

export function Default() {
  return (
    <div style={{ maxWidth: 380 }}>
      <Card>
        <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Flyttevask i Oslo</h3>
        <p style={{ margin: 0, color: '#6b6459', fontSize: 15, lineHeight: 1.5 }}>
          Grundig utvask av leilighet på 65 m² med godkjent sjekkliste. Alle
          hjelpere er bakgrunnssjekket og forsikret.
        </p>
      </Card>
    </div>
  )
}

export function Interactive() {
  return (
    <div style={{ maxWidth: 380 }}>
      <Card href="#">
        <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Hundelufting på Grünerløkka</h3>
        <p style={{ margin: 0, color: '#6b6459', fontSize: 15, lineHeight: 1.5 }}>
          Daglig lufting av golden retriever, hverdager kl. 11–13. Trykk for å
          se profil og priser.
        </p>
      </Card>
    </div>
  )
}

export function FlushImage() {
  return (
    <div style={{ maxWidth: 340 }}>
      <Card flush>
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=70"
          alt="Renholder vasker kjøkkenbenk"
          style={{ display: 'block', width: '100%', height: 180, objectFit: 'cover' }}
        />
        <div style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>Hjemmerengjøring</h3>
          <p style={{ margin: 0, color: '#6b6459', fontSize: 14, lineHeight: 1.5 }}>
            Fast ukentlig vask fra 549 kr. Finn ledige renholdere i ditt nabolag.
          </p>
        </div>
      </Card>
    </div>
  )
}
