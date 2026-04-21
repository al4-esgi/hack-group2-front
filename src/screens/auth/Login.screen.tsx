import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppRoutes } from '../../constants/routes.constant'
import { useAuthStore } from '../../stores/auth.store'
import type { RootStackParamList } from '../../navigation/navigation.types'

type Props = NativeStackScreenProps<RootStackParamList, typeof AppRoutes.LOGIN>

export default function Login({ navigation }: Props) {
  const { t } = useTranslation(['auth'])
  const setToken = useAuthStore((state) => state.setToken)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login.title', { ns: 'auth' })}</Text>
      <Text style={styles.subtitle}>{t('login.subtitle', { ns: 'auth' })}</Text>

      <Pressable style={styles.primaryButton} onPress={() => setToken('demo-token')}>
        <Text style={styles.primaryButtonLabel}>{t('login.submit', { ns: 'auth' })}</Text>
      </Pressable>

      <Pressable style={styles.linkButton} onPress={() => navigation.navigate(AppRoutes.REGISTER)}>
        <Text style={styles.linkLabel}>
          {t('login.noAccount', { ns: 'auth' })} {t('login.register', { ns: 'auth' })}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 24,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#111111',
  },
  primaryButtonLabel: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkLabel: {
    color: '#222222',
    textAlign: 'center',
  },
})
