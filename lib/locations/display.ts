/** Norwegian kommune line as shown in settings and pickers. */
export function locationKommuneLabel(kommuneName: string): string {
  return `${kommuneName.trim()} kommune`
}

export type LocationDisplaySource = {
  name: string
  cityName: string
  fylke?: string
}

/** Value shown in the location combobox input after a selection. */
export function locationSettingsInputValue(loc: LocationDisplaySource): string {
  const city = (loc.cityName || loc.name).trim()
  const kn = loc.name.trim()
  const kommuneLine = locationKommuneLabel(kn)
  if (city.toLowerCase() === kn.toLowerCase()) {
    return kommuneLine
  }
  return `${city} — ${kommuneLine}`
}

export function locationMatchesSearch(loc: LocationDisplaySource, query: string): boolean {
  const n = query.trim().toLowerCase()
  if (!n) return true
  const city = (loc.cityName || loc.name).toLowerCase()
  const fylke = (loc.fylke ?? '').toLowerCase()
  return (
    loc.name.toLowerCase().includes(n) ||
    city.includes(n) ||
    fylke.includes(n) ||
    locationKommuneLabel(loc.name).toLowerCase().includes(n)
  )
}

/** Single-line label for <select> options and compact lists. */
export function locationOptionSingleLine(loc: LocationDisplaySource): string {
  return locationSettingsInputValue(loc)
}
