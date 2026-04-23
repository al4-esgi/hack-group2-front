import type { MapProps } from '@maplibre/maplibre-react-native'

export type Coordinate = { latitude: number; longitude: number }
export type LngLat = [number, number]
export type LngLatBounds = [number, number, number, number]

export type RouteLocation = {
  label: string
  coordinate: Coordinate
}

export type City = RouteLocation & {
  id: string
}

export type Stop = {
  id: string
  name: string
  city: string
  detour: string
  coordinate: Coordinate
  order: number
  badge?: 'star' | 'bib'
}

export type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: {
    name?: string
    street?: string
    housenumber?: string
    city?: string
    postcode?: string
    country?: string
  }
}

export type MapStyle = Exclude<MapProps['mapStyle'], string>
