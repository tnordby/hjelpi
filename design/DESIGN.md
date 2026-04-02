# Design System Strategy: The Scandinavian Concierge

## 1. Overview & Creative North Star
The North Star for this design system is **"The Digital Curator."** 

Moving beyond the utilitarian "bulletin board" feel of traditional marketplaces, this system adopts a high-end editorial approach rooted in Scandinavian minimalism. It prioritizes clarity, intentionality, and a sense of calm. We break the "standard template" look by rejecting rigid borders and dense grids in favor of **Tonal Layering** and **Intentional Asymmetry**. 

By utilizing generous white space (inspired by high-end lifestyle magazines) and overlapping elements, we transform a service directory into a premium experience. The UI doesn't just list services; it curates trust through sophisticated depth and breathing room.

---

## 2. Color & Tonal Architecture
The palette is built on a foundation of "Deep Teal" (`primary: #00606c`) and "Soft Azure" (`secondary: #29657a`), balanced by a sophisticated range of neutral surfaces.

### The "No-Line" Rule
To achieve a premium, seamless aesthetic, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts. 
- *Application:* A section containing "Recommended Pros" should use `surface-container-low (#eff4ff)` to distinguish itself from the main `background (#f8f9ff)`, rather than using a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical environment of stacked materials.
- **Level 0 (Base):** `surface (#f8f9ff)` – The primary canvas.
- **Level 1 (Sections):** `surface-container-low (#eff4ff)` – For large logical blocks.
- **Level 2 (Cards):** `surface-container-lowest (#ffffff)` – Provides a "lifted" feel for interactive elements.
- **Level 3 (Modals/Popovers):** `surface-bright (#f8f9ff)` – For the highest prominence.

### The "Glass & Gradient" Rule
Standard flat colors feel static. Use `primary` to `primary-container` gradients for hero buttons to add "soul." For floating navigation or search bars, employ **Glassmorphism**:
- **Background:** `surface` at 70% opacity.
- **Backdrop-blur:** 12px–20px.
- This allows high-quality service imagery to bleed through the UI, creating an integrated, modern atmosphere.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) with **Inter** (Body/Labels) to balance character with utility.

- **Display & Headlines (Manrope):** Large scales like `display-lg (3.5rem)` should be used with tight letter-spacing (-0.02em) to create a bold, authoritative editorial look. 
- **Body (Inter):** High readability is paramount. Use `body-lg (1rem)` for descriptions to ensure accessibility for all age groups.
- **Hierarchy as Identity:** Use `tertiary (#745100)` for small, all-caps `label-md` snippets (e.g., "CERTIFIED PRO") to add a touch of warmth and craftsmanship against the cool teals.

---

## 4. Elevation & Depth
We eschew traditional "Drop Shadows" in favor of **Ambient Tonal Layering**.

- **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container` background. The slight delta in hex value creates a natural, soft separation.
- **Ambient Shadows:** For floating elements (like the Search Bar), use a multi-layered shadow: `0px 10px 30px rgba(11, 28, 48, 0.05)`. Note the use of `on-surface (#0b1c30)` as the shadow tint rather than pure black.
- **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., input fields), use `outline-variant (#bdc8cb)` at **20% opacity**. Never use 100% opaque lines.

---

## 5. Signature Components

### Search Bar (The "Entry Point")
- **Style:** A floating, wide-pill container (`rounded-full`) using Glassmorphism. 
- **Detail:** Use a `surface-container-lowest` background with a subtle ambient shadow. No border. Use `primary` for the search icon to draw focus.

### Service Cards
- **Construction:** Strictly **no dividers**. 
- **Separation:** Content within the card is separated by the Spacing Scale (e.g., `spacing-3` between title and price). 
- **Interaction:** On hover, the card should transition from `surface-container-lowest` to a slightly brighter `surface-bright` with a soft ambient shadow, creating a "magnetic" lift.

### City Navigation & Chips
- **Style:** Use `secondary-container (#ace5fe)` for unselected states and `primary (#00606c)` with `on-primary (#ffffff)` for active states. 
- **Shape:** `rounded-md (0.75rem)` for a modern, friendly geometry.

### Trust Signals (Badges & Reviews)
- **Review Stars:** Use `tertiary (#745100)`—the gold-toned teal complement—to signify value and quality.
- **Badges:** Small `rounded-full` pills with a `surface-variant` background to keep them subtle but legible.

---

## 6. Do’s and Don’ts

### Do:
- **Use Asymmetric Spacing:** Offset images or text blocks (using `spacing-16` or `spacing-20`) to create an editorial, high-end magazine feel.
- **Embrace White Space:** If in doubt, increase the padding. The "Scandinavian" feel relies on the UI having room to breathe.
- **Use High-Quality Imagery:** The system relies on "Airbnb-style" photography. UI elements should feel like transparent overlays on top of beautiful, real-world service environments.

### Don't:
- **No Hard Dividers:** Never use a solid line to separate two items in a list. Use `spacing-4` or a subtle `surface-container` shift instead.
- **No Pure Black Shadows:** Shadows should always be a low-opacity tint of the `on-surface` color to maintain tonal harmony.
- **No Default System Fonts:** Always ensure Manrope and Inter are properly loaded to maintain the brand’s sophisticated "Digital Curator" identity.