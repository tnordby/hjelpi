# Design System: Hjelpi Ink

## 1. Overview & Creative North Star
Inspiration: **bark.com / thumbtack.com** (white canvas, light neutral section blocks, hairline card borders, left-aligned hero, real photography, zero fluff), **hjem.no** (ink-black type, black-outline pill search), **nettbil.no** (sticker highlights, sparkles, dotted step connectors, social proof up front).

The North Star: **a modern Norwegian marketplace that feels light, airy and trustworthy** — ink on white, one loud accent color, real photos of real people working. Confident and playful, never corporate, never "AI-generated".

The brand mark is the wordmark **Hjelpi** in ink black — clean, no glyphs or symbols attached (a ✳ spark was tried and rejected). Playfulness comes from the terracotta sticker highlight and the 4-point sparkle SVGs, never from the wordmark itself.

---

## 2. Color & Tonal Architecture
All colors live as semantic tokens in `tailwind.config.ts`. Never hard-code hex in components.

- **`primary` #201c16 (Blekk / warm ink):** the brand color. Wordmark, headlines (via `on-surface`, same hex), pill buttons, CTA panel, footer. Black is the identity — like hjem.no.
- **`secondary` #c2521d (Terrakotta):** THE accent. Sticker highlights behind headline words, step-number tags, trust icons, sparkles, CTA buttons on dark panels. If something needs to pop, it's terracotta — nothing else.
- **`tertiary` #9a6b14 (Oker / gold):** review stars and small-caps eyebrow labels only.
- **`mint` #8fd6b4:** tiny sparkle accents on dark ink panels (nettbil's green sparkle move). Decorative only, never text.
- **Surfaces:** white and light — `background/surface` #ffffff, `surface-container-low` #f7f6f3 (section blocks), `surface-container-lowest` #ffffff (cards), inputs #f0efeb.
- **Text:** `on-surface` #1f1c17, `on-surface-variant` #605b51.

### Lines & separation
Sections separate via background shifts (white ↔ #f7f6f3). White-on-white cards get a **hairline ring** (`ring-1 ring-outline-variant` #e3e0d8) plus a soft ambient shadow — the Thumbtack card treatment. Statement strokes: the **2px ink outline** on the search pill (hjem.no signature) and 2px `primary-fixed` outlines on dark-panel secondary buttons.

### Section rhythm (homepage)
White hero → light-gray categories → white how-it-works → light-gray cities → white testimonials → ink CTA card → ink footer.

---

## 3. Typography
- **Display / headlines — Schibsted Grotesk** (`font-headline`, var `--font-display`). A Norwegian-designed grotesque. Weight 700–800, `tracking-tight`, `leading-[1.06]` for heroes. Headlines are `text-on-surface` (ink), never colored.
- **Body / UI — Instrument Sans** (`font-body`, var `--font-body`).
- **Eyebrows:** 12px bold uppercase `tracking-[0.2em]` `text-tertiary`, preceded by terracotta ✳.
- **The sticker highlight** is the signature move: the emotional phrase of a headline sits on a solid terracotta rounded rectangle (`bg-secondary`, `-rotate-1`, `rounded-2xl`, `text-on-secondary`). One sticker per page.

## 4. Imagery — real photos only
Unsplash photography (host already allowed in `next.config.js`): warm light, real people mid-task, shallow depth. **No AI-generated or illustration-style images.** Photo shapes: the **arch** (`rounded-t-full` + big bottom radius) for hero portraits, `rounded-[2rem]` with thick `border-surface` frame for secondary photos, floating white review cards layered on top. Category cards: photo + ink gradient scrim + white type.

## 5. Elevation & Depth
Warm ambient shadows only (`shadow-ambient*`, tinted rgba(58,48,24,…)). Hover = shadow + slight translate/rotate, not borders.

---

## 6. Signature Components
- **Search pill:** white, 2px ink outline, rounded-full, ink circle submit button.
- **Buttons:** ink pills (primary), peach `secondary-container` chips, terracotta CTAs on dark panels. See `lib/button-classes.ts`.
- **Step tags:** tilted terracotta rounded squares with bold numbers + dotted terracotta connector line (nettbil's 1-2-3).
- **Sparkles:** 4-point star SVGs — terracotta on cream, mint on ink. Decorative, small, max 2–3 per section.
- **Trust row:** filled terracotta icons + BankID/rating/free-quote copy directly under hero search.
- **CTA panel / footer:** ink with soft terracotta/mint radial glows and `primary-fixed` (#e6dcc6) supporting text.

### Icons
Material Symbols with variable FILL axis (0..1) — `MaterialIcon filled` works. Icons support, type leads.

---

## 7. Do's and Don'ts
**Do:** left-aligned heroes; asymmetric 7/5 grids; one terracotta sticker per page; real warm photography; capitalized Norwegian labels ("Hundepasser"); social proof high on the page.

**Don't:** blue anywhere; serif type; AI-looking imagery; hard dividers; pure black (#000) — ink is #201c16; more than one accent color per element; icon-first sections.
