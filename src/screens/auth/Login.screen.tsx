import { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { useTranslation } from 'react-i18next'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { colors } from '@/src/app/theme/tokens'
import { AppRoutes } from '@/src/constants/routes.constant'
import type { RootStackParamList } from '@/src/navigation/navigation.types'
import { useAuthStore } from '@/src/stores/auth.store'
import {
  APP_AUTH_SESSION_RETURN_URL,
  buildGoogleSsoUrl,
  extractJwtFromAuthCallbackUrl,
} from '@/src/utils/google-sso'
import {
  PageHeader,
  PrimaryButton,
  Screen,
  SecondaryButton,
  TertiaryButton,
  TextField,
} from '@/src/shared/ui'

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
    const googleSsoUrl = buildGoogleSsoUrl(process.env.EXPO_PUBLIC_API_HOST)
    if (!googleSsoUrl) {
      Alert.alert('Configuration manquante', 'EXPO_PUBLIC_API_HOST est manquant.')
      return
    }

    const result = await WebBrowser.openAuthSessionAsync(googleSsoUrl, APP_AUTH_SESSION_RETURN_URL)
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
    <Screen scrollable edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <PageHeader
          title={t('login.title', { ns: 'auth' })}
          subtitle={t('login.subtitle', { ns: 'auth' })}
        />

        <TextField
          label={t('login.email', { ns: 'auth' })}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <TextField
          label={t('login.password', { ns: 'auth' })}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        <PrimaryButton
          label={`${t('login.submit', { ns: 'auth' })} (email/password)`}
          onPress={handlePasswordLogin}
        />

        <SecondaryButton
          label="Continuer avec Google"
          onPress={() => {
            void handleGoogleLogin()
          }}
        />

        <TertiaryButton
          label={t('login.register', { ns: 'auth' })}
          onPress={() => navigation.navigate(AppRoutes.REGISTER)}
          style={styles.registerButton}
          textStyle={styles.registerLabel}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  registerButton: {
    paddingVertical: 6,
    alignSelf: 'center',
  },
  registerLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
})
