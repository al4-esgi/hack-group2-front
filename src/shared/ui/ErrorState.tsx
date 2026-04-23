import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radius } from '@/src/app/theme/tokens'
import { SecondaryButton } from './ActionButtons'

type ErrorStateProps = {
  message: string
  retryLabel?: string
  onRetry?: () => void
}

export function ErrorState({ message, retryLabel = 'Réessayer', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <SecondaryButton label={retryLabel} onPress={onRetry} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(189, 35, 51, 0.05)',
    gap: 10,
    padding: 12,
  },
  message: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
})
