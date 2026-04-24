import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import * as Location from 'expo-location'
import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from '@maplibre/maplibre-react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { searchApi } from '../../api/search'
import { colors, radius } from '../../app/theme/tokens'
import { DistinctionBadge, MapPin, SecondaryButton } from '../../shared/ui'
import type { Restaurant } from '../../types/restaurant.type'
import { extractImageUrls } from '../../utils/entity-images'
import { resolveRestaurantDisplayName } from '../../utils/restaurant-display-name'
import { AddressPickerModal } from './map/AddressPickerModal'
import {
  INITIAL_REGION,
  OSM_DETAILED_STYLE,
  SHEET_COLLAPSED_HEIGHT,
} from './map/map.constants'
import {
  areCoordinatesClose,
  buildAppleMapsUrl,
  buildGoogleMapsUrl,
  buildRoutePoints,
  buildWazeUrl,
  fetchRoute,
  formatDuration,
  sampleRouteCoordinates,
  searchAddressCandidates,
  toBounds,
  toLngLat,
} from './map/map.services'
import type { Coordinate, RouteLocation, Stop } from './map/map.types'
import { useDraggableSheet } from './map/useDraggableSheet'

const SAMPLE_POINTS_COUNT = 3
const RESTAURANT_SEARCH_RADIUS_KM = 16
const RESTAURANT_SEARCH_PAGE_SIZE = 20
const MAX_SUGGESTED_STOPS = 10

type SuggestedStop = {
  id: string
  order: number
  coordinate: Coordinate
  restaurant: Restaurant
  distanceFromAnchorMeters: number | null
}

function parseCoordinate(value: string | number | null | undefined): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toRestaurantCoordinate(restaurant: Restaurant): Coordinate | null {
  const latitude = parseCoordinate(restaurant.latitude)
  const longitude = parseCoordinate(restaurant.longitude)

  if (latitude === null || longitude === null) {
    return null
  }

  return { latitude, longitude }
}

function formatDetour(distanceMeters: number | null) {
  if (distanceMeters === null) {
    return 'Proche du trajet'
  }

  if (distanceMeters < 1000) {
    return `Detour ${Math.round(distanceMeters)} m`
  }

  return `Detour ${(distanceMeters / 1000).toFixed(1)} km`
}

function buildSuggestedStops(
  sampledPoints: Coordinate[],
  restaurantsByPoint: Restaurant[][],
  maxSuggestions: number,
): SuggestedStop[] {
  if (maxSuggestions <= 0) {
    return []
  }

  const candidateGroups = sampledPoints.map((_, index) =>
    (restaurantsByPoint[index] ?? [])
      .map((restaurant) => {
        const coordinate = toRestaurantCoordinate(restaurant)
        if (!coordinate) {
          return null
        }

        return { restaurant, coordinate }
      })
      .filter((item): item is { restaurant: Restaurant; coordinate: Coordinate } => item !== null),
  )

  const usedRestaurantIds = new Set<number>()
  const cursorByGroup = candidateGroups.map(() => 0)
  const picked: SuggestedStop[] = []

  while (picked.length < maxSuggestions) {
    let didPickInPass = false

    for (let groupIndex = 0; groupIndex < candidateGroups.length && picked.length < maxSuggestions; groupIndex += 1) {
      const group = candidateGroups[groupIndex]
      let cursor = cursorByGroup[groupIndex]

      while (cursor < group.length && usedRestaurantIds.has(group[cursor].restaurant.id)) {
        cursor += 1
      }

      cursorByGroup[groupIndex] = cursor
      if (cursor >= group.length) {
        continue
      }

      const candidate = group[cursor]
      cursorByGroup[groupIndex] += 1
      usedRestaurantIds.add(candidate.restaurant.id)

      picked.push({
        id: `route-stop-${picked.length + 1}-${candidate.restaurant.id}`,
        order: picked.length + 1,
        coordinate: candidate.coordinate,
        restaurant: candidate.restaurant,
        distanceFromAnchorMeters: candidate.restaurant.distanceMeters ?? null,
      })
      didPickInPass = true
    }

    if (!didPickInPass) {
      break
    }
  }

  return picked
}

function getSheetTitle(activeRoute: boolean, count: number) {
  if (!activeRoute) {
    return 'Planifie ton itineraire'
  }

  if (count <= 1) {
    return `${count} suggestion sur le trajet`
  }

  return `${count} suggestions sur le trajet`
}

export default function MapScreen() {
  const { height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { sheetAnimatedStyle, sheetGesture } = useDraggableSheet({
    windowHeight,
    collapsedHeight: SHEET_COLLAPSED_HEIGHT,
  })

  const cameraRef = useRef<CameraRef | null>(null)
  const routeAbortControllerRef = useRef<AbortController | null>(null)
  const routeRequestIdRef = useRef(0)

  const [isMapReady, setIsMapReady] = useState(false)
  const [origin, setOrigin] = useState<RouteLocation | null>(null)
  const [destination, setDestination] = useState<RouteLocation | null>(null)
  const [activeRoute, setActiveRoute] = useState<{
    origin: RouteLocation
    destination: RouteLocation
  } | null>(null)

  const [pickerTarget, setPickerTarget] = useState<'origin' | 'destination' | null>(null)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressCandidates, setAddressCandidates] = useState<RouteLocation[]>([])
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false)
  const [addressSearchError, setAddressSearchError] = useState<string | null>(null)
  const [isCurrentLocationLoading, setIsCurrentLocationLoading] = useState(false)

  const [sampledRoutePoints, setSampledRoutePoints] = useState<Coordinate[]>([])
  const [suggestedStops, setSuggestedStops] = useState<SuggestedStop[]>([])
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([])

  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([])
  const [routeDurationSeconds, setRouteDurationSeconds] = useState<number | null>(null)
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const [isStopsLoading, setIsStopsLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [stopsError, setStopsError] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  const routeStops = useMemo<Stop[]>(
    () =>
      suggestedStops.map((stop) => ({
        id: stop.id,
        name: resolveRestaurantDisplayName(stop.restaurant),
        city: stop.restaurant.city,
        detour: formatDetour(stop.distanceFromAnchorMeters),
        coordinate: stop.coordinate,
        order: stop.order,
      })),
    [suggestedStops],
  )

  const selectedStops = useMemo(
    () =>
      routeStops
        .filter((stop) => selectedStopIds.includes(stop.id))
        .sort((a, b) => a.order - b.order),
    [routeStops, selectedStopIds],
  )

  const routeFeature = useMemo(
    () => (routeCoordinates.length >= 2
      ? {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: routeCoordinates.map(toLngLat),
          },
          properties: {},
        }
      : null),
    [routeCoordinates],
  )

  const clearRouteState = useCallback(() => {
    routeAbortControllerRef.current?.abort()
    routeAbortControllerRef.current = null
    routeRequestIdRef.current += 1

    setActiveRoute(null)
    setSampledRoutePoints([])
    setSuggestedStops([])
    setSelectedStopIds([])
    setRouteCoordinates([])
    setRouteDurationSeconds(null)
    setRouteError(null)
    setStopsError(null)
    setIsRouteLoading(false)
    setIsStopsLoading(false)
    setIsCurrentLocationLoading(false)
  }, [])

  useEffect(() => () => routeAbortControllerRef.current?.abort(), [])

  useEffect(() => {
    if (!pickerTarget) {
      return
    }

    const query = addressQuery.trim()
    if (query.length < 3) {
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      setIsAddressSearchLoading(true)
      setAddressSearchError(null)
      try {
        const candidates = await searchAddressCandidates(query, controller.signal)
        setAddressCandidates(candidates)
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        setAddressCandidates([])
        setAddressSearchError('Recherche indisponible pour le moment.')
        console.error(error)
      } finally {
        if (!controller.signal.aborted) {
          setIsAddressSearchLoading(false)
        }
      }
    }, 320)

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [addressQuery, pickerTarget])

  useEffect(() => {
    if (!isMapReady || routeCoordinates.length < 2) {
      return
    }

    const timeoutId = setTimeout(() => {
      cameraRef.current?.fitBounds(toBounds(routeCoordinates, routeCoordinates[0], routeCoordinates[routeCoordinates.length - 1]), {
        padding: { top: 120, right: 36, bottom: 240, left: 36 },
        duration: 900,
      })
    }, 140)

    return () => clearTimeout(timeoutId)
  }, [isMapReady, routeCoordinates])

  const openPicker = (target: 'origin' | 'destination') => {
    const currentLabel = target === 'origin' ? origin?.label : destination?.label
    setPickerTarget(target)
    setAddressQuery(currentLabel ?? '')
    setAddressCandidates([])
    setAddressSearchError(null)
    setIsAddressSearchLoading(false)
    setIsCurrentLocationLoading(false)
  }

  const closePicker = () => {
    setPickerTarget(null)
    setAddressQuery('')
    setAddressCandidates([])
    setAddressSearchError(null)
    setIsAddressSearchLoading(false)
    setIsCurrentLocationLoading(false)
  }

  const handleAddressQueryChange = (value: string) => {
    setAddressQuery(value)
    if (value.trim().length < 3) {
      setAddressCandidates([])
      setAddressSearchError(null)
      setIsAddressSearchLoading(false)
    }
  }

  const applyLocationSelection = (location: RouteLocation) => {
    if (!pickerTarget) {
      return
    }

    if (pickerTarget === 'origin') {
      if (destination && areCoordinatesClose(location.coordinate, destination.coordinate) && origin) {
        setDestination(origin)
      }
      setOrigin(location)
    } else {
      if (origin && areCoordinatesClose(location.coordinate, origin.coordinate) && destination) {
        setOrigin(destination)
      }
      setDestination(location)
    }

    clearRouteState()
    closePicker()
  }

  const getCurrentLocationLabel = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocoded = await Location.reverseGeocodeAsync({ latitude, longitude })
      const candidate = reverseGeocoded[0]
      if (!candidate) {
        return 'Ma position'
      }

      const primary = [candidate.name, candidate.street].filter(Boolean).join(' ').trim()
      const secondary = [candidate.city, candidate.country].filter(Boolean).join(', ')

      return [primary || candidate.city || 'Ma position', secondary].filter(Boolean).join(' - ')
    } catch {
      return 'Ma position'
    }
  }

  const handleUseCurrentLocation = async () => {
    if (!pickerTarget) {
      return
    }

    setIsCurrentLocationLoading(true)
    setAddressSearchError(null)

    try {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (permission.status !== 'granted') {
        setAddressSearchError('Autorisation de localisation refusee.')
        return
      }

      const position = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = position.coords
      const label = await getCurrentLocationLabel(latitude, longitude)

      applyLocationSelection({
        label,
        coordinate: { latitude, longitude },
      })
    } catch (error) {
      setAddressSearchError('Impossible de recuperer la localisation actuelle.')
      console.error(error)
    } finally {
      setIsCurrentLocationLoading(false)
    }
  }

  const swapRouteCities = () => {
    const nextOrigin = destination
    const nextDestination = origin
    setOrigin(nextOrigin)
    setDestination(nextDestination)
    clearRouteState()
  }

  const loadRouteForSelection = useCallback(
    async (nextSelectedStopIds: string[]) => {
      if (!activeRoute) {
        return
      }

      const requestId = routeRequestIdRef.current + 1
      routeRequestIdRef.current = requestId

      routeAbortControllerRef.current?.abort()
      const controller = new AbortController()
      routeAbortControllerRef.current = controller

      const points = buildRoutePoints(
        nextSelectedStopIds,
        activeRoute.origin.coordinate,
        activeRoute.destination.coordinate,
        routeStops,
      )

      setIsRouteLoading(true)
      setRouteError(null)

      try {
        const route = await fetchRoute(points, controller.signal)
        if (routeRequestIdRef.current !== requestId) {
          return
        }
        setRouteCoordinates(route.coordinates)
        setRouteDurationSeconds(route.durationSeconds)
      } catch (error) {
        if (controller.signal.aborted || routeRequestIdRef.current !== requestId) {
          return
        }

        setRouteCoordinates(points)
        setRouteDurationSeconds(null)
        setRouteError('Impossible de recalculer la route avec cette selection.')
        console.error(error)
      } finally {
        if (routeRequestIdRef.current === requestId) {
          setIsRouteLoading(false)
        }
      }
    },
    [activeRoute, routeStops],
  )

  const toggleStop = (stopId: string) => {
    if (!activeRoute || isRouteLoading || isStopsLoading) {
      return
    }

    setSelectedStopIds((current) => {
      const nextSelectedStopIds = current.includes(stopId)
        ? current.filter((id) => id !== stopId)
        : [...current, stopId]

      void loadRouteForSelection(nextSelectedStopIds)
      return nextSelectedStopIds
    })
  }

  const handleBuildRoute = useCallback(async () => {
    if (!origin || !destination) {
      return
    }

    const originSnapshot = { ...origin, coordinate: { ...origin.coordinate } }
    const destinationSnapshot = { ...destination, coordinate: { ...destination.coordinate } }
    const requestId = routeRequestIdRef.current + 1
    routeRequestIdRef.current = requestId

    routeAbortControllerRef.current?.abort()
    const controller = new AbortController()
    routeAbortControllerRef.current = controller

    setActiveRoute({ origin: originSnapshot, destination: destinationSnapshot })
    setSampledRoutePoints([])
    setSuggestedStops([])
    setSelectedStopIds([])
    setRouteCoordinates([])
    setRouteDurationSeconds(null)
    setRouteError(null)
    setStopsError(null)
    setIsRouteLoading(true)
    setIsStopsLoading(false)

    const basePoints = [originSnapshot.coordinate, destinationSnapshot.coordinate]

    try {
      const route = await fetchRoute(basePoints, controller.signal)
      if (routeRequestIdRef.current !== requestId) {
        return
      }

      setRouteCoordinates(route.coordinates)
      setRouteDurationSeconds(route.durationSeconds)

      const sampledPoints = sampleRouteCoordinates(route.coordinates, SAMPLE_POINTS_COUNT)
      setSampledRoutePoints(sampledPoints)

      if (sampledPoints.length === 0) {
        setStopsError('Impossible de placer des points de recherche sur ce trajet.')
        return
      }

      setIsStopsLoading(true)
      const settledResponses = await Promise.allSettled(
        sampledPoints.map((point) =>
          searchApi.getSearch({
            page: 1,
            pageSize: RESTAURANT_SEARCH_PAGE_SIZE,
            types: ['restaurant'],
            lat: point.latitude,
            lng: point.longitude,
            radiusKm: RESTAURANT_SEARCH_RADIUS_KM,
            sortBy: 'distance',
            sortDirection: 'ASC',
          }),
        ),
      )

      if (routeRequestIdRef.current !== requestId) {
        return
      }

      const restaurantsByPoint = settledResponses.map((response) =>
        response.status === 'fulfilled' ? response.value.restaurants : [],
      )
      const nextSuggestedStops = buildSuggestedStops(sampledPoints, restaurantsByPoint, MAX_SUGGESTED_STOPS)
      setSuggestedStops(nextSuggestedStops)

      if (nextSuggestedStops.length === 0) {
        setStopsError('Aucun restaurant trouve autour des 3 points du trajet.')
      }
    } catch (error) {
      if (controller.signal.aborted || routeRequestIdRef.current !== requestId) {
        return
      }

      setRouteCoordinates(basePoints)
      setRouteDurationSeconds(null)
      setSampledRoutePoints([])
      setSuggestedStops([])
      setRouteError('Impossible de charger la route GPS. Trace simplifiee affichee.')
      console.error(error)
    } finally {
      if (routeRequestIdRef.current === requestId) {
        setIsRouteLoading(false)
        setIsStopsLoading(false)
      }
    }
  }, [destination, origin])

  useEffect(() => {
    if (!origin || !destination) {
      return
    }

    const routeAlreadyMatchesSelection =
      activeRoute != null &&
      areCoordinatesClose(activeRoute.origin.coordinate, origin.coordinate) &&
      areCoordinatesClose(activeRoute.destination.coordinate, destination.coordinate)

    if (routeAlreadyMatchesSelection || isRouteLoading || isStopsLoading) {
      return
    }

    const timeoutId = setTimeout(() => {
      void handleBuildRoute()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [
    activeRoute,
    destination,
    handleBuildRoute,
    isRouteLoading,
    isStopsLoading,
    origin,
  ])

  const openExternalRoute = () => {
    if (!activeRoute) {
      return
    }

    const points = buildRoutePoints(
      selectedStopIds,
      activeRoute.origin.coordinate,
      activeRoute.destination.coordinate,
      routeStops,
    )
    const googleUrl = buildGoogleMapsUrl(points)
    const appleUrl = buildAppleMapsUrl(points)
    const wazeUrl = buildWazeUrl(points)

    const openUrl = async (url: string) => {
      try {
        await Linking.openURL(url)
      } catch (error) {
        Alert.alert('Erreur', 'Impossible d’ouvrir cette application de navigation.')
        console.error(error)
      }
    }

    Alert.alert('Ouvrir l’itineraire', 'Choisis ton application de navigation.', [
      { text: 'Google Maps', onPress: () => void openUrl(googleUrl) },
      { text: Platform.OS === 'ios' ? 'Plans' : 'Maps web', onPress: () => void openUrl(appleUrl) },
      { text: 'Waze', onPress: () => void openUrl(wazeUrl) },
      { text: 'Annuler', style: 'cancel' },
    ])
  }

  const sheetTitle = getSheetTitle(Boolean(activeRoute), suggestedStops.length)

  return (
    <View style={styles.screen}>
      <Map
        style={styles.map}
        mapStyle={OSM_DETAILED_STYLE}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
        onDidFailLoadingMap={() => setMapError('Impossible de charger le fond de carte.')}
        compass={false}
        touchRotate={false}
        attribution
        logo={false}
        attributionPosition={{ top: 100, left: 10 }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [INITIAL_REGION.longitude, INITIAL_REGION.latitude],
            zoom: 5.6,
          }}
        />

        {routeFeature ? (
          <GeoJSONSource id="route-source" data={routeFeature}>
            <Layer
              id="route-line"
              type="line"
              style={{
                lineColor: colors.red,
                lineWidth: 4,
                lineOpacity: 0.9,
                lineDasharray: [2, 1.4],
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </GeoJSONSource>
        ) : null}

        {origin ? (
          <Marker id="start-marker" lngLat={toLngLat(origin.coordinate)} anchor="bottom">
            <MapPin label="A" variant="default" />
          </Marker>
        ) : null}

        {destination ? (
          <Marker id="end-marker" lngLat={toLngLat(destination.coordinate)} anchor="bottom">
            <MapPin label="B" variant="default" />
          </Marker>
        ) : null}

        {sampledRoutePoints.map((point, index) => (
          <Marker
            key={`sample-point-${index + 1}`}
            id={`sample-point-${index + 1}`}
            lngLat={toLngLat(point)}
            anchor="center"
          >
            <View style={styles.samplePointPin}>
              <Text style={styles.samplePointLabel}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {suggestedStops.map((stop) => {
          const selected = selectedStopIds.includes(stop.id)

          return (
            <Marker
              key={stop.id}
              id={stop.id}
              lngLat={toLngLat(stop.coordinate)}
              anchor="bottom"
              onPress={() => toggleStop(stop.id)}
            >
              <MapPin label={String(stop.order)} variant={selected ? 'active' : 'muted'} />
            </Marker>
          )
        })}
      </Map>

      <View style={[styles.topBarContainer, { top: insets.top + 10 }]}>
        <View style={styles.topBar}>
          <Pressable style={styles.cityPickerButton} onPress={() => openPicker('origin')}>
            <Text style={styles.topBarCity} numberOfLines={1}>
              {origin?.label ?? 'Depart'}
            </Text>
          </Pressable>
          <Pressable style={styles.swapButton} onPress={swapRouteCities}>
            <Text style={styles.swapButtonLabel}>⇄</Text>
          </Pressable>
          <Pressable style={styles.cityPickerButton} onPress={() => openPicker('destination')}>
            <Text style={styles.topBarCity} numberOfLines={1}>
              {destination?.label ?? 'Arrivee'}
            </Text>
          </Pressable>
          <Text style={styles.topBarDuration}>
            {isRouteLoading ? '...' : formatDuration(routeDurationSeconds)}
          </Text>
        </View>
      </View>

      <Animated.View style={[styles.sheet, sheetAnimatedStyle]}>
        <GestureDetector gesture={sheetGesture}>
          <View style={styles.sheetHandleTouch}>
            <View style={styles.sheetHandle} />
          </View>
        </GestureDetector>

        <View style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{sheetTitle}</Text>
            <Text style={styles.sheetFilter}>TRAJET</Text>
          </View>

          {mapError ? <Text style={styles.routeError}>{mapError}</Text> : null}
          {routeError ? <Text style={styles.routeError}>{routeError}</Text> : null}
          {stopsError ? <Text style={styles.routeError}>{stopsError}</Text> : null}

          <View style={styles.routeActions}>
            <SecondaryButton
              label="Ouvrir dans une app GPS"
              onPress={openExternalRoute}
              disabled={!activeRoute || isRouteLoading}
            />
            {isRouteLoading || isStopsLoading ? (
              <View style={styles.routeLoading}>
                <ActivityIndicator size="small" color={colors.red} />
                <Text style={styles.routeLoadingText}>
                  {isRouteLoading ? 'Calcul de l itineraire...' : 'Recherche de restaurants...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.routeSummary}>
                {!activeRoute
                  ? 'Renseigne depart et arrivee: le calcul se lance automatiquement.'
                  : selectedStops.length > 0
                    ? `${selectedStops.length} pause${selectedStops.length > 1 ? 's' : ''} active${selectedStops.length > 1 ? 's' : ''} sur le trajet`
                    : 'Selectionne des restaurants proposes pour les ajouter au trajet'}
              </Text>
            )}
          </View>

          {suggestedStops.length === 0 && !isStopsLoading ? (
            <View style={styles.emptyStops}>
              <Text style={styles.emptyStopsText}>
                {activeRoute
                  ? 'Aucune suggestion disponible pour ce trajet.'
                  : 'Aucune suggestion tant que l itineraire n est pas calcule.'}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              {suggestedStops.map((stop) => {
                const selected = selectedStopIds.includes(stop.id)
                const imageUrl = extractImageUrls(stop.restaurant)[0]

                return (
                  <Pressable
                    key={stop.id}
                    style={[styles.card, selected ? styles.cardSelected : undefined]}
                    onPress={() => toggleStop(stop.id)}
                  >
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.cardImage, styles.cardImageFallback]}>
                        <Text style={styles.cardImageFallbackText}>Photo indisponible</Text>
                      </View>
                    )}
                    <View style={styles.cardReferenceRow}>
                      <View style={styles.cardReferenceBadge}>
                        <Text style={styles.cardReferenceText}>#{stop.order}</Text>
                      </View>
                      <Text style={styles.cardReferenceHint}>Repere carte</Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {resolveRestaurantDisplayName(stop.restaurant)}
                    </Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {stop.restaurant.city}
                    </Text>
                    <Text style={styles.cardSubMuted} numberOfLines={1}>
                      {formatDetour(stop.distanceFromAnchorMeters)}
                    </Text>
                    <View style={styles.badgesRow}>
                      {stop.restaurant.awardCode ? (
                        <DistinctionBadge type={stop.restaurant.awardCode} stars={stop.restaurant.stars} />
                      ) : null}
                      {stop.restaurant.hasGreenStar ? <DistinctionBadge type="GREEN_STAR" /> : null}
                    </View>
                  </Pressable>
                )
              })}
            </ScrollView>
          )}
        </View>
      </Animated.View>

      <AddressPickerModal
        visible={pickerTarget !== null}
        target={pickerTarget}
        query={addressQuery}
        candidates={addressCandidates}
        loading={isAddressSearchLoading}
        error={addressSearchError}
        activeOrigin={origin}
        activeDestination={destination}
        onClose={closePicker}
        onChangeQuery={handleAddressQueryChange}
        onSelect={applyLocationSelection}
        onUseCurrentLocation={() => void handleUseCurrentLocation()}
        isCurrentLocationLoading={isCurrentLocationLoading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.backgroundPrimary,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBarContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 3,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  cityPickerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSubtle,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 0,
  },
  swapButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  swapButtonLabel: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '700',
  },
  topBarCity: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  topBarDuration: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.backgroundPrimary,
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  sheetHandleTouch: {
    width: '100%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.textSecondary,
    opacity: 0.55,
  },
  sheetContent: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetFilter: {
    marginLeft: 'auto',
    fontSize: 10,
    fontWeight: '600',
    color: colors.red,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  routeError: {
    marginBottom: 8,
    fontSize: 12,
    color: colors.red,
  },
  routeActions: {
    gap: 8,
    marginBottom: 8,
  },
  routeLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  routeLoadingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  routeSummary: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  emptyStops: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSubtle,
  },
  emptyStopsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardsRow: {
    gap: 7,
    paddingBottom: 4,
  },
  card: {
    width: 220,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundPrimary,
    padding: 6,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.red,
    backgroundColor: colors.backgroundSubtle,
  },
  cardImage: {
    height: 72,
    borderRadius: 6,
    width: '100%',
  },
  cardImageFallback: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageFallbackText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  cardReferenceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardReferenceBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.red,
    backgroundColor: 'rgba(189, 35, 51, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardReferenceText: {
    color: colors.red,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  cardReferenceHint: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardTitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    minHeight: 32,
  },
  cardSub: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardSubMuted: {
    marginTop: 1,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  badgesRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    minHeight: 18,
    alignItems: 'center',
  },
  samplePointPin: {
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.red,
    backgroundColor: colors.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  samplePointLabel: {
    color: colors.red,
    fontSize: 10,
    fontWeight: '700',
  },
})
