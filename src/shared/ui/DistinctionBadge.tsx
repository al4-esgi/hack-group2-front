import { StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '@/src/app/theme/tokens'

export type DistinctionType = 'star' | 'bib' | 'green-star' | 'key'

type DistinctionBadgeProps = {
  type: DistinctionType
}

const DISTINCTION_CONFIG: Record<
  DistinctionType,
  { label: string; icon: string; borderColor: string; backgroundColor: string; textColor: string }
> = {
  star: {
    label: 'Etoile',
    icon: '★',
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    textColor: colors.backgroundPrimary,
  },
  bib: {
    label: 'Bib Gourmand',
    icon: 'BIB',
    borderColor: colors.primary,
    backgroundColor: colors.backgroundPrimary,
    textColor: colors.primary,
  },
  'green-star': {
    label: 'Green Star',
    icon: '●',
    borderColor: colors.success,
    backgroundColor: 'rgba(132, 189, 0, 0.12)',
    textColor: colors.success,
  },
  key: {
    label: 'Michelin Key',
    icon: '◆',
    borderColor: colors.accent,
    backgroundColor: 'rgba(88, 44, 131, 0.12)',
    textColor: colors.accent,
  },
}

export function DistinctionBadge({ type }: DistinctionBadgeProps) {
  const config = DISTINCTION_CONFIG[type]

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={config.label}
      style={[styles.base, { borderColor: config.borderColor, backgroundColor: config.backgroundColor }]}
    >
      <Text style={[styles.label, { color: config.textColor }]}>{config.icon}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    minWidth: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
})
