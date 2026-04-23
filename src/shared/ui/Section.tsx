import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { colors, radius } from '@/src/app/theme/tokens'

type SectionProps = {
  title?: string
  subtitle?: string
  children: ReactNode
  style?: StyleProp<ViewStyle>
  bordered?: boolean
}

export function Section({ title, subtitle, children, style, bordered = false }: SectionProps) {
  return (
    <View style={[styles.section, bordered ? styles.bordered : undefined, style]}>
      {title ? <Heading style={styles.title}>{title}</Heading> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 12,
    backgroundColor: colors.backgroundSubtle,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
})
