import { useQuery } from '@tanstack/react-query'
import { StaleTimes } from '../constants/query.constant'
import { hotelApi } from '../api/hotels'

export function useAmenities(q?: string, limit?: number, enabled = true) {
  return useQuery({
    queryKey: ['hotels', 'filters', 'amenities', q, limit],
    queryFn: () => hotelApi.getAmenities(q, limit),
    enabled,
    staleTime: StaleTimes.THIRTY_MINUTES,
  })
}

export function useHotelDetail(hotelId: number, enabled = true) {
  return useQuery({
    queryKey: ['hotels', 'hotel', hotelId],
    queryFn: () => hotelApi.getById(hotelId),
    enabled: enabled && !!hotelId,
    staleTime: StaleTimes.THIRTY_MINUTES,
  })
}