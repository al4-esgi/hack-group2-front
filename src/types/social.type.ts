export interface TikTokPost {
  id: string
  username: string
  nickName: string
  caption: string | null
  url: string
  coverUrl: string
  isSlideshow: boolean
  slideshowImages: string[]
  hashtags: string[]
  likesCount: number
  commentsCount: number
  playCount: number
  shareCount: number
  collectCount: number
  timestamp: string
  locationName: string | null
  locationAddress: string | null
  locationCity: string | null
  musicName: string
  musicAuthor: string
  isPinned: boolean
}

export interface InstagramPost {
  id: string
  username: string
  fullName: string | null
  caption: string | null
  type: 'Image' | 'Video' | 'Sidecar'
  url: string
  displayUrl: string
  images: string[]
  hashtags: string[]
  likesCount: number | null
  commentsCount: number
  timestamp: string
  locationName: string | null
}

export type SocialPost = TikTokPost | InstagramPost

export interface HashtagSearchParams {
  tags: string[]
  limit: number
  city?: string
  addressContains?: string
  locationRequired?: boolean
}

export interface UserSearchParams {
  usernames: string[]
  limit: number
  city?: string
  addressContains?: string
  locationRequired?: boolean
}

export interface PaginatedSocialPosts {
  data: SocialPost[]
  meta: {
    currentPage: number
    totalItemsCount: number
    totalPagesCount: number
    itemsPerPage: number
  }
}
