import type { MapStyle, City, Stop } from './map.types'

export const CITIES: City[] = [
  { id: 'paris', label: 'Paris', coordinate: { latitude: 48.8566, longitude: 2.3522 } },
  { id: 'lyon', label: 'Lyon', coordinate: { latitude: 45.764, longitude: 4.8357 } },
  { id: 'lille', label: 'Lille', coordinate: { latitude: 50.6292, longitude: 3.0573 } },
  { id: 'strasbourg', label: 'Strasbourg', coordinate: { latitude: 48.5734, longitude: 7.7521 } },
  { id: 'nantes', label: 'Nantes', coordinate: { latitude: 47.2184, longitude: -1.5536 } },
  { id: 'bordeaux', label: 'Bordeaux', coordinate: { latitude: 44.8378, longitude: -0.5792 } },
  { id: 'toulouse', label: 'Toulouse', coordinate: { latitude: 43.6047, longitude: 1.4442 } },
  { id: 'nice', label: 'Nice', coordinate: { latitude: 43.7102, longitude: 7.262 } },
  { id: 'marseille', label: 'Marseille', coordinate: { latitude: 43.2965, longitude: 5.3698 } },
]

export const DEFAULT_ORIGIN = CITIES.find((city) => city.id === 'paris') ?? CITIES[0]
export const DEFAULT_DESTINATION = CITIES.find((city) => city.id === 'lyon') ?? CITIES[1]

export const OSM_DETAILED_STYLE: MapStyle = {
  version: 8,
  name: 'OSM Detailed',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-raster',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
}

export const STOPS: Stop[] = [
  {
    id: 'auxerre',
    name: "L'Épicurien",
    city: 'Auxerre',
    detour: 'detour 4 min',
    coordinate: { latitude: 47.7982, longitude: 3.5738 },
    order: 1,
    badge: 'star',
  },
  {
    id: 'beaune',
    name: 'La Table du Marche',
    city: 'Beaune',
    detour: 'sur la route',
    coordinate: { latitude: 47.026, longitude: 4.84 },
    order: 2,
    badge: 'bib',
  },
  {
    id: 'macon',
    name: 'Brasserie Sud',
    city: 'Macon',
    detour: 'diner etape',
    coordinate: { latitude: 46.3066, longitude: 4.8287 },
    order: 3,
  },
]

export const INITIAL_REGION = {
  latitude: 47.25,
  longitude: 3.65,
  latitudeDelta: 4.25,
  longitudeDelta: 4.25,
}

export const SHEET_COLLAPSED_HEIGHT = 88
