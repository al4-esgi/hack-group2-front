import { useEffect } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppRoutes } from '@/src/constants/routes.constant'
import type { RootStackParamList } from '@/src/navigation/navigation.types'
import { useAuthStore } from '@/src/stores/auth.store'
import { LoadingState, Screen } from '@/src/shared/ui'

type Props = NativeStackScreenProps<RootStackParamList, typeof AppRoutes.AUTH_CALLBACK>

export default function AuthCallbackScreen({ navigation, route }: Props) {
  const setToken = useAuthStore((state) => state.setToken)

  useEffect(() => {
    const jwt = route.params?.jwt ?? route.params?.token ?? route.params?.access_token

    if (jwt) {
      setToken(jwt)
      navigation.replace(AppRoutes.ROOT)
      return
    }

    navigation.replace(AppRoutes.LOGIN)
  }, [navigation, route.params, setToken])

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']} contentContainerStyle={{ justifyContent: 'center', padding: 16 }}>
      <LoadingState label="Connexion en cours..." />
    </Screen>
  )
}
