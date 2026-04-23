import { Suspense, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import {
  NavigationContainer,
  getStateFromPath as getNavigationStateFromPath,
  type LinkingOptions,
} from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree'
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import { StaleTimes } from './src/constants/query.constant'
import AppNavigator from './src/navigation/AppNavigator'
import { navigationRef } from './src/navigation/navigation.service'
import './src/i18n/config'
import './src/i18n/types'
import { AppRoutes } from './src/constants/routes.constant'
import type { RootStackParamList } from './src/navigation/navigation.types'
import { useAuthStore } from './src/stores/auth.store'

import '@/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: StaleTimes.FIVE_MINUTES,
      gcTime: StaleTimes.ONE_HOUR,
      refetchOnWindowFocus: false,
    },
  },
})

function normalizeDeepLinkPath(path: string): string {
  let normalizedPath = path.replace(/^\/+/, '')

  if (normalizedPath.startsWith('api/v1/')) {
    normalizedPath = normalizedPath.slice('api/v1/'.length)
  }

  const hashIndex = normalizedPath.indexOf('#')
  if (hashIndex !== -1) {
    const beforeHash = normalizedPath.slice(0, hashIndex)
    const afterHash = normalizedPath.slice(hashIndex + 1)
    normalizedPath = `${beforeHash}${beforeHash.includes('?') ? '&' : '?'}${afterHash}`
  }

  return normalizedPath
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['com.guidemichelin.front://', 'exp+guide-michelin://'],
  config: {
    screens: {
      [AppRoutes.ROOT]: '',
      [AppRoutes.LOGIN]: 'login',
      [AppRoutes.REGISTER]: 'register',
      [AppRoutes.AUTH_CALLBACK]: {
        path: 'auth/callback',
        parse: {
          jwt: (value: string) => value,
          token: (value: string) => value,
          access_token: (value: string) => value,
        },
      },
      [AppRoutes.NOT_FOUND]: '*',
    },
  },
  getStateFromPath: (path, options) => {
    const normalizedPath = normalizeDeepLinkPath(path)
    return getNavigationStateFromPath(normalizedPath, options)
  },
}

function Loader() {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" />
    </View>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Figtree: Figtree_400Regular,
    'Figtree-Medium': Figtree_500Medium,
    'Figtree-SemiBold': Figtree_600SemiBold,
    'Figtree-Bold': Figtree_700Bold,
  })

  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated())

  useEffect(() => {
    const unsubHydrate = useAuthStore.persist.onHydrate(() => setHasHydrated(false))
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true))

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  if (!fontsLoaded || !hasHydrated) {
    return <Loader />
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <GluestackUIProvider mode="light">
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<Loader />}>
            <NavigationContainer ref={navigationRef} linking={linking}>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </Suspense>
        </QueryClientProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
