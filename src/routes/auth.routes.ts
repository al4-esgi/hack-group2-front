import { lazy } from 'react'
import type { RouteObject } from 'react-router'
import { AppRoutes } from '../constants/routes.constant'

const Login = lazy(() => import('@/screens/auth/Login.screen'))
const Register = lazy(() => import('@/screens/auth/Register.screen'))

const authRoutes: RouteObject[] = [
  { path: AppRoutes.LOGIN, Component: Login },
  { path: AppRoutes.REGISTER, Component: Register },
]

export default authRoutes
