import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radius } from '@/src/app/theme/tokens'
import { DistinctionBadge } from './DistinctionBadge'
import { FavoriteButton } from './FavoriteButton'
import { LocationMeta } from './LocationMeta'
import { PriceRange } from './PriceRange'

type HotelCardProps = {
  name: string
  city: string
  area?: string
  description?: string
  priceLevel?: 1 | 2 | 3 | 4
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onPress?: () => void
}

export function HotelCard({
  name,
  city,
  area,
  description,
  priceLevel = 3,
  isFavorite = false,
  onToggleFavorite,
  onPress,
}: HotelCardProps) {
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
        <DistinctionBadge type="key" />
      </View>
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
  description: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
})
