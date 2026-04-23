import { StyleSheet, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, spacing, typography } from '@/src/app/theme/tokens'

type SearchBarProps = {
  value: string
  onChangeText: (text: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
}

export function SearchBar({ value, onChangeText, onFocus, onBlur, placeholder }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  icon: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
    padding: 0,
  },
})