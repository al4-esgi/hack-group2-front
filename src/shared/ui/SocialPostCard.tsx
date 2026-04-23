import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radius, spacing, typography } from '@/src/app/theme/tokens'
import { Badge } from './Badge'
import type { SocialPost, TikTokPost, InstagramPost } from '@/src/types/social.type'

export function SocialPostCard({ post, onPress }: SocialPostCardProps) {
  const isTikTok = 'playCount' in post
  const username = post.username
  const caption = post.caption
  const hashtags = post.hashtags
  const likesCount = post.likesCount
  const commentsCount = post.commentsCount
  const timestamp = post.timestamp
  const locationName = isTikTok ? post.locationName : post.locationName

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Post by ${username}`}
    >
      <View style={styles.content}>
        {/* Platform & Author */}
        <View style={styles.header}>
          <Badge 
            label={isTikTok ? 'TikTok' : 'Instagram'} 
            variant={isTikTok ? 'accent' : 'info'}
          />
          <Text style={styles.author} numberOfLines={1}>
            @{username}
          </Text>
        </View>

        {/* Content */}
        {caption && (
          <Text style={styles.textContent} numberOfLines={3}>
            {caption}
          </Text>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <Text style={styles.hashtags} numberOfLines={1}>
            {hashtags.map(tag => `#${tag}`).join(' ')}
          </Text>
        )}

        {/* Meta info */}
        <View style={styles.meta}>
          <Text style={styles.metaLabel}>
            {likesCount !== null && likesCount !== undefined ? `${likesCount.toLocaleString()} J` : '- J'}
          </Text>
          <Text style={styles.metaLabel}>
            {commentsCount !== null && commentsCount !== undefined ? `${commentsCount.toLocaleString()} C` : '- C'}
          </Text>
          {isTikTok && 'shareCount' in post && post.shareCount !== undefined && (
            <Text style={styles.metaLabel}>
              {post.shareCount.toLocaleString()} P
            </Text>
          )}
          {locationName && (
            <Text style={styles.metaLocation}>
              📍 {locationName}
            </Text>
          )}
        </View>

        {/* Date */}
        <Text style={styles.date}>
          {new Date(timestamp).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  content: {
    padding: spacing[3],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  author: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  textContent: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.subText,
    lineHeight: typography.lineHeight.subText,
  },
  hashtags: {
    color: colors.primary,
    fontSize: typography.fontSize.subText,
    fontWeight: typography.fontWeight.medium,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.small,
  },
  metaLocation: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.small,
    flex: 1,
    textAlign: 'right',
  },
  date: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.small,
    fontStyle: 'italic',
  },
})

type SocialPostCardProps = {
  post: SocialPost
  onPress?: () => void
}
