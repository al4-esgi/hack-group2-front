import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppRoutes } from '../constants/routes.constant'
import HomeScreen from '../screens/Home.screen'
import IntroScreen from '../screens/Intro.screen'
import NotFoundScreen from '../screens/NotFound.screen'
import LoginScreen from '../screens/auth/Login.screen'
import RegisterScreen from '../screens/auth/Register.screen'
import { useAuthStore } from '../stores/auth.store'
import type { RootStackParamList } from './navigation.types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Stack.Navigator initialRouteName={AppRoutes.ROOT}>
      <Stack.Screen
        name={AppRoutes.ROOT}
        component={IntroScreen}
        options={{
          headerTitle: 'Accueil',
        }}
      />
      {isAuthenticated ? (
        <Stack.Screen
          name={AppRoutes.HOME}
          component={HomeScreen}
          options={{
            headerTitle: 'Accueil',
          }}
        />
      ) : (
        <>
          <Stack.Screen
            name={AppRoutes.LOGIN}
            component={LoginScreen}
            options={{
              headerTitle: 'Connexion',
            }}
          />
          <Stack.Screen
            name={AppRoutes.REGISTER}
            component={RegisterScreen}
            options={{
              headerTitle: 'Inscription',
            }}
          />
        </>
      )}
      <Stack.Screen
        name={AppRoutes.NOT_FOUND}
        component={NotFoundScreen}
        options={{
          headerTitle: '404',
        }}
      />
    </Stack.Navigator>
  )
}
