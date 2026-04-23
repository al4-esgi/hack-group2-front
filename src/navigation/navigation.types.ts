import { AppRoutes } from '../constants/routes.constant'

export type RootStackParamList = {
  [AppRoutes.ROOT]: undefined
  [AppRoutes.LOGIN]: undefined
  [AppRoutes.REGISTER]: undefined
  [AppRoutes.AUTH_CALLBACK]:
    | {
        jwt?: string
        token?: string
        access_token?: string
      }
    | undefined
  [AppRoutes.NOT_FOUND]: undefined
}
