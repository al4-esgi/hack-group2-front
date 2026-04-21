import { createBrowserRouter } from 'react-router'
import RootLayout from '../layouts/RootLayout'
import ProtectedLayout from '../layouts/ProtectedLayout'
import NotFound from '../screens/NotFound.screen'
import commonRoutes from './common.routes'
import authRoutes from './auth.routes'
import protectedRoutes from './protected.routes'

const appRouter = createBrowserRouter([
  {
    Component: RootLayout,
    HydrateFallback: () => null,
    children: [
      ...commonRoutes,
      ...authRoutes,
      {
        Component: ProtectedLayout,
        children: protectedRoutes,
      },
      { path: '*', Component: NotFound },
    ],
  },
])

export default appRouter
