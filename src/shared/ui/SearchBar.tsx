import { Pressable, StyleSheet, View } from 'react-native'
import { TextField } from './TextField'
import { colors } from '@/src/app/theme/tokens'

type SearchBarProps = {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  onClear?: () => void
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rechercher...',
  onClear,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextField
        label="Recherche"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.trim() && onClear ? (
        <Pressable style={styles.clearButton} onPress={onClear} accessibilityLabel="Effacer la recherche">
          <View style={styles.clearLine} />
          <View style={[styles.clearLine, styles.clearLineInverse]} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    right: 14,
    top: 38,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLine: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  clearLineInverse: {
    transform: [{ rotate: '-45deg' }],
  },
})
