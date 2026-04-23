import { StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '@/src/app/theme/tokens'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent' | 'info'

type BadgeProps = {
  label: string
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: {
    bg: 'rgba(83, 86, 90, 0.08)',
    text: colors.textSecondary,
    border: colors.borderSubtle,
  },
  success: {
    bg: 'rgba(132, 189, 0, 0.12)',
    text: colors.success,
    border: colors.success,
  },
  warning: {
    bg: 'rgba(255, 193, 7, 0.12)',
    text: 'rgb(230, 150, 0)',
    border: 'rgb(230, 150, 0)',
  },
  error: {
    bg: 'rgba(189, 35, 51, 0.08)',
    text: colors.primary,
    border: colors.primary,
  },
  accent: {
    bg: 'rgba(88, 44, 131, 0.08)',
    text: colors.accent,
    border: colors.accent,
  },
  info: {
    bg: 'rgba(16, 149, 249, 0.08)',
    text: colors.info,
    border: colors.info,
  },
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const variantStyle = variantStyles[variant]

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: variantStyle.bg, borderColor: variantStyle.border },
      ]}
    >
      <Text style={[styles.label, { color: variantStyle.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
})