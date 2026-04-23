import type { ReactNode } from 'react'
import type { Edge } from 'react-native-safe-area-context'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { colors } from '@/src/app/theme/tokens'

type ScreenProps = {
  children: ReactNode
  scrollable?: boolean
  edges?: Edge[]
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
}

export function Screen({
  children,
  scrollable = false,
  edges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
      {scrollable ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
})
