import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radius } from '@/src/app/theme/tokens'

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Chargement...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
})
