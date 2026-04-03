export type LocationCoordRow = {
  id: string
  name: string
  lat: number
  lng: number
}

/** Earth radius in km */
const R = 6371

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function findNearestLocationRow(
  rows: LocationCoordRow[],
  lat: number,
  lng: number,
): LocationCoordRow | null {
  if (rows.length === 0) return null
  let best = rows[0]
  let bestD = haversineKm(lat, lng, best.lat, best.lng)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const d = haversineKm(lat, lng, row.lat, row.lng)
    if (d < bestD) {
      bestD = d
      best = row
    }
  }
  return best
}
