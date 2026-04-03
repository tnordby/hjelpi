export type MinSideNavVariant = 'kunde' | 'hjelper'

export type MinSideNavLinkKey =
  | 'overview'
  | 'bookings'
  | 'services'
  | 'requests'
  | 'economy'
  | 'payouts'
  | 'bankId'
  | 'messages'
  | 'settings'

export type MinSideNavLink = {
  href: string
  key: MinSideNavLinkKey
}

export function minSideNavLinksForVariant(variant: MinSideNavVariant): MinSideNavLink[] {
  if (variant === 'kunde') {
    return [
      { href: '/min-side/kunde', key: 'overview' },
      { href: '/min-side/kunde/bestillinger', key: 'bookings' },
      { href: '/min-side/kunde/meldinger', key: 'messages' },
      { href: '/min-side/innstillinger', key: 'settings' },
    ]
  }
  return [
    { href: '/min-side/hjelper', key: 'overview' },
    { href: '/min-side/hjelper/tjenester', key: 'services' },
    { href: '/min-side/hjelper/foresporsler', key: 'requests' },
    { href: '/min-side/hjelper/inntekter', key: 'economy' },
    { href: '/min-side/hjelper/utbetalinger', key: 'payouts' },
    { href: '/min-side/hjelper/bankid', key: 'bankId' },
    { href: '/min-side/hjelper/meldinger', key: 'messages' },
    { href: '/min-side/innstillinger', key: 'settings' },
  ]
}

/** Resolve which tab set to show: path when under a segment, else fallback (e.g. innstillinger). */
export function resolveMinSideNavVariant(
  pathname: string,
  fallback: MinSideNavVariant,
): MinSideNavVariant {
  if (pathname.includes('/min-side/hjelper')) return 'hjelper'
  if (pathname.includes('/min-side/kunde')) return 'kunde'
  return fallback
}
