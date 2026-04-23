import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '@/src/app/theme/tokens'

type EditorialCardProps = {
  title: string
  description: string
  eyebrow?: string
  onPress?: () => void
}

export function EditorialCard({ title, description, eyebrow, onPress }: EditorialCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
    >
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.linkRow}>
        <Text style={styles.link}>Lire la suite</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSubtle,
    padding: 12,
    gap: 6,
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  linkRow: {
    marginTop: 2,
  },
  link: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.primary,
    fontWeight: '600',
  },
})
