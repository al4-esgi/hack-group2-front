import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Location from 'expo-location'
import { FilterChip } from './FilterChip'
import { SearchBar } from './SearchBar'
import { AutocompleteFilter } from './AutocompleteFilter'
import { useSearchStore } from '@/src/stores/search.store'
import { useCountries, useCities } from '@/src/hooks/useSearch'
import { useAmenities } from '@/src/hooks/useHotels'
import { useCuisines, useFacilities } from '@/src/hooks/useRestaurants'
import { SearchType } from '@/src/types/search.type'
import { AwardCode } from '@/src/types/restaurant.type'
import { colors, radius, spacing, typography } from '@/src/app/theme/tokens'
import { X } from 'lucide-react-native'

interface SearchFiltersProps {
  query: string
  onSearchChange: (text: string) => void
  isLoading?: boolean
}

export function SearchFilters({
  query,
  onSearchChange,
  isLoading,
}: SearchFiltersProps) {
  const { t } = useTranslation('search')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [selectedCountryName, setSelectedCountryName] = useState('')
  const [selectedCityName, setSelectedCityName] = useState('')
  const [amenitySearch, setAmenitySearch] = useState('')
  const [cuisineSearch, setCuisineSearch] = useState('')
  const [facilitySearch, setFacilitySearch] = useState('')
  
  // Cache selected items for chips
  const [selectedCuisines, setSelectedCuisines] = useState<FilterItem[]>([])
  const [selectedFacilities, setSelectedFacilities] = useState<FilterItem[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<FilterItem[]>([])
  
  type FilterItem = { id: number; name: string }

  const params = useSearchStore((state) => state.params)
  const setParams = useSearchStore((state) => state.setParams)
  const setSearch = useSearchStore((state) => state.setSearch)

  // Autocomplete hooks - enabled by default for dropdown
  const { data: countries } = useCountries(countrySearch, 10, true)
  const { data: cities } = useCities(citySearch, 10, params.countryId, true)
  const { data: amenities } = useAmenities(amenitySearch, 10, true)
  const { data: cuisines } = useCuisines(cuisineSearch, 10, true)
  const { data: facilities } = useFacilities(facilitySearch, 10, true)

  const handleSearch = useCallback(
    (text: string) => {
      onSearchChange(text)
      setSearch(text)
    },
    [onSearchChange, setSearch],
  )

  const handleSearchFocus = useCallback(() => {
    onSearchChange('')
    setSearch('')
  }, [onSearchChange, setSearch])

  const handleTypeToggle = useCallback(
    (type: SearchType) => {
      const currentTypes = params.types || []
      if (currentTypes.includes(type)) {
        const newTypes = currentTypes.filter((t) => t !== type)
        setParams({ types: newTypes.length > 0 ? newTypes : undefined })
      } else {
        setParams({ types: [...currentTypes, type] })
      }
    },
    [params.types, setParams],
  )

  const handleRadiusChange = useCallback(
    (km: number) => {
      if (params.radiusKm === km) {
        setParams({ radiusKm: undefined, lat: undefined, lng: undefined })
      } else {
        setParams({ radiusKm: km })
      }
    },
    [params.radiusKm, setParams],
  )

  const isTypeActive = useCallback(
    (type: SearchType) => params.types?.includes(type) ?? false,
    [params.types],
  )

  // Toggle handler - like other filters
  const handleNearMeToggle = () => {
    if (params.lat) {
      setParams({ lat: undefined, lng: undefined, radiusKm: undefined })
      return
    }

    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== 'granted') return
        return Location.getCurrentPositionAsync()
      })
      .then((location) => {
        if (!location) return
        setParams({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          radiusKm: 10,
        })
      })
      .catch(() => {})
  }

  // Auto-get location on mount
  useEffect(() => {
    if (params.lat !== undefined) return

    Location.getCurrentPositionAsync({})
      .then((location) => {
        if (location) {
          setParams({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            radiusKm: 10,
          })
        }
      })
      .catch(() => {})
  }, [])

  const activeFiltersCount = [
    params.types?.length,
    params.minStars,
    params.minPriceLevel,
    params.maxPriceLevel,
    params.isPlus,
    params.bookable,
    params.sustainableHotel,
    params.greenStar,
    params.awardCode,
    params.location,
    params.cuisineIds?.length,
    params.facilityIds?.length,
    params.amenityIds?.length,
    params.lat,
  ].filter(Boolean).length

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={handleSearch}
        onFocus={handleSearchFocus}
        placeholder={t('placeholder')}
      />

      <View style={styles.chips}>
        <FilterChip
          label={t('filters.restaurant')}
          active={isTypeActive('restaurant')}
          onPress={() => handleTypeToggle('restaurant')}
          disabled={isLoading}
        />
        <FilterChip
          label={t('filters.hotel')}
          active={isTypeActive('hotel')}
          onPress={() => handleTypeToggle('hotel')}
          disabled={isLoading}
        />
        <FilterChip
          label={t('filters.closeToMe')}
          active={params.lat !== undefined}
          onPress={handleNearMeToggle}
        />
        {params.lat !== undefined && (
          <>
            <FilterChip
              label="5km"
              active={params.radiusKm === 5}
              onPress={() => handleRadiusChange(5)}
            />
            <FilterChip
              label="10km"
              active={params.radiusKm === 10}
              onPress={() => handleRadiusChange(10)}
            />
            <FilterChip
              label="20km"
              active={params.radiusKm === 20}
              onPress={() => handleRadiusChange(20)}
            />
            <FilterChip
              label="50km"
              active={params.radiusKm === 50}
              onPress={() => handleRadiusChange(50)}
            />
          </>
        )}

        <Pressable style={styles.moreButton} onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text style={styles.moreButtonText}>{showAdvanced ? '−' : '+'}</Text>
          <Text style={styles.moreButtonLabel}> {t('filters.more')}</Text>
          {activeFiltersCount > 0 && (
            <Text style={styles.moreButtonCount}> ({activeFiltersCount})</Text>
          )}
        </Pressable>
      </View>

      {showAdvanced === true && (
        <ScrollView
          style={styles.advancedPanel}
          showsVerticalScrollIndicator
          contentContainerStyle={styles.advancedContent}
        >
            {/* COUNTRY */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.country')}</Text>
              {params.countryId ? (
                <View style={styles.selectedContainer}>
                  <FilterChip
                    label={selectedCountryName}
                    active={true}
                    onPress={() => {
                      setParams({ countryId: undefined, cityId: undefined })
                      setCountrySearch('')
                      setSelectedCountryName('')
                      setCitySearch('')
                      setSelectedCityName('')
                    }}
                  />
                </View>
              ) : (
                <AutocompleteFilter
                  data={countries}
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                  selectedIds={params.countryId ? [params.countryId] : undefined}
                  onSelect={(item) => {
                    setParams({
                      countryId: item.id,
                      cityId: undefined,
                      lat: undefined,
                      lng: undefined,
                      radiusKm: undefined,
                    })
                    setCountrySearch(item.name)
                    setSelectedCountryName(item.name)
                    setCitySearch('')
                    setSelectedCityName('')
                  }}
                  onRemove={() => {
                    setParams({ countryId: undefined, cityId: undefined })
                    setCountrySearch('')
                    setSelectedCountryName('')
                    setCitySearch('')
                    setSelectedCityName('')
                  }}
                  placeholder={t('filters.countryPlaceholder')}
                  loading={countries === undefined}
                />
              )}
            </View>

            {/* CITY */}
            {params.countryId && (
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>{t('filters.city')}</Text>
                {params.cityId ? (
                  <View style={styles.selectedContainer}>
                    <FilterChip
                      label={selectedCityName}
                      active={true}
                      onPress={() => {
                        setParams({ cityId: undefined })
                        setCitySearch('')
                        setSelectedCityName('')
                      }}
                    />
                  </View>
                ) : (
                  <AutocompleteFilter
                    data={cities}
                    value={citySearch}
                    onChangeText={setCitySearch}
                    selectedIds={params.cityId ? [params.cityId] : undefined}
                    onSelect={(item) => {
                      setParams({
                        cityId: item.id,
                        lat: undefined,
                        lng: undefined,
                        radiusKm: undefined,
                      })
                      setCitySearch(item.name)
                      setSelectedCityName(item.name)
                    }}
                    onRemove={() => {
                      setParams({ cityId: undefined })
                      setCitySearch('')
                      setSelectedCityName('')
                    }}
                    placeholder={t('filters.cityPlaceholder')}
                    loading={cities === undefined}
                  />
                )}
              </View>
            )}

            {/* PRICE */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.priceRange')}</Text>
              <View style={styles.chipsRow}>
                <FilterChip
                  label={t('filters.price.cheap')}
                  active={params.minPriceLevel === 1}
                  onPress={() =>
                    setParams({ minPriceLevel: params.minPriceLevel === 1 ? undefined : 1 })
                  }
                />
                <FilterChip
                  label={t('filters.price.medium')}
                  active={params.minPriceLevel === 2}
                  onPress={() =>
                    setParams({ minPriceLevel: params.minPriceLevel === 2 ? undefined : 2 })
                  }
                />
                <FilterChip
                  label={t('filters.price.expensive')}
                  active={params.minPriceLevel === 3}
                  onPress={() =>
                    setParams({ minPriceLevel: params.minPriceLevel === 3 ? undefined : 3 })
                  }
                />
                <FilterChip
                  label={t('filters.price.luxury')}
                  active={params.minPriceLevel === 4}
                  onPress={() =>
                    setParams({ minPriceLevel: params.minPriceLevel === 4 ? undefined : 4 })
                  }
                />
              </View>
            </View>

            {/* AWARDS */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.awards')}</Text>
              <View style={styles.chipsRow}>
                <FilterChip
                  label={t('filters.star')}
                  active={params.awardCode === AwardCode.MichelinStar}
                  onPress={() =>
                    setParams({
                      awardCode:
                        params.awardCode === AwardCode.MichelinStar
                          ? undefined
                          : AwardCode.MichelinStar,
                    })
                  }
                />
                <FilterChip
                  label={t('filters.bibGourmand')}
                  active={params.awardCode === AwardCode.BibGourmand}
                  onPress={() =>
                    setParams({
                      awardCode:
                        params.awardCode === AwardCode.BibGourmand
                          ? undefined
                          : AwardCode.BibGourmand,
                    })
                  }
                />
                <FilterChip
                  label={t('filters.selected')}
                  active={params.awardCode === AwardCode.Selected}
                  onPress={() =>
                    setParams({
                      awardCode:
                        params.awardCode === AwardCode.Selected ? undefined : AwardCode.Selected,
                    })
                  }
                />
              </View>
            </View>

            {/* HOTEL */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.hotelSpecial')}</Text>
              <View style={styles.chipsRow}>
                <FilterChip
                  label={t('filters.plus')}
                  active={params.isPlus === true}
                  onPress={() => setParams({ isPlus: params.isPlus ? undefined : true })}
                />
                <FilterChip
                  label={t('filters.bookable')}
                  active={params.bookable === true}
                  onPress={() => setParams({ bookable: params.bookable ? undefined : true })}
                />
                <FilterChip
                  label={t('filters.sustainable')}
                  active={params.sustainableHotel === true}
                  onPress={() =>
                    setParams({
                      sustainableHotel: params.sustainableHotel ? undefined : true,
                    })
                  }
                />
              </View>
            </View>

            {/* RESTAURANT */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.restaurantSpecial')}</Text>
              <View style={styles.chipsRow}>
                <FilterChip
                  label={t('filters.greenStar')}
                  active={params.greenStar === true}
                  onPress={() => setParams({ greenStar: params.greenStar ? undefined : true })}
                />
              </View>
            </View>

            {/* CUISINES */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.cuisines')}</Text>
              <AutocompleteFilter
                data={cuisines}
                value={cuisineSearch}
                onChangeText={setCuisineSearch}
                selectedIds={params.cuisineIds}
                selectedItemsCache={selectedCuisines}
                onSelect={(item) => {
                  const currentIds = params.cuisineIds || []
                  if (!currentIds.includes(item.id)) {
                    setParams({ cuisineIds: [...currentIds, item.id] })
                    setSelectedCuisines([...selectedCuisines, item])
                  }
                  setCuisineSearch('')
                }}
                onRemove={(id) => {
                  const newIds = params.cuisineIds?.filter((i) => i !== id)
                  const newItems = selectedCuisines.filter((i) => i.id !== id)
                  setParams({ cuisineIds: newIds?.length ? newIds : undefined })
                  setSelectedCuisines(newItems)
                }}
                placeholder={t('filters.cuisinesPlaceholder')}
                loading={cuisines === undefined}
              />
            </View>

            {/* FACILITIES */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.facilities')}</Text>
              <AutocompleteFilter
                data={facilities}
                value={facilitySearch}
                onChangeText={setFacilitySearch}
                selectedIds={params.facilityIds}
                selectedItemsCache={selectedFacilities}
                onSelect={(item) => {
                  const currentIds = params.facilityIds || []
                  if (!currentIds.includes(item.id)) {
                    setParams({ facilityIds: [...currentIds, item.id] })
                    setSelectedFacilities([...selectedFacilities, item])
                  }
                  setFacilitySearch('')
                }}
                onRemove={(id) => {
                  const newIds = params.facilityIds?.filter((i) => i !== id)
                  const newItems = selectedFacilities.filter((i) => i.id !== id)
                  setParams({ facilityIds: newIds?.length ? newIds : undefined })
                  setSelectedFacilities(newItems)
                }}
                placeholder={t('filters.facilitiesPlaceholder')}
                loading={facilities === undefined}
              />
            </View>

            {/* AMENITIES */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.amenities')}</Text>
              <AutocompleteFilter
                data={amenities}
                value={amenitySearch}
                onChangeText={setAmenitySearch}
                selectedIds={params.amenityIds}
                selectedItemsCache={selectedAmenities}
                onSelect={(item) => {
                  const currentIds = params.amenityIds || []
                  if (!currentIds.includes(item.id)) {
                    setParams({ amenityIds: [...currentIds, item.id] })
                    setSelectedAmenities([...selectedAmenities, item])
                  }
                  setAmenitySearch('')
                }}
                onRemove={(id) => {
                  const newIds = params.amenityIds?.filter((i) => i !== id)
                  const newItems = selectedAmenities.filter((i) => i.id !== id)
                  setParams({ amenityIds: newIds?.length ? newIds : undefined })
                  setSelectedAmenities(newItems)
                }}
                placeholder={t('filters.amenitiesPlaceholder')}
                loading={amenities === undefined}
              />
            </View>
          </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
    paddingBottom: spacing[3],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[2],
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: spacing[1],
    backgroundColor: colors.backgroundSubtle,
  },
  moreButtonText: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  moreButtonLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  moreButtonCount: {
    fontSize: typography.fontSize.small,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    gap: spacing[1],
    shadowColor: 'rgb(25, 25, 25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  locationChipText: {
    fontSize: typography.fontSize.subText,
    color: colors.backgroundPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  locationChipX: {
    fontSize: typography.fontSize.body,
    color: colors.backgroundPrimary,
    fontWeight: typography.fontWeight.bold,
  },
  selectedChip: {
    alignSelf: 'flex-start',
    borderColor: colors.primary,
    backgroundColor: 'rgba(189, 35, 51, 0.08)',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  selectedChipLabel: {
    fontSize: typography.fontSize.subText,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  addChipText: {
    fontSize: typography.fontSize.subText,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  advancedPanel: {
    height: 280,
    padding: spacing[3],
    backgroundColor: colors.backgroundSubtle,
    borderRadius: spacing[2],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  advancedScroll: {
    flex: 1,
  },
  advancedContent: {
    gap: spacing[1],
  },
  filterSection: {
    marginBottom: spacing[2],
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
})
