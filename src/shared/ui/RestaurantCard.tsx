import { useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radius, shadow, spacing, typography } from '@/src/app/theme/tokens'
import { DistinctionBadge } from './DistinctionBadge'
import { FavoriteButton } from './FavoriteButton'
import { PriceRange } from './PriceRange'
import type { Restaurant } from '@/src/types/restaurant.type'

export function RestaurantCard({
  restaurant,
  isFavorite = false,
  onToggleFavorite,
  onPress,
}: RestaurantCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={restaurant.name}
    >
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={2}>
              {restaurant.name}
            </Text>
            {(restaurant.city || restaurant.country) && (
              <Text style={styles.location}>
                {restaurant.city}{restaurant.city && restaurant.country ? ', ' : ''}{restaurant.country}
              </Text>
            )}
          </View>
          {onToggleFavorite && (
            <FavoriteButton active={isFavorite} onPress={onToggleFavorite} />
          )}
        </View>

        {/* Award & Price Row */}
        <View style={styles.awardRow}>
          {restaurant.awardCode && (
            <DistinctionBadge 
              type={restaurant.awardCode} 
              stars={restaurant.stars} 
            />
          )}
          {restaurant.hasGreenStar && (
            <DistinctionBadge type="GREEN_STAR" />
          )}
          <PriceRange level={restaurant.priceLevel as 1|2|3|4} />
        </View>

        {/* Cuisines */}
        {restaurant.cuisines.length > 0 && (
          <Text style={styles.cuisines} numberOfLines={1}>
            {restaurant.cuisines.join(' · ')}
          </Text>
        )}

        {/* Meta info */}
        <View style={styles.meta}>
          {restaurant.distanceMeters !== null && restaurant.distanceMeters !== undefined && (
            <Text style={styles.distance}>
              {(restaurant.distanceMeters / 1000).toFixed(1)} km
            </Text>
          )}
        </View>

        {/* Description */}
        {restaurant.description ? (
          <View style={styles.descriptionContainer}>
            <Text 
              style={styles.description} 
              numberOfLines={expanded ? undefined : 2}
            >
              {restaurant.description}
            </Text>
            {restaurant.description.length > 100 && (
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
  awardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cuisines: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.subText,
    lineHeight: typography.lineHeight.subText,
    fontStyle: 'italic',
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