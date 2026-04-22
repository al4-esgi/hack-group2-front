import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { useTranslation } from 'react-i18next'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppRoutes } from '../../constants/routes.constant'
import { useAuthStore } from '../../stores/auth.store'
import type { RootStackParamList } from '../../navigation/navigation.types'
import {
  buildWebAuthCallbackUrl,
  buildGoogleSsoUrl,
  extractJwtFromAuthCallbackUrl,
} from '../../utils/google-sso'

type Props = NativeStackScreenProps<RootStackParamList, typeof AppRoutes.LOGIN>

WebBrowser.maybeCompleteAuthSession()

export default function Login({ navigation }: Props) {
  const { t } = useTranslation(['auth'])
  const setToken = useAuthStore((state) => state.setToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handlePasswordLogin = () => {
    if (!email.trim() || !password.trim()) {
      return
    }

    Alert.alert('Connexion indisponible', 'La connexion email/password n’est pas encore branchée à l’API.')
  }

  const handleGoogleLogin = async () => {
    const redirectUri = buildWebAuthCallbackUrl(process.env.EXPO_PUBLIC_API_HOST)
    const googleSsoUrl = buildGoogleSsoUrl(process.env.EXPO_PUBLIC_API_HOST)
    if (!googleSsoUrl || !redirectUri) {
      Alert.alert('Configuration manquante', 'EXPO_PUBLIC_API_HOST est manquant.')
      return
    }

    const result = await WebBrowser.openAuthSessionAsync(googleSsoUrl, redirectUri)
    if (result.type !== 'success' || !result.url) {
      return
    }

    const jwt = extractJwtFromAuthCallbackUrl(result.url)
    if (!jwt) {
      Alert.alert('Erreur', 'JWT introuvable dans la callback Google.')
      return
    }

    setToken(jwt)
    navigation.replace(AppRoutes.ROOT)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login.title', { ns: 'auth' })}</Text>
      <Text style={styles.subtitle}>{t('login.subtitle', { ns: 'auth' })}</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t('login.email', { ns: 'auth' })}
        placeholderTextColor="#888888"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder={t('login.password', { ns: 'auth' })}
        placeholderTextColor="#888888"
        style={styles.input}
      />

      <Pressable style={styles.primaryButton} onPress={handlePasswordLogin}>
        <Text style={styles.primaryButtonLabel}>
          {t('login.submit', { ns: 'auth' })} (email/password)
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          void handleGoogleLogin()
        }}
      >
        <Text style={styles.secondaryButtonLabel}>Continuer avec Google</Text>
      </Pressable>

      <Pressable style={styles.registerButton} onPress={() => navigation.navigate(AppRoutes.REGISTER)}>
        <Text style={styles.registerLabel}>{t('login.register', { ns: 'auth' })}</Text>
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
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#ffffff',
    color: '#111111',
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
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#111111',
    backgroundColor: '#ffffff',
  },
  secondaryButtonLabel: {
    color: '#111111',
    textAlign: 'center',
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 6,
  },
  registerLabel: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
  },
})
