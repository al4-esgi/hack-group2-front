import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation('notFound')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('title')}</Text>
      <Text style={styles.description}>{t('description')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
  description: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
  },
})
