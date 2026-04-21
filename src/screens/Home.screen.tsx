import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/auth.store'

export default function Home() {
  const { t } = useTranslation(['home', 'common'])
  const clearToken = useAuthStore((state) => state.clearToken)
  const [count, setCount] = useState(0)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('hero.title', { ns: 'home' })}</Text>
      <Text style={styles.subtitle}>{t('hero.subtitle', { ns: 'home' })}</Text>

      <Pressable style={styles.primaryButton} onPress={() => setCount((value) => value + 1)}>
        <Text style={styles.primaryButtonLabel}>
          {t('hero.cta', { ns: 'home' })} ({count})
        </Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={clearToken}>
        <Text style={styles.secondaryButtonLabel}>{t('nav.logout', { ns: 'common' })}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
  subtitle: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 24,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#111111',
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#111111',
  },
  secondaryButtonLabel: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})
