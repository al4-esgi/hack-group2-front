import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radius } from '@/src/app/theme/tokens'
import { DistinctionBadge, type DistinctionType } from './DistinctionBadge'
import { FavoriteButton } from './FavoriteButton'
import { LocationMeta } from './LocationMeta'
import { PriceRange } from './PriceRange'

type RestaurantCardProps = {
  name: string
  description?: string
  cuisine?: string
  city: string
  area?: string
  priceLevel?: 1 | 2 | 3 | 4
  distinctions?: DistinctionType[]
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onPress?: () => void
}

export function RestaurantCard({
  name,
  description,
  cuisine,
  city,
  area,
  priceLevel = 2,
  distinctions = [],
  isFavorite = false,
  onToggleFavorite,
  onPress,
}: RestaurantCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={name}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        {onToggleFavorite ? (
          <FavoriteButton active={isFavorite} onPress={onToggleFavorite} />
        ) : null}
      </View>
      <View style={styles.badges}>
        {distinctions.map((badge) => (
          <DistinctionBadge key={`${name}-${badge}`} type={badge} />
        ))}
      </View>
      {cuisine ? <Text style={styles.meta}>{cuisine}</Text> : null}
      <LocationMeta city={city} area={area} />
      <PriceRange level={priceLevel} />
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundPrimary,
    padding: 12,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    minHeight: 24,
    alignItems: 'center',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
})
