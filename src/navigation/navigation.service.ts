import { CommonActions, createNavigationContainerRef } from '@react-navigation/native'
import { AppRoutes } from '../constants/routes.constant'
import type { RootStackParamList } from './navigation.types'

export const navigationRef = createNavigationContainerRef<RootStackParamList>()

export function resetToLogin() {
  if (!navigationRef.isReady()) {
    return
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: AppRoutes.LOGIN }],
    }),
  )
}
