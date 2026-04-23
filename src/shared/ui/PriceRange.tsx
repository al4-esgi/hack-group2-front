import { StyleSheet, Text } from 'react-native'
import { colors } from '@/src/app/theme/tokens'

type PriceRangeProps = {
  level: 1 | 2 | 3 | 4
  currency?: string
}

export function PriceRange({ level, currency = '€' }: PriceRangeProps) {
  const active = currency.repeat(level)
  const inactive = currency.repeat(4 - level)

  return (
    <Text accessibilityLabel={`Niveau de prix ${level} sur 4`} style={styles.value}>
      {active}
      <Text style={styles.inactive}>{inactive}</Text>
    </Text>
  )
}

const styles = StyleSheet.create({
  value: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  inactive: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
})
