import { Pressable, StyleSheet, Text } from 'react-native'
import { colors, radius } from '@/src/app/theme/tokens'

type FavoriteButtonProps = {
  active: boolean
  onPress: () => void
}

export function FavoriteButton({ active, onPress }: FavoriteButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      style={[styles.button, active ? styles.active : undefined]}
    >
      <Text style={[styles.icon, active ? styles.activeIcon : undefined]}>{active ? '♥' : '♡'}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(189, 35, 51, 0.08)',
  },
  icon: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },
  activeIcon: {
    color: colors.primary,
  },
})
