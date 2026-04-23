import { PaginatedSocialPosts } from '@/src/types/social.type'
import type { HashtagSearchParams, UserSearchParams, TikTokPost, InstagramPost } from '@/src/types/social.type'
import apiClient from '../axios'

export class TikTokScrapingApi {
  async searchByHashtags(params: HashtagSearchParams): Promise<TikTokPost[]> {
    const response = await apiClient.get<TikTokPost[]>('/api/v1/tiktok-scraping/hashtags', {
      params: {
        tags: params.tags.join(','),
        city: params.city,
        addressContains: params.addressContains,
        locationRequired: params.locationRequired,
        limit: params.limit,
      },
    })
    return response.data
  }

  async searchByUsers(params: UserSearchParams): Promise<TikTokPost[]> {
    const response = await apiClient.get<TikTokPost[]>('/api/v1/tiktok-scraping/users', {
      params: {
        usernames: params.usernames.join(','),
        city: params.city,
        addressContains: params.addressContains,
        locationRequired: params.locationRequired,
        limit: params.limit,
      },
    })
    return response.data
  }
}

export class InstagramScrapingApi {
  async searchByHashtags(params: HashtagSearchParams): Promise<InstagramPost[]> {
    const response = await apiClient.get<InstagramPost[]>('/api/v1/instagram-scraping/hashtags', {
      params: {
        tags: params.tags.join(','),
        limit: params.limit,
        locationRequired: params.locationRequired,
      },
    })
    return response.data
  }

  async searchByUsers(params: UserSearchParams): Promise<InstagramPost[]> {
    const response = await apiClient.get<InstagramPost[]>('/api/v1/instagram-scraping/users', {
      params: {
        usernames: params.usernames.join(','),
        limit: params.limit,
        locationRequired: params.locationRequired,
      },
    })
    return response.data
  }
}

export const tiktokScrapingApi = new TikTokScrapingApi()
export const instagramScrapingApi = new InstagramScrapingApi()
