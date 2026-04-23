import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/src/app/theme/tokens'

type ListHeaderProps = {
  title: string
  subtitle?: string
  actionLabel?: string
  onActionPress?: () => void
}

export function ListHeader({ title, subtitle, actionLabel, onActionPress }: ListHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} style={styles.action}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  action: {
    paddingVertical: 4,
  },
  actionLabel: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
})
