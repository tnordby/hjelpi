# @hjelpi/ds — Hjelpi Ink design system

Modern Nordic marketplace components for Hjelpi. White canvas, ink-black type
and primary actions, terracotta as the single loud accent, ochre-gold for
ratings. See `design/DESIGN.md` at the repo root for the full brand rationale.

## Build

```bash
cd packages/ds
node build.mjs && ../../node_modules/.bin/tsc -p tsconfig.json --emitDeclarationOnly
```

Outputs `dist/index.js` (ESM, react external), `dist/index.d.ts`,
`dist/styles.css` (tokens + component classes, self-contained with bundled
woff2 fonts in `dist/fonts/`).

## Use in the app

```tsx
import { Button, SearchField } from '@hjelpi/ds'
import '@hjelpi/ds/styles.css' // once, in the root layout
```

Wrap the page (or just the DS-using subtree) in `class="hj-root"` to get the
body font, ink text color and selection styles.

## Components

Button, TextField, SearchField, Chip, Badge, Card, Avatar, Rating,
SectionHeading, DisplayHeading (sticker highlight), StepItem, TestimonialCard,
CategoryCard, CtaPanel, Sparkle, Icon.

## Rules of the brand

- One terracotta (`accent`) CTA per view; everything else is ink.
- Real photography only — never illustration or AI-look imagery.
- White-on-white cards always carry the hairline ring (built into `Card`).
- `mint` exists only as sparkle decoration on dark ink panels.
