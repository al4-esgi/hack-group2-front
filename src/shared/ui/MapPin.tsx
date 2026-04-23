import { StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '@/src/app/theme/tokens'

type MapPinProps = {
  label: string
  variant?: 'default' | 'muted' | 'active'
}

export function MapPin({ label, variant = 'default' }: MapPinProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'default' ? styles.defaultPin : undefined,
        variant === 'muted' ? styles.mutedPin : undefined,
        variant === 'active' ? styles.activePin : undefined,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultPin: {
    backgroundColor: colors.textPrimary,
  },
  mutedPin: {
    backgroundColor: colors.textSecondary,
  },
  activePin: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.backgroundPrimary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
})
