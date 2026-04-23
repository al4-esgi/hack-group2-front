import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { PrimaryButton, SecondaryButton, TertiaryButton } from '@/src/shared/ui'

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
  if (variant === 'primary') {
    return (
      <PrimaryButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        style={style}
        textStyle={textStyle}
      />
    )
  }

  if (variant === 'secondary') {
    return (
      <SecondaryButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        style={style}
        textStyle={textStyle}
      />
    )
  }

  return (
    <TertiaryButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      active={active}
      style={style}
      textStyle={textStyle}
    />
  )
}
