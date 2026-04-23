import { useCallback, useRef, useState } from 'react'
import { FlatList, StyleSheet, View, type ViewToken } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRestaurantById, type RestaurantDetails } from '@/src/api/restaurants.api'
import { getCurrentUser, getUserListRestaurantsByName, type UserListRestaurant } from '@/src/api/users.api'
import { colors } from '@/src/app/theme/tokens'
import { StaleTimes } from '@/src/constants/query.constant'
import { useAuthStore } from '@/src/stores/auth.store'
import { EmptyState, ErrorState, LoadingState, PageHeader, RestaurantCard, Screen } from '@/src/shared/ui'

type SavedScreenProps = {
  isAuthenticated: boolean
  onRequestLogin: () => void
}

function getAreaFromAddress(address: string | null) {
  if (!address) {
    return undefined
  }

  const segments = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (segments.length >= 2) {
    return segments[1]
  }

  return segments[0]
}

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 10 }

export default function SavedScreen({ isAuthenticated, onRequestLogin }: SavedScreenProps) {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()
  const inFlightDetails = useRef(new Set<string>())
  const failedDetails = useRef(new Set<string>())
  const [restaurantDetailsById, setRestaurantDetailsById] = useState<Record<string, RestaurantDetails>>({})

  const prefetchRestaurantDetails = useCallback(async (restaurantIds: string[]) => {
    const uniqueRestaurantIds = [...new Set(restaurantIds)]

    const tasks = uniqueRestaurantIds.map(async (restaurantId) => {
      if (inFlightDetails.current.has(restaurantId)) {
        return
      }
      if (failedDetails.current.has(restaurantId)) {
        return
      }

      const cachedDetail = queryClient.getQueryData<RestaurantDetails>(['restaurant-details', restaurantId])
      if (cachedDetail) {
        setRestaurantDetailsById((prev) => {
          if (prev[restaurantId]) {
            return prev
          }

          return { ...prev, [restaurantId]: cachedDetail }
        })
        return
      }

      inFlightDetails.current.add(restaurantId)

      try {
        const detail = await queryClient.fetchQuery({
          queryKey: ['restaurant-details', restaurantId],
          queryFn: () => getRestaurantById(restaurantId),
          staleTime: StaleTimes.FIVE_MINUTES,
        })

        setRestaurantDetailsById((prev) => {
          if (prev[restaurantId]) {
            return prev
          }

          return { ...prev, [restaurantId]: detail }
        })
      } catch {
        failedDetails.current.add(restaurantId)
        // If details are unavailable, we keep the card with base list data.
      } finally {
        inFlightDetails.current.delete(restaurantId)
      }
    })

    await Promise.all(tasks)
  }, [queryClient])

  const {
    data: currentUser,
    isLoading: isCurrentUserLoading,
    isError: isCurrentUserError,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: ['current-user', token],
    queryFn: getCurrentUser,
    enabled: isAuthenticated && Boolean(token),
    staleTime: StaleTimes.FIVE_MINUTES,
  })

  const {
    data: likedList,
    isLoading: isLikedLoading,
    isError: isLikedError,
    refetch: refetchLikedList,
  } = useQuery({
    queryKey: ['saved-liked-list', currentUser?.id],
    queryFn: () => getUserListRestaurantsByName(currentUser!.id, 'liked'),
    enabled: isAuthenticated && Boolean(token) && Boolean(currentUser?.id),
    staleTime: StaleTimes.ONE_MINUTE,
  })

  const likedRestaurants = likedList?.restaurants

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken<UserListRestaurant>> }) => {
      const restaurants = likedRestaurants ?? []
      const restaurantIdsToPrefetch: string[] = []

      for (const viewableItem of viewableItems) {
        const current = viewableItem.item
        if (!current) {
          continue
        }

        restaurantIdsToPrefetch.push(current.id)

        if (typeof viewableItem.index === 'number') {
          const next = restaurants[viewableItem.index + 1]
          if (next) {
            restaurantIdsToPrefetch.push(next.id)
          }
        }
      }

      if (restaurantIdsToPrefetch.length > 0) {
        void prefetchRestaurantDetails(restaurantIdsToPrefetch)
      }
    },
    [likedRestaurants, prefetchRestaurantDetails],
  )

  if (!isAuthenticated) {
    return (
      <Screen scrollable>
        <PageHeader title="Saved" subtitle="Retrouve tes adresses mises de côté." />
        <EmptyState
          title="Connexion requise"
          description="Connecte-toi pour accéder à tes favoris."
          actionLabel="Se connecter"
          onAction={onRequestLogin}
        />
      </Screen>
    )
  }

  const isLoading = isCurrentUserLoading || isLikedLoading

  return (
    <Screen>
      <View style={styles.container}>
        <PageHeader title="Saved" subtitle="Tes restaurants favoris." />

        {isLoading ? <LoadingState label="Chargement des favoris..." /> : null}
        {isCurrentUserError ? (
          <ErrorState message="Impossible de charger ton profil." onRetry={() => void refetchCurrentUser()} />
        ) : null}
        {isLikedError ? (
          <ErrorState message="Impossible de charger la liste des favoris." onRetry={() => void refetchLikedList()} />
        ) : null}

        {!isLoading && !isCurrentUserError && !isLikedError ? (
          <FlatList
            data={likedRestaurants ?? []}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={VIEWABILITY_CONFIG}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={5}
            renderItem={({ item }) => {
              const details = restaurantDetailsById[item.id]

              return (
                <RestaurantCard
                  name={details?.name ?? item.name}
                  city={details?.city ?? item.city ?? item.country ?? 'Ville inconnue'}
                  area={details?.area ?? getAreaFromAddress(item.address)}
                  cuisine={details?.cuisine ?? undefined}
                  description={details?.description ?? undefined}
                  distinctions={details?.distinctions ?? []}
                  priceLevel={details?.priceLevel ?? 2}
                />
              )
            }}
            ListEmptyComponent={
              <EmptyState
                title="Aucun favori"
                description="Ajoute des restaurants à la liste liked pour les retrouver ici."
              />
            }
          />
        ) : null}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: colors.backgroundPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
})
