import { useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SearchBar } from '@/components/ui/search-bar'
import { useSearch, useCities, useCountries } from '@/src/hooks/useSearch'
import { useSearchStore } from '../../stores/search.store'
import type { Restaurant } from '../../types/restaurant.type'

export default function SearchesScreen() {
  const [query, setQuery] = useState('')
  const setSearch = useSearchStore((state) => state.setSearch)

  const { data: restaurants, isLoading: isLoadingRestaurants } = useSearch()
  const { data: countries } = useCountries()
  const { data: cities } = useCities()

  const handleSearch = (text: string) => {
    setQuery(text)
    setSearch(text)
  }

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
      <Text style={styles.subtitle}>Lance une recherche et retrouve des suggestions rapides.</Text>

      <SearchBar
        value={query}
        onChangeText={handleSearch}
        placeholder="Rechercher un lieu, une catégorie..."
      />

      {isLoadingRestaurants ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : query.trim() === '' ? (
        <FlatList
          data={restaurants?.restaurants || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurant}
          ListEmptyComponent={
            <Text style={styles.emptyState}>Aucun résultat pour cette recherche.</Text>
          }
        />
      ) : restaurants?.restaurants && restaurants.restaurants.length > 0 ? (
        <FlatList
          data={restaurants.restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurant}
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
