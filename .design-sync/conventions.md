# Hjelpi Ink — build conventions

Modern Nordic marketplace system: white canvas, ink-black type and primary
actions, terracotta as the single loud accent. Norwegian-language product —
write UI copy in Norwegian (bokmål).

## Setup (required)

Wrap every screen in `HjRoot` once, at the top:

```jsx
const { HjRoot, Button, SearchField } = window.HjelpiDS
<HjRoot>
  {/* everything */}
</HjRoot>
```

Without it, text renders in browser-default serif — the body font, ink text
color and selection styles all come from the `hj-root` class it applies.

## Styling idiom

Components style themselves via `hj-*` classes; for your own layout glue use
**inline styles or the CSS custom properties** below — there is no utility-class
system (no Tailwind). Real tokens (all defined in `styles.css`):

- Color: `--hj-color-canvas`, `--hj-color-section` (light section blocks),
  `--hj-color-well`, `--hj-color-hairline`, `--hj-color-ink`,
  `--hj-color-ink-muted`, `--hj-color-accent`, `--hj-color-accent-tint`,
  `--hj-color-on-accent-tint`, `--hj-color-gold`, `--hj-color-mint`,
  `--hj-color-danger`, `--hj-color-success`
- Type: `--hj-font-display` (Schibsted Grotesk — headings),
  `--hj-font-body` (Instrument Sans — everything else)
- Radii: `--hj-radius-md|lg|xl|2xl|pill` — cards use `xl`, buttons/inputs `pill`/`md`
- Shadow: `--hj-shadow-soft|ambient|lifted` (warm-tinted, never pure black)
- Spacing: `--hj-space-1|2|3|4|5|6|8|10|12|16|20|24` (0.25rem steps)

Section rhythm: alternate white (`--hj-color-canvas`) and light
(`--hj-color-section`) section backgrounds; separate with background shifts,
not border lines.

## Brand rules

- ONE terracotta CTA per view (`Button variant="accent"`); all other buttons
  are ink `primary`, `outline`, or `ghost`.
- Headings: `--hj-font-display`, weight 700–800, letter-spacing -0.02em. Use
  `DisplayHeading` for hero headlines (its `sticker` prop is the signature
  terracotta highlight) and `SectionHeading` for section openers.
- Real photography only (Unsplash-style), never illustration; `CategoryCard`
  applies the standard dark scrim.
- `mint` is decoration-only on dark panels (see `Sparkle`, `CtaPanel`).

## Read before styling

`styles.css` (tokens + every `hj-*` component class) and each component's
`.prompt.md` / `.d.ts`.

## Idiomatic example

```jsx
const { HjRoot, SectionHeading, TestimonialCard } = window.HjelpiDS
<HjRoot>
  <section style={{ background: 'var(--hj-color-section)', padding: 'var(--hj-space-20) var(--hj-space-6)' }}>
    <SectionHeading align="center" eyebrow="HVA VÅRE BRUKERE SIER" title="Tusenvis av fornøyde kunder" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--hj-space-6)', maxWidth: 1120, margin: 'var(--hj-space-12) auto 0' }}>
      <TestimonialCard quote="Fant en trygg hundepasser samme dag." name="Magnus S." meta="Oslo" rating={5} />
    </div>
  </section>
</HjRoot>
```
