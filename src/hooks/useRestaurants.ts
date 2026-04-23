import { useQuery } from '@tanstack/react-query'
import { StaleTimes } from '../constants/query.constant'
import { restaurantApi } from '../api/restaurants'
import type { CuisineFilter, FacilityFilter, RestaurantDetail } from '../types/restaurant.type'

export function useCuisines(q?: string, limit?: number, enabled = true) {
  return useQuery({
    queryKey: ['restaurants', 'filters', 'cuisines', q, limit],
    queryFn: () => restaurantApi.getCuisines(q, limit),
    enabled,
    staleTime: StaleTimes.THIRTY_MINUTES,
  })
}

export function useFacilities(q?: string, limit?: number, enabled = true) {
  return useQuery({
    queryKey: ['restaurants', 'filters', 'facilities', q, limit],
    queryFn: () => restaurantApi.getFacilities(q, limit),
    enabled,
    staleTime: StaleTimes.THIRTY_MINUTES,
  })
}

export function useRestaurantDetail(restaurantId: number, enabled = true) {
  return useQuery({
    queryKey: ['restaurants', 'restaurant', restaurantId],
    queryFn: () => restaurantApi.getById(restaurantId),
    enabled: enabled && !!restaurantId,
    staleTime: StaleTimes.THIRTY_MINUTES,
  })
}
