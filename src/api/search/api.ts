import apiClient from '../axios'
import type {
  CityFilter,
  CountryFilter,
  GetSearchParams,
  SearchResponse,
} from '../../types/search.type'

export class SearchApi {
  async getSearch(params: GetSearchParams): Promise<SearchResponse> {
    const queryParams: Record<string, string | number | boolean> = {}

    queryParams.page = params.page || 1
    queryParams.pageSize = params.pageSize || 20

    if (params.sortBy) queryParams.sortBy = params.sortBy
    if (params.sortDirection) queryParams.sortDirection = params.sortDirection
    if (params.types?.length) queryParams.types = params.types.join(',')
    if (params.search) queryParams.search = params.search
    if (params.countryId) queryParams.countryId = params.countryId
    if (params.cityId) queryParams.cityId = params.cityId
    if (params.lat) queryParams.lat = params.lat
    if (params.lng) queryParams.lng = params.lng
    if (params.radiusKm) queryParams.radiusKm = params.radiusKm
    if (params.amenityIds?.length) queryParams.amenityIds = params.amenityIds.join(',')
    if (params.sustainableHotel != null) queryParams.sustainableHotel = params.sustainableHotel
    if (params.bookable != null) queryParams.bookable = params.bookable
    if (params.isPlus != null) queryParams.isPlus = params.isPlus
    if (params.distinction) queryParams.distinction = params.distinction
    if (params.cuisineIds?.length) queryParams.cuisineIds = params.cuisineIds.join(',')
    if (params.facilityIds?.length) queryParams.facilityIds = params.facilityIds.join(',')
    if (params.awardCode) queryParams.awardCode = params.awardCode
    if (params.minStars) queryParams.minStars = params.minStars
    if (params.maxStars) queryParams.maxStars = params.maxStars
    if (params.greenStar != null) queryParams.greenStar = params.greenStar
    if (params.minPriceLevel) queryParams.minPriceLevel = params.minPriceLevel
    if (params.maxPriceLevel) queryParams.maxPriceLevel = params.maxPriceLevel
    
    const response = await apiClient.get<SearchResponse>('/api/v1/search', {
      params: queryParams,
    })
    return response.data
  }

  async getCountries(q?: string, limit?: number): Promise<CountryFilter[]> {
    return (
      await apiClient.get<CountryFilter[]>('/api/v1/search/filters/countries', {
        params: { q, limit },
      })
    ).data
  }

  async getCities(q?: string, limit?: number, countryId?: number): Promise<CityFilter[]> {
    return (
      await apiClient.get<CityFilter[]>('/api/v1/search/filters/cities', {
        params: { q, limit, countryId },
      })
    ).data
  }
}

export const searchApi = new SearchApi()
