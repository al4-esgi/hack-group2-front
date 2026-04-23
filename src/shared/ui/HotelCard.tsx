import { useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radius, shadow, spacing, typography } from '@/src/app/theme/tokens'
import { DistinctionBadge, HotelKeyBadge } from './DistinctionBadge'
import { FavoriteButton } from './FavoriteButton'
import type { Hotel } from '@/src/types/hotel.type'

type HotelCardProps = {
  hotel: Hotel
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onPress?: () => void
}

export function HotelCard({
  hotel,
  isFavorite = false,
  onToggleFavorite,
  onPress,
}: HotelCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={hotel.name}
    >
      {/* Image */}
      {hotel.mainImageUrl ? (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: hotel.mainImageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={2}>
              {hotel.name}
            </Text>
            {(hotel.city || hotel.country) && (
              <Text style={styles.location}>
                {hotel.city}{hotel.city && hotel.country ? ', ' : ''}{hotel.country}
              </Text>
            )}
          </View>
          {onToggleFavorite && (
            <FavoriteButton active={isFavorite} onPress={onToggleFavorite} />
          )}
        </View>

        {/* Distinctions */}
        {(hotel.distinctions || hotel.isPlus || hotel.sustainableHotel) && (
          <View style={styles.badges}>
            {hotel.distinctions && <HotelKeyBadge level={hotel.distinctions} />}
            {hotel.isPlus && <DistinctionBadge type="PLUS" />}
            {hotel.sustainableHotel && <DistinctionBadge type="SUSTAINABLE" />}
          </View>
        )}

        {/* Meta info */}
        <View style={styles.meta}>
          {hotel.distanceMeters !== null && hotel.distanceMeters !== undefined && (
            <Text style={styles.distance}>
              {(hotel.distanceMeters / 1000).toFixed(1)} km
            </Text>
          )}
          {hotel.bookable && (
            <View style={styles.bookableBadge}>
              <Text style={styles.bookableText}>Réservable</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {hotel.content ? (
          <View style={styles.descriptionContainer}>
            <Text 
              style={styles.description} 
              numberOfLines={expanded ? undefined : 2}
            >
              {hotel.content}
            </Text>
            {hotel.content.length > 100 && (
              <Pressable 
                onPress={() => setExpanded(!expanded)}
                hitSlop={8}
              >
                <Text style={styles.readMore}>
                  {expanded ? 'Voir moins' : 'Lire la suite'}
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: colors.backgroundSubtle,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: spacing[3],
    gap: spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  titleContainer: {
    flex: 1,
    gap: spacing[1],
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
  },
  location: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.small,
    lineHeight: typography.lineHeight.small,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  distance: {
    color: colors.accent,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
  },
  bookableBadge: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  bookableText: {
    color: colors.backgroundPrimary,
    fontSize: typography.fontSize.small - 2,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    gap: spacing[1],
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.subText,
    lineHeight: typography.lineHeight.subText,
  },
  readMore: {
    color: colors.accent,
    fontSize: typography.fontSize.subText,
    fontWeight: typography.fontWeight.medium,
  },
})