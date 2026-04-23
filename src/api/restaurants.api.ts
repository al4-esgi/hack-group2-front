import apiClient from './axios'

export type RestaurantDistinction = 'star' | 'bib' | 'green-star' | 'key'

type RestaurantDetailsResponse = {
  id: string | number
  name: string
  city?: string | null
  address?: string | null
  area?: string | null
  district?: string | null
  neighborhood?: string | null
  arrondissement?: string | null
  description?: string | null
  shortDescription?: string | null
  cuisine?: string | null
  cuisineType?: string | null
  priceLevel?: number | string | null
  price_level?: number | string | null
  priceRange?: number | string | null
  distinctions?: unknown[] | null
  distinction?: unknown | null
  badges?: unknown[] | null
  stars?: number | string | null
  bib?: boolean | null
  greenStar?: boolean | null
  key?: boolean | null
}

export type RestaurantDetails = {
  id: string
  name: string
  city: string | null
  area: string | null
  description: string | null
  cuisine: string | null
  priceLevel: 1 | 2 | 3 | 4
  distinctions: RestaurantDistinction[]
}

function toPriceLevel(value: number | string | null | undefined): 1 | 2 | 3 | 4 {
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 4) {
    return parsed as 1 | 2 | 3 | 4
  }

  return 2
}

function toDistinction(value: string): RestaurantDistinction | null {
  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, '-')

  switch (normalized) {
    case 'star':
    case 'stars':
    case 'etoile':
    case 'étoile':
      return 'star'
    case 'bib':
    case 'bib-gourmand':
      return 'bib'
    case 'green-star':
    case 'greenstar':
      return 'green-star'
    case 'key':
    case 'michelin-key':
      return 'key'
    default:
      return null
  }
}

function toDistinctionLabel(value: unknown): string | null {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null && 'type' in value) {
    const maybeType = value.type
    if (typeof maybeType === 'string') {
      return maybeType
    }
  }

  return null
}

function toDistinctions(data: RestaurantDetailsResponse): RestaurantDistinction[] {
  const distinctions = new Set<RestaurantDistinction>()

  for (const source of [data.distinctions ?? [], data.badges ?? []]) {
    for (const rawDistinction of source) {
      const label = toDistinctionLabel(rawDistinction)
      if (!label) {
        continue
      }

      const parsed = toDistinction(label)
      if (parsed) {
        distinctions.add(parsed)
      }
    }
  }

  const singleDistinction = toDistinctionLabel(data.distinction)
  if (singleDistinction) {
    const parsed = toDistinction(singleDistinction)
    if (parsed) {
      distinctions.add(parsed)
    }
  }

  if (Number(data.stars) > 0) {
    distinctions.add('star')
  }
  if (data.bib) {
    distinctions.add('bib')
  }
  if (data.greenStar) {
    distinctions.add('green-star')
  }
  if (data.key) {
    distinctions.add('key')
  }

  return [...distinctions]
}

export async function getRestaurantById(restaurantId: string | number): Promise<RestaurantDetails> {
  const { data } = await apiClient.get<RestaurantDetailsResponse>(`/api/v1/restaurants/${restaurantId}`)

  return {
    id: String(data.id),
    name: data.name,
    city: data.city ?? null,
    area: data.area ?? data.district ?? data.neighborhood ?? data.arrondissement ?? null,
    description: data.description ?? data.shortDescription ?? null,
    cuisine: data.cuisine ?? data.cuisineType ?? null,
    priceLevel: toPriceLevel(data.priceLevel ?? data.price_level ?? data.priceRange),
    distinctions: toDistinctions(data),
  }
}
