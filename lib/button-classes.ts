/**
 * Shared button styles aligned with the Scandinavian Concierge design system
 * (see DESIGN.md): primary → primary-container gradient, secondary-container
 * secondary actions, rounded-xl for standard controls, rounded-full for nav pills.
 */
const hjPrimarySurface =
  'bg-gradient-to-r from-primary to-primary-container font-bold text-on-primary shadow-ambient transition-[opacity,transform] hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50'

export const hjBtnPrimary =
  `inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm ${hjPrimarySurface}`

/** Full-width form submit (login, register, booking). */
export const hjBtnPrimaryLg =
  `inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base ${hjPrimarySurface}`

/** Navbar and compact pill CTAs. */
export const hjBtnPrimaryPill =
  `inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm ${hjPrimarySurface}`

export const hjBtnPrimaryPillLg =
  `inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm ${hjPrimarySurface}`

/** Circular icon-only primary (e.g. search submit). */
export const hjBtnPrimaryIconCircle =
  `flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container font-bold text-on-primary shadow-ambient transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`

export const hjBtnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-container px-5 py-2.5 text-sm font-bold text-on-secondary-container transition-opacity hover:opacity-95 disabled:opacity-50'

export const hjBtnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/5 disabled:opacity-50'

export const hjBtnMuted =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant ring-1 ring-outline-variant/40 hover:bg-on-surface/5 disabled:opacity-50'

export const hjBtnOutline =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50'

export const hjBtnInverted =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-on-surface px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50'
