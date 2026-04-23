import { Pressable, StyleSheet, Text } from 'react-native'
import { colors, radius } from '@/src/app/theme/tokens'

type FilterChipProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onPress?: () => void
}

export function FilterChip({ label, active = false, disabled = false, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.base,
        active ? styles.active : styles.defaultState,
        disabled ? styles.disabled : undefined,
      ]}
    >
      <Text style={[styles.label, active ? styles.activeLabel : undefined]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  defaultState: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.backgroundPrimary,
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(189, 35, 51, 0.08)',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  activeLabel: {
    color: colors.primary,
  },
})
