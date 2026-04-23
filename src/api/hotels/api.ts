import { AmenityFilter, HotelDetail } from '@/src/types/hotel.type'
import apiClient from '../axios'

export class HotelApi {
  async getAmenities(q?: string, limit?: number): Promise<AmenityFilter[]> {
    return (
      await apiClient.get<AmenityFilter[]>('/api/v1/hotels/filters/amenities', {
        params: { q, limit },
      })
    ).data
  }

  async getById(hotelId: number): Promise<HotelDetail> {
    return (await apiClient.get<HotelDetail>(`/api/v1/hotels/${hotelId}`)).data
  }
}

export const hotelApi = new HotelApi()