import type { ComponentProps, ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'
import { Button, ButtonText } from '@/components/ui/button'
import { colors, radius } from '@/src/app/theme/tokens'

type BaseButtonProps = {
  label: string
  onPress: () => void
  disabled?: boolean
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  accessibilityLabel?: string
  icon?: ReactNode
  action?: ComponentProps<typeof Button>['action']
  variant?: ComponentProps<typeof Button>['variant']
}

function AppButton({
  label,
  onPress,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
  icon,
  action,
  variant,
}: BaseButtonProps) {
  return (
    <Button
      action={action}
      variant={variant}
      size="md"
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.base, fullWidth ? styles.fullWidth : undefined, style]}
    >
      {icon}
      <ButtonText style={[styles.label, textStyle]}>{label}</ButtonText>
    </Button>
  )
}

type PrimaryButtonProps = Omit<BaseButtonProps, 'action' | 'variant'>

export function PrimaryButton(props: PrimaryButtonProps) {
  return <AppButton {...props} action="primary" variant="solid" textStyle={[styles.primaryLabel, props.textStyle]} />
}

type SecondaryButtonProps = Omit<BaseButtonProps, 'action' | 'variant'>

export function SecondaryButton({ style, textStyle, ...props }: SecondaryButtonProps) {
  return (
    <AppButton
      {...props}
      action="primary"
      variant="outline"
      style={[styles.secondary, style]}
      textStyle={[styles.secondaryLabel, textStyle]}
    />
  )
}

type TertiaryButtonProps = Omit<BaseButtonProps, 'action' | 'variant'> & {
  active?: boolean
}

export function TertiaryButton({
  active = false,
  style,
  textStyle,
  ...props
}: TertiaryButtonProps) {
  return (
    <AppButton
      {...props}
      action="default"
      variant="link"
      fullWidth={false}
      style={[styles.tertiary, style]}
      textStyle={[active ? styles.tertiaryActiveLabel : styles.tertiaryLabel, textStyle]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'none',
  },
  primaryLabel: {
    color: colors.backgroundPrimary,
  },
  secondary: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.backgroundPrimary,
  },
  secondaryLabel: {
    color: colors.primary,
  },
  tertiary: {
    minHeight: 32,
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  tertiaryLabel: {
    textTransform: 'none',
    letterSpacing: 0,
    color: colors.textSecondary,
    fontSize: 14,
  },
  tertiaryActiveLabel: {
    textTransform: 'none',
    letterSpacing: 0,
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})
