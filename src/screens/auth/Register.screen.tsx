import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { colors } from '@/src/app/theme/tokens'
import { AppRoutes } from '@/src/constants/routes.constant'
import type { RootStackParamList } from '@/src/navigation/navigation.types'
import { PageHeader, PrimaryButton, Screen, TertiaryButton, TextField } from '@/src/shared/ui'

type Props = NativeStackScreenProps<RootStackParamList, typeof AppRoutes.REGISTER>

export default function Register({ navigation }: Props) {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Screen scrollable edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <PageHeader title={t('register.title')} subtitle={t('register.subtitle')} />

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          helperText="La création de compte sera branchée à l'API backend."
          keyboardType="email-address"
        />
        <TextField
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton label={t('register.submit')} onPress={() => navigation.navigate(AppRoutes.LOGIN)} />

        <TertiaryButton
          label={`${t('register.hasAccount')} ${t('register.login')}`}
          onPress={() => navigation.navigate(AppRoutes.LOGIN)}
          style={styles.linkButton}
          textStyle={styles.linkLabel}
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
  linkButton: {
    paddingVertical: 8,
    alignSelf: 'center',
  },
  linkLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
})
