import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { colors } from '@/src/app/theme/tokens'

type PageHeaderProps = {
  title: string
  subtitle?: string
  rightSlot?: ReactNode
  style?: StyleProp<ViewStyle>
}

export function PageHeader({ title, subtitle, rightSlot, style }: PageHeaderProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.texts}>
        <Heading style={styles.title}>{title}</Heading>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  texts: {
    flex: 1,
    gap: 4,
  },
  rightSlot: {
    marginTop: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 40,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
})
