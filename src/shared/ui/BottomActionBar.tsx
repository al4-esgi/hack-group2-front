import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { colors } from '@/src/app/theme/tokens'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type BottomActionBarProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export function BottomActionBar({ children, style }: BottomActionBarProps) {
  const insets = useSafeAreaInsets()

  return <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) + 8 }, style]}>{children}</View>
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
})
