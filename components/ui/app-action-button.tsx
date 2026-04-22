import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'
import { colors, radius } from '@/src/app/theme/tokens'
import { Button, ButtonText } from '@/components/ui/button'

type AppActionButtonProps = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'tertiary'
  active?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export function AppActionButton({
  label,
  onPress,
  variant = 'primary',
  active = false,
  disabled = false,
  style,
  textStyle,
}: AppActionButtonProps) {
  const isPrimary = variant === 'primary'
  const isSecondary = variant === 'secondary'
  const isTertiary = variant === 'tertiary'

  return (
    <Button
      action="default"
      variant="solid"
      size="md"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.baseButton,
        isPrimary ? styles.primaryButton : undefined,
        isSecondary ? styles.secondaryButton : undefined,
        isTertiary ? (active ? styles.tertiaryButtonActive : styles.tertiaryButtonDefault) : undefined,
        style,
      ]}
    >
      <ButtonText
        style={[
          styles.baseLabel,
          isPrimary ? styles.primaryLabel : undefined,
          isSecondary ? styles.secondaryLabel : undefined,
          isTertiary ? (active ? styles.tertiaryLabelActive : styles.tertiaryLabelDefault) : undefined,
          textStyle,
        ]}
      >
        {label}
      </ButtonText>
    </Button>
  )
}

const styles = StyleSheet.create({
  baseButton: {
    width: '100%',
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.borderSubtle,
  },
  tertiaryButtonDefault: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    minHeight: 34,
    paddingHorizontal: 6,
  },
  tertiaryButtonActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    minHeight: 34,
    paddingHorizontal: 6,
  },
  baseLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  primaryLabel: {
    color: colors.backgroundPrimary,
  },
  secondaryLabel: {
    color: colors.textSecondary,
  },
  tertiaryLabelDefault: {
    color: colors.textPrimary,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 14,
  },
  tertiaryLabelActive: {
    color: colors.red,
    textDecorationLine: 'underline',
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 14,
  },
})
