import { Suspense, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { StaleTimes } from './src/constants/query.constant'
import AppNavigator from './src/navigation/AppNavigator'
import { navigationRef } from './src/navigation/navigation.service'
import './src/i18n/config'
import './src/i18n/types'
import { useAuthStore } from './src/stores/auth.store'

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import '@/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: StaleTimes.FIVE_MINUTES,
    },
  },
})

function Loader() {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" />
    </View>
  )
}

export default function App() {
  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated())

  useEffect(() => {
    const unsubHydrate = useAuthStore.persist.onHydrate(() => setHasHydrated(false))
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true))

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  if (!hasHydrated) {
    return <Loader />
  }

  return (
    <GluestackUIProvider mode="system">
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loader />}>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </Suspense>
      </QueryClientProvider>
    </GluestackUIProvider>
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
