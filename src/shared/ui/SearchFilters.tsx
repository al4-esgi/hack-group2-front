import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Location from 'expo-location'
import { FilterChip } from './FilterChip'
import { SearchBar } from './SearchBar'
import { useSearchStore } from '@/src/stores/search.store'
import { useCountries, useCities } from '@/src/hooks/useSearch'
import { useAmenities } from '@/src/hooks/useHotels'
import { useCuisines, useFacilities } from '@/src/hooks/useRestaurants'
import { SearchType } from '@/src/types/search.type'
import { AwardCode } from '@/src/types/restaurant.type'
import { colors, radius, shadow, spacing, typography } from '@/src/app/theme/tokens'

interface SearchFiltersProps {
  query: string
  onSearchChange: (text: string) => void
  onSearchFocus?: () => void
  isLoading?: boolean
}

export function SearchFilters({
  query,
  onSearchChange,
  onSearchFocus,
  isLoading,
}: SearchFiltersProps) {
  const { t } = useTranslation('search')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [showCountryList, setShowCountryList] = useState(false)
  const [showCityList, setShowCityList] = useState(false)
  const [amenitySearch, setAmenitySearch] = useState('')
  const [showAmenityList, setShowAmenityList] = useState(false)
  const [cuisineSearch, setCuisineSearch] = useState('')
  const [showCuisineList, setShowCuisineList] = useState(false)
  const [facilitySearch, setFacilitySearch] = useState('')
  const [showFacilityList, setShowFacilityList] = useState(false)

  const params = useSearchStore((state) => state.params)
  const setParams = useSearchStore((state) => state.setParams)
  const setSearch = useSearchStore((state) => state.setSearch)

  // Autocomplete hooks - enabled when showing list
  const { data: countries } = useCountries(
    countrySearch,
    10,
    showCountryList || countrySearch.length > 0,
  )
  const { data: cities } = useCities(
    citySearch,
    10,
    params.countryId,
    showCityList || citySearch.length > 0,
  )
  const { data: amenities } = useAmenities(
    amenitySearch,
    10,
    showAmenityList || amenitySearch.length > 0,
  )
  const { data: cuisines } = useCuisines(
    cuisineSearch,
    10,
    showCuisineList || cuisineSearch.length > 0,
  )
  const { data: facilities } = useFacilities(
    facilitySearch,
    10,
    showFacilityList || facilitySearch.length > 0,
  )

  const handleCountryFocus = useCallback(() => {
    setCountrySearch('')
    setShowCountryList(true)
  }, [])

  const handleCityFocus = useCallback(() => {
    setCitySearch('')
    setShowCityList(true)
  }, [])

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
        <View style={styles.advancedPanel}>
          <ScrollView
            style={styles.advancedScroll}
            showsVerticalScrollIndicator
            contentContainerStyle={styles.advancedContent}
          >
            {/* COUNTRY */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.country')}</Text>

              {params.countryId ? (
                <Pressable
                  style={styles.selectedChip}
                  onPress={() => {
                    setParams({ countryId: undefined, cityId: undefined })
                    setCountrySearch('')
                    setCitySearch('')
                  }}
                >
                  <Text style={styles.selectedChipLabel}>{countrySearch}</Text>
                </Pressable>
              ) : (
                <>
                  <SearchBar
                    value={countrySearch}
                    onChangeText={(text) => {
                      setCountrySearch(text)
                      setShowCountryList(true)
                    }}
                    placeholder={t('filters.countryPlaceholder')}
                  />

                  {showCountryList && countries?.length > 0 && (
                    <View style={styles.countryList}>
                      {countries.slice(0, 5).map((country: any) => (
                        <Pressable
                          key={country.id}
                          style={styles.countryItem}
                          onPress={() => {
                            setParams({
                              countryId: country.id,
                              cityId: undefined,
                              lat: undefined,
                              lng: undefined,
                              radiusKm: undefined,
                            })
                            setCountrySearch(country.name)
                            setShowCountryList(false)
                          }}
                        >
                          <Text style={styles.countryText}>{country.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* CITY */}
            {params.countryId && (
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>{t('filters.city')}</Text>

                {params.cityId ? (
                  <Pressable
                    style={styles.selectedChip}
                    onPress={() => {
                      setParams({ cityId: undefined })
                      setCitySearch('')
                    }}
                  >
                    <Text style={styles.selectedChipLabel}>{citySearch}</Text>
                  </Pressable>
                ) : (
                  <>
                    <SearchBar
                      value={citySearch}
                      onChangeText={(text) => {
                        setCitySearch(text)
                        setShowCityList(true)
                      }}
                      onFocus={handleCityFocus}
                      placeholder={t('filters.cityPlaceholder')}
                    />

                    {showCityList && cities && cities.length > 0 && (
                      <View style={styles.countryList}>
                        {cities.slice(0, 5).map((city: any) => (
                          <Pressable
                            key={city.id}
                            style={styles.countryItem}
                            onPress={() => {
                              setParams({ cityId: city.id, lat: undefined, lng: undefined, radiusKm: undefined })
                              setCitySearch(city.name)
                              setShowCityList(false)
                            }}
                          >
                            <Text style={styles.countryText}>{city.name}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </>
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
              {params.cuisineIds && params.cuisineIds.length > 0 ? (
                <View style={styles.selectedRow}>
                  {params.cuisineIds.map((id) => {
                    const cuisine = cuisines?.find((c) => c.id === id)
                    return cuisine ? (
                      <Pressable
                        key={id}
                        style={styles.selectedChip}
                        onPress={() => {
                          const newIds = params.cuisineIds?.filter((i) => i !== id)
                          setParams({ cuisineIds: newIds?.length ? newIds : undefined })
                        }}
                      >
                        <Text style={styles.selectedChipLabel}>{cuisine.name}</Text>
                      </Pressable>
                    ) : null
                  })}
                </View>
              ) : (
                <>
                  <SearchBar
                    value={cuisineSearch}
                    onChangeText={setCuisineSearch}
                    onFocus={() => setShowCuisineList(true)}
                    placeholder={t('filters.cuisinesPlaceholder')}
                  />
                  {showCuisineList && cuisines && cuisines.length > 0 && (
                    <View style={styles.countryList}>
                      {cuisines.slice(0, 5).map((cuisine) => (
                        <Pressable
                          key={cuisine.id}
                          style={styles.countryItem}
                          onPress={() => {
                            const currentIds = params.cuisineIds || []
                            if (!currentIds.includes(cuisine.id)) {
                              setParams({ cuisineIds: [...currentIds, cuisine.id] })
                            }
                            setCuisineSearch('')
                            setShowCuisineList(false)
                          }}
                        >
                          <Text style={styles.countryText}>{cuisine.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* FACILITIES */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.facilities')}</Text>
              {params.facilityIds && params.facilityIds.length > 0 ? (
                <View style={styles.selectedRow}>
                  {params.facilityIds.map((id) => {
                    const facility = facilities?.find((f) => f.id === id)
                    return facility ? (
                      <Pressable
                        key={id}
                        style={styles.selectedChip}
                        onPress={() => {
                          const newIds = params.facilityIds?.filter((i) => i !== id)
                          setParams({ facilityIds: newIds?.length ? newIds : undefined })
                        }}
                      >
                        <Text style={styles.selectedChipLabel}>{facility.name}</Text>
                      </Pressable>
                    ) : null
                  })}
                </View>
              ) : (
                <>
                  <SearchBar
                    value={facilitySearch}
                    onChangeText={setFacilitySearch}
                    onFocus={() => setShowFacilityList(true)}
                    placeholder={t('filters.facilitiesPlaceholder')}
                  />
                  {showFacilityList && facilities && facilities.length > 0 && (
                    <View style={styles.countryList}>
                      {facilities.slice(0, 5).map((facility) => (
                        <Pressable
                          key={facility.id}
                          style={styles.countryItem}
                          onPress={() => {
                            const currentIds = params.facilityIds || []
                            if (!currentIds.includes(facility.id)) {
                              setParams({ facilityIds: [...currentIds, facility.id] })
                            }
                            setFacilitySearch('')
                            setShowFacilityList(false)
                          }}
                        >
                          <Text style={styles.countryText}>{facility.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* AMENITIES */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filters.amenities')}</Text>
              {params.amenityIds && params.amenityIds.length > 0 ? (
                <View style={styles.selectedRow}>
                  {params.amenityIds.map((id) => {
                    const amenity = amenities?.find((a) => a.id === id)
                    return amenity ? (
                      <Pressable
                        key={id}
                        style={styles.selectedChip}
                        onPress={() => {
                          const newIds = params.amenityIds?.filter((i) => i !== id)
                          setParams({ amenityIds: newIds?.length ? newIds : undefined })
                        }}
                      >
                        <Text style={styles.selectedChipLabel}>{amenity.name}</Text>
                      </Pressable>
                    ) : null
                  })}
                </View>
              ) : (
                <>
                  <SearchBar
                    value={amenitySearch}
                    onChangeText={setAmenitySearch}
                    onFocus={() => setShowAmenityList(true)}
                    placeholder={t('filters.amenitiesPlaceholder')}
                  />
                  {showAmenityList && amenities && amenities.length > 0 && (
                    <View style={styles.countryList}>
                      {amenities.slice(0, 5).map((amenity) => (
                        <Pressable
                          key={amenity.id}
                          style={styles.countryItem}
                          onPress={() => {
                            const currentIds = params.amenityIds || []
                            if (!currentIds.includes(amenity.id)) {
                              setParams({ amenityIds: [...currentIds, amenity.id] })
                            }
                            setAmenitySearch('')
                            setShowAmenityList(false)
                          }}
                        >
                          <Text style={styles.countryText}>{amenity.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>
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
    backgroundColor: colors.byUniverse.purpleEngaged,
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
  countryList: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: spacing[1],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: spacing[1],
  },
  countryItem: {
    padding: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  countryText: {
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
  },
})
