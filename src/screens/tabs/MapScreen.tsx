import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
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
import { colors, radius } from '../../app/theme/tokens'
import { DistinctionBadge, MapPin, SecondaryButton } from '../../shared/ui'
import { AddressPickerModal } from './map/AddressPickerModal'
import {
  DEFAULT_DESTINATION,
  DEFAULT_ORIGIN,
  INITIAL_REGION,
  OSM_DETAILED_STYLE,
  SHEET_COLLAPSED_HEIGHT,
  STOPS,
} from './map/map.constants'
import {
  areCoordinatesClose,
  buildAppleMapsUrl,
  buildGoogleMapsUrl,
  buildRoutePoints,
  buildWazeUrl,
  fetchRoute,
  formatDuration,
  searchAddressCandidates,
  toBounds,
  toLngLat,
} from './map/map.services'
import type { Coordinate, RouteLocation } from './map/map.types'
import { useDraggableSheet } from './map/useDraggableSheet'

export default function MapScreen() {
  const { height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { sheetAnimatedStyle, sheetGesture } = useDraggableSheet({
    windowHeight,
    collapsedHeight: SHEET_COLLAPSED_HEIGHT,
  })

  const cameraRef = useRef<CameraRef | null>(null)

  const [isMapReady, setIsMapReady] = useState(false)
  const [origin, setOrigin] = useState<RouteLocation>({
    label: DEFAULT_ORIGIN.label,
    coordinate: DEFAULT_ORIGIN.coordinate,
  })
  const [destination, setDestination] = useState<RouteLocation>({
    label: DEFAULT_DESTINATION.label,
    coordinate: DEFAULT_DESTINATION.coordinate,
  })
  const [pickerTarget, setPickerTarget] = useState<'origin' | 'destination' | null>(null)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressCandidates, setAddressCandidates] = useState<RouteLocation[]>([])
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false)
  const [addressSearchError, setAddressSearchError] = useState<string | null>(null)

  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([])
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([
    DEFAULT_ORIGIN.coordinate,
    DEFAULT_DESTINATION.coordinate,
  ])
  const [routeDurationSeconds, setRouteDurationSeconds] = useState<number | null>(null)
  const [isRouteLoading, setIsRouteLoading] = useState(true)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  const selectedStops = useMemo(
    () =>
      STOPS.filter((stop) => selectedStopIds.includes(stop.id)).sort((a, b) => a.order - b.order),
    [selectedStopIds],
  )

  const routeFeature = useMemo(
    () => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: routeCoordinates.map(toLngLat),
      },
      properties: {},
    }),
    [routeCoordinates],
  )

  useEffect(() => {
    if (!pickerTarget) {
      return
    }

    const query = addressQuery.trim()
    if (query.length < 3) return

    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      setIsAddressSearchLoading(true)
      setAddressSearchError(null)
      try {
        const candidates = await searchAddressCandidates(query, controller.signal)
        setAddressCandidates(candidates)
      } catch (error) {
        if (controller.signal.aborted) return
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
    const controller = new AbortController()
    const points = buildRoutePoints(selectedStopIds, origin.coordinate, destination.coordinate, STOPS)

    const loadRoute = async () => {
      setIsRouteLoading(true)
      setRouteError(null)
      try {
        const route = await fetchRoute(points, controller.signal)
        setRouteCoordinates(route.coordinates)
        setRouteDurationSeconds(route.durationSeconds)
      } catch (error) {
        if (controller.signal.aborted) return
        setRouteCoordinates(points)
        setRouteDurationSeconds(null)
        setRouteError('Impossible de charger la route GPS. Trace simplifiee affichee.')
        console.error(error)
      } finally {
        if (!controller.signal.aborted) {
          setIsRouteLoading(false)
        }
      }
    }

    void loadRoute()
    return () => controller.abort()
  }, [destination.coordinate, origin.coordinate, selectedStopIds])

  useEffect(() => {
    if (!isMapReady || routeCoordinates.length < 2) {
      return
    }

    const timeoutId = setTimeout(() => {
      cameraRef.current?.fitBounds(toBounds(routeCoordinates, origin.coordinate, destination.coordinate), {
        padding: { top: 120, right: 36, bottom: 240, left: 36 },
        duration: 900,
      })
    }, 140)

    return () => clearTimeout(timeoutId)
  }, [destination.coordinate, isMapReady, origin.coordinate, routeCoordinates])

  const openPicker = (target: 'origin' | 'destination') => {
    const currentLabel = target === 'origin' ? origin.label : destination.label
    setPickerTarget(target)
    setAddressQuery(currentLabel)
    setAddressCandidates([])
    setAddressSearchError(null)
    setIsAddressSearchLoading(false)
  }

  const closePicker = () => {
    setPickerTarget(null)
    setAddressQuery('')
    setAddressCandidates([])
    setAddressSearchError(null)
    setIsAddressSearchLoading(false)
  }

  const handleAddressQueryChange = (value: string) => {
    setAddressQuery(value)
    if (value.trim().length < 3) {
      setAddressCandidates([])
      setAddressSearchError(null)
      setIsAddressSearchLoading(false)
    }
  }

  const toggleStop = (stopId: string) => {
    setSelectedStopIds((current) =>
      current.includes(stopId) ? current.filter((id) => id !== stopId) : [...current, stopId],
    )
  }

  const swapRouteCities = () => {
    setOrigin(destination)
    setDestination(origin)
    setSelectedStopIds([])
  }

  const applyLocationSelection = (location: RouteLocation) => {
    if (!pickerTarget) {
      return
    }

    if (pickerTarget === 'origin') {
      if (areCoordinatesClose(location.coordinate, destination.coordinate)) {
        setDestination(origin)
      }
      setOrigin(location)
    } else {
      if (areCoordinatesClose(location.coordinate, origin.coordinate)) {
        setOrigin(destination)
      }
      setDestination(location)
    }

    setSelectedStopIds([])
    closePicker()
  }

  const openExternalRoute = () => {
    const points = buildRoutePoints(selectedStopIds, origin.coordinate, destination.coordinate, STOPS)
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

        <Marker id="start-marker" lngLat={toLngLat(origin.coordinate)} anchor="bottom">
          <MapPin label="A" variant="default" />
        </Marker>

        <Marker id="end-marker" lngLat={toLngLat(destination.coordinate)} anchor="bottom">
          <MapPin label="B" variant="default" />
        </Marker>

        {STOPS.map((stop) => {
          const selected = selectedStopIds.includes(stop.id)
          return (
            <Marker
              key={stop.id}
              id={`stop-${stop.id}`}
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
              {origin.label}
            </Text>
          </Pressable>
          <Pressable style={styles.swapButton} onPress={swapRouteCities}>
            <Text style={styles.swapButtonLabel}>⇄</Text>
          </Pressable>
          <Pressable style={styles.cityPickerButton} onPress={() => openPicker('destination')}>
            <Text style={styles.topBarCity} numberOfLines={1}>
              {destination.label}
            </Text>
          </Pressable>
          <Text style={styles.topBarDuration}>{formatDuration(routeDurationSeconds)}</Text>
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
            <Text style={styles.sheetTitle}>{STOPS.length} pauses trouvees</Text>
            <Text style={styles.sheetFilter}>FILTRES</Text>
          </View>
          {mapError ? <Text style={styles.routeError}>{mapError}</Text> : null}
          {routeError ? <Text style={styles.routeError}>{routeError}</Text> : null}
          <View style={styles.routeActions}>
            {isRouteLoading ? (
              <View style={styles.routeLoading}>
                <ActivityIndicator size="small" color={colors.red} />
                <Text style={styles.routeLoadingText}>Calcul de l’itineraire...</Text>
              </View>
            ) : (
              <Text style={styles.routeSummary}>
                {selectedStops.length > 0
                  ? `${selectedStops.length} pause${selectedStops.length > 1 ? 's' : ''} active${selectedStops.length > 1 ? 's' : ''} sur le trajet`
                  : 'Trajet direct sans pause'}
              </Text>
            )}

            <SecondaryButton label="Ouvrir dans une app GPS" onPress={openExternalRoute} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsRow}
          >
            {STOPS.map((stop) => (
              <Pressable
                key={stop.id}
                style={[styles.card, selectedStopIds.includes(stop.id) ? styles.cardSelected : undefined]}
                onPress={() => toggleStop(stop.id)}
              >
                <View style={styles.cardImage} />
                <Text style={styles.cardTitle}>{stop.name}</Text>
                <Text style={styles.cardSub}>{stop.city}</Text>
                <Text style={styles.cardSubMuted}>{stop.detour}</Text>
                <View style={styles.badgesRow}>
                  {stop.badge === 'star' ? <DistinctionBadge type="star" /> : null}
                  {stop.badge === 'bib' ? <DistinctionBadge type="bib" /> : null}
                </View>
                <Text style={styles.cardAction}>
                  {selectedStopIds.includes(stop.id) ? 'Retirer du trajet' : 'Ajouter au trajet'}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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
  mapPin: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundPrimary,
  },
  mapPinDark: {
    backgroundColor: colors.textPrimary,
  },
  mapPinMuted: {
    backgroundColor: colors.textSecondary,
  },
  mapPinSelected: {
    backgroundColor: colors.red,
  },
  mapPinLabel: {
    color: colors.backgroundPrimary,
    fontSize: 11,
    fontWeight: '700',
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
  cardsRow: {
    gap: 7,
    paddingBottom: 4,
  },
  card: {
    width: 160,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundPrimary,
    padding: 6,
  },
  cardSelected: {
    borderColor: colors.red,
    backgroundColor: colors.backgroundSubtle,
  },
  cardImage: {
    height: 52,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundSubtle,
  },
  cardTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSub: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardSubMuted: {
    marginTop: 1,
    fontSize: 11,
    color: colors.textSecondary,
  },
  badgesRow: {
    marginTop: 2,
    flexDirection: 'row',
    gap: 4,
    minHeight: 18,
    alignItems: 'center',
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.backgroundPrimary,
  },
  badgeFill: {
    backgroundColor: colors.red,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.red,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  badgeFillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.backgroundPrimary,
  },
  cardAction: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.red,
  },
})
