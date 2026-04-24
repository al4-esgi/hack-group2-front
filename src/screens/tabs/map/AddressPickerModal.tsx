import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { colors, radius } from '../../../app/theme/tokens'
import { SecondaryButton } from '../../../shared/ui'
import { areCoordinatesClose } from './map.services'
import type { RouteLocation } from './map.types'

type Props = {
  visible: boolean
  target: 'origin' | 'destination' | null
  query: string
  candidates: RouteLocation[]
  loading: boolean
  error: string | null
  activeOrigin: RouteLocation | null
  activeDestination: RouteLocation | null
  onClose: () => void
  onChangeQuery: (value: string) => void
  onSelect: (location: RouteLocation) => void
  onUseCurrentLocation: () => void
  isCurrentLocationLoading: boolean
}

export function AddressPickerModal({
  visible,
  target,
  query,
  candidates,
  loading,
  error,
  activeOrigin,
  activeDestination,
  onClose,
  onChangeQuery,
  onSelect,
  onUseCurrentLocation,
  isCurrentLocationLoading,
}: Props) {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height)
    })
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, keyboardHeight > 0 ? { marginBottom: keyboardHeight + 8 } : undefined]}>
          <Text style={styles.title}>
            {target === 'origin' ? 'Choisir le depart' : 'Choisir l arrivee'}
          </Text>
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Ex: 12 rue de Rivoli, Paris"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
            autoCorrect={false}
            style={styles.input}
          />
          <Text style={styles.hint}>Tape au moins 3 caracteres</Text>
          <Pressable style={styles.locationButton} onPress={onUseCurrentLocation} disabled={isCurrentLocationLoading}>
            {isCurrentLocationLoading ? (
              <>
                <ActivityIndicator size="small" color={colors.red} />
                <Text style={styles.locationButtonText}>Localisation en cours...</Text>
              </>
            ) : (
              <Text style={styles.locationButtonText}>Utiliser ma localisation</Text>
            )}
          </Pressable>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.red} />
                <Text style={styles.loadingText}>Recherche d adresses...</Text>
              </View>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {candidates.map((candidate) => {
              const activeLocation = target === 'origin' ? activeOrigin : activeDestination
              const isActive = activeLocation
                ? candidate.label === activeLocation.label &&
                  areCoordinatesClose(candidate.coordinate, activeLocation.coordinate)
                : false

              return (
                <Pressable
                  key={`${candidate.label}-${candidate.coordinate.latitude}-${candidate.coordinate.longitude}`}
                  style={[styles.option, isActive ? styles.optionActive : undefined]}
                  onPress={() => onSelect(candidate)}
                >
                  <Text style={[styles.optionLabel, isActive ? styles.optionLabelActive : undefined]}>
                    {candidate.label}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
          <SecondaryButton label="Fermer" onPress={onClose} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  sheet: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.backgroundPrimary,
    padding: 12,
    maxHeight: '65%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.backgroundSubtle,
    marginBottom: 10,
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.red,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 12,
    color: colors.red,
    marginBottom: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  optionActive: {
    borderColor: colors.red,
    backgroundColor: colors.backgroundSubtle,
  },
  optionLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  optionLabelActive: {
    color: colors.red,
  },
})
