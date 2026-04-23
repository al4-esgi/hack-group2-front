import { useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SearchBar } from '@/components/ui/search-bar'
import { useRestaurants, useCuisines, useFacilities } from '../../hooks/useRestaurants'
import { useRestaurantStore } from '../../stores/restaurant.store'
import type { Restaurant } from '../../types/restaurant'

export default function SearchesScreen() {
  const [query, setQuery] = useState('')
  const setSearch = useRestaurantStore((state) => state.setSearch)
  const { data: restaurants, isLoading: isLoadingRestaurants } = useRestaurants()
  const { data: cuisines, isLoading: isLoadingCuisines } = useCuisines(query || undefined, 5)
  const { data: facilities, isLoading: isLoadingFacilities } = useFacilities(query || undefined, 5)

  const handleSearch = (text: string) => {
    setQuery(text)
    setSearch(text)
  }

  const hasResults =
    (restaurants && restaurants.restaurants.length > 0) ||
    (cuisines && cuisines.length > 0) ||
    (facilities && facilities.length > 0)

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultLabel}>{item.name}</Text>
      <Text style={styles.resultSubtext}>
        {item.city}, {item.country}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherches</Text>
      <Text style={styles.subtitle}>
        Lance une recherche et retrouve des suggestions rapides.
      </Text>

      <SearchBar
        value={query}
        onChangeText={handleSearch}
        placeholder="Rechercher un lieu, une catégorie..."
      />

      {isLoadingRestaurants || isLoadingCuisines || isLoadingFacilities ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : query.trim() === '' ? (
        <FlatList
          data={[]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>{item}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyState}>Aucun résultat pour cette recherche.</Text>
          }
        />
      ) : hasResults ? (
        <FlatList
          data={restaurants?.restaurants || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurant}
          ListHeaderComponent={
            cuisines && cuisines.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cuisines</Text>
                {cuisines.map((cuisine) => (
                  <View key={cuisine.id} style={styles.resultCard}>
                    <Text style={styles.resultLabel}>{cuisine.name}</Text>
                  </View>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyState}>Aucun restaurant trouvé pour cette recherche.</Text>
          }
        />
      ) : (
        <Text style={styles.emptyState}>Aucun résultat pour cette recherche.</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#101010',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    color: '#5a5a5a',
    fontSize: 15,
  },
  loadingText: {
    marginTop: 14,
    color: '#555555',
    fontSize: 15,
    textAlign: 'center',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 15,
    color: '#222222',
  },
  resultSubtext: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  emptyState: {
    color: '#555555',
    fontSize: 15,
  },
})
