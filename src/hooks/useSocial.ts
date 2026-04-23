import { useQuery } from '@tanstack/react-query'
import { StaleTimes } from '../constants/query.constant'
import { tiktokScrapingApi, instagramScrapingApi } from '../api/social'
import type { HashtagSearchParams, UserSearchParams, TikTokPost, InstagramPost } from '../types/social.type'

export function useTikTokHashtags(params: HashtagSearchParams, enabled = true) {
  return useQuery<TikTok[]>({
    queryKey: ['tiktok', 'hashtags', params],
    queryFn: () => tiktokScrapingApi.searchByHashtags(params),
    enabled: enabled && Array.isArray(params.tags) && params.tags.length > 0,
    staleTime: StaleTimes.ONE_HOUR,
  })
}

export function useTikTokUsers(params: UserSearchParams, enabled = true) {
  return useQuery<TikTokPost[]>({
    queryKey: ['tiktok', 'users', params],
    queryFn: () => tiktokScrapingApi.searchByUsers(params),
    enabled: enabled && Array.isArray(params.usernames) && params.usernames.length > 0,
    staleTime: StaleTimes.ONE_HOUR,
  })
}

export function useInstagramHashtags(params: HashtagSearchParams, enabled = true) {
  return useQuery<InstagramPost[]>({
    queryKey: ['instagram', 'hashtags', params],
    queryFn: () => instagramScrapingApi.searchByHashtags(params),
    enabled: enabled && Array.isArray(params.tags) && params.tags.length > 0,
    staleTime: StaleTimes.ONE_HOUR,
  })
}

export function useInstagramUsers(params: UserSearchParams, enabled = true) {
  return useQuery<InstagramPost[]>({
    queryKey: ['instagram', 'users', params],
    queryFn: () => instagramScrapingApi.searchByUsers(params),
    enabled: enabled && Array.isArray(params.usernames) && params.usernames.length > 0,
    staleTime: StaleTimes.ONE_HOUR,
  })
}
