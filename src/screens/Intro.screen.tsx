import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { AppRoutes } from '../constants/routes.constant'
import { useAuthStore } from '../stores/auth.store'
import type { RootStackParamList } from '../navigation/navigation.types'

type Props = NativeStackScreenProps<RootStackParamList, typeof AppRoutes.ROOT>

export default function IntroScreen({ navigation }: Props) {
  const { t } = useTranslation(['home', 'auth'])
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('hero.title', { ns: 'home' })}</Text>
      <Text style={styles.subtitle}>{t('hero.subtitle', { ns: 'home' })}</Text>

      {isAuthenticated ? (
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate(AppRoutes.HOME)}>
          <Text style={styles.primaryLabel}>{t('hero.cta', { ns: 'home' })}</Text>
        </Pressable>
      ) : (
        <>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate(AppRoutes.LOGIN)}>
            <Text style={styles.primaryLabel}>{t('login.submit', { ns: 'auth' })}</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.navigate(AppRoutes.REGISTER)}
          >
            <Text style={styles.secondaryLabel}>{t('login.register', { ns: 'auth' })}</Text>
          </Pressable>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 20,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#111111',
  },
  primaryLabel: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#111111',
  },
  secondaryLabel: {
    textAlign: 'center',
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
})
