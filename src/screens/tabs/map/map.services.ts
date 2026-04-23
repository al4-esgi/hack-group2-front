import type { Coordinate, LngLat, LngLatBounds, PhotonFeature, RouteLocation, Stop } from './map.types'

function toRouteEndpoint(point: Coordinate) {
  return `${point.longitude},${point.latitude}`
}

function toMapPoint([longitude, latitude]: [number, number]): Coordinate {
  return { latitude, longitude }
}

function toLatLngQuery(point: Coordinate) {
  return `${point.latitude},${point.longitude}`
}

export function toLngLat(point: Coordinate): LngLat {
  return [point.longitude, point.latitude]
}

export function toBounds(
  points: Coordinate[],
  origin: Coordinate,
  destination: Coordinate,
): LngLatBounds {
  if (points.length === 0) {
    return [origin.longitude, destination.latitude, destination.longitude, origin.latitude]
  }

  let west = points[0].longitude
  let east = points[0].longitude
  let south = points[0].latitude
  let north = points[0].latitude

  for (const point of points) {
    if (point.longitude < west) west = point.longitude
    if (point.longitude > east) east = point.longitude
    if (point.latitude < south) south = point.latitude
    if (point.latitude > north) north = point.latitude
  }

  return [west, south, east, north]
}

export async function fetchRoute(points: Coordinate[], signal: AbortSignal) {
  const encodedPoints = points.map(toRouteEndpoint).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${encodedPoints}?overview=full&geometries=geojson&steps=false`
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`OSRM route error ${response.status}`)
  }

  const payload = (await response.json()) as {
    routes?: { duration?: number; geometry?: { coordinates?: [number, number][] } }[]
  }

  const route = payload.routes?.[0]
  const coordinates = route?.geometry?.coordinates
  if (!coordinates?.length) {
    throw new Error('Empty route geometry')
  }

  return {
    coordinates: coordinates.map(toMapPoint),
    durationSeconds: route?.duration ?? null,
  }
}

export function buildRoutePoints(
  selectedIds: string[],
  origin: Coordinate,
  destination: Coordinate,
  stops: Stop[],
) {
  const selectedStops = stops
    .filter((stop) => selectedIds.includes(stop.id))
    .sort((a, b) => a.order - b.order)

  return [origin, ...selectedStops.map((stop) => stop.coordinate), destination]
}

export function buildGoogleMapsUrl(points: Coordinate[]) {
  const origin = toLatLngQuery(points[0])
  const destination = toLatLngQuery(points[points.length - 1])
  const waypoints = points.slice(1, -1).map(toLatLngQuery).join('|')

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}`
}

export function buildAppleMapsUrl(points: Coordinate[]) {
  const origin = toLatLngQuery(points[0])
  const destinationChain = points.slice(1).map(toLatLngQuery).join('+to:')
  return `http://maps.apple.com/?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destinationChain)}&dirflg=d`
}

export function buildWazeUrl(points: Coordinate[]) {
  const destination = points[1] ?? points[points.length - 1]
  return `https://waze.com/ul?ll=${destination.latitude},${destination.longitude}&navigate=yes`
}

export function formatDuration(durationSeconds: number | null) {
  if (!durationSeconds) {
    return '--'
  }

  const minutes = Math.round(durationSeconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} min`
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
}

export function areCoordinatesClose(a: Coordinate, b: Coordinate) {
  const epsilon = 0.00001
  return Math.abs(a.latitude - b.latitude) < epsilon && Math.abs(a.longitude - b.longitude) < epsilon
}

export async function searchAddressCandidates(
  query: string,
  signal: AbortSignal,
): Promise<RouteLocation[]> {
  const params = new URLSearchParams({
    q: query,
    limit: '6',
    lang: 'fr',
  })
  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Geocode error ${response.status}`)
  }

  const payload = (await response.json()) as { features?: PhotonFeature[] }
  return (payload.features ?? [])
    .map((item) => {
      const longitude = Number(item.geometry?.coordinates?.[0])
      const latitude = Number(item.geometry?.coordinates?.[1])
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null
      }

      const properties = item.properties ?? {}
      const streetLabel = [properties.housenumber, properties.street].filter(Boolean).join(' ').trim()
      const primary = properties.name || streetLabel || properties.city || 'Adresse'
      const secondary = [properties.city, properties.postcode, properties.country]
        .filter(Boolean)
        .join(', ')
      const shortLabel = [primary, secondary].filter(Boolean).join(' - ')

      return {
        label: shortLabel,
        coordinate: { latitude, longitude },
      }
    })
    .filter((item): item is RouteLocation => item !== null)
}
