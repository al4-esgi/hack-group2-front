import type { ComponentProps } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radius } from '@/src/app/theme/tokens'

type TextFieldProps = {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  helperText?: string
  errorText?: string | null
} & Pick<
  ComponentProps<typeof TextInput>,
  'autoCapitalize' | 'autoCorrect' | 'secureTextEntry' | 'keyboardType' | 'textContentType'
>

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  errorText,
  autoCapitalize = 'none',
  autoCorrect = false,
  secureTextEntry,
  keyboardType,
  textContentType,
}: TextFieldProps) {
  const hasError = Boolean(errorText)

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        textContentType={textContentType}
        style={[styles.input, hasError ? styles.inputError : undefined]}
      />
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
      {!errorText && helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundPrimary,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  inputError: {
    borderColor: colors.primary,
  },
  helper: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.primary,
  },
})
