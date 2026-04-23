import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { PageHeader, Screen, SearchResultList, SearchFilters } from '@/src/shared/ui'
import { spacing } from '@/src/app/theme/tokens'

export default function SearchesScreen() {
  const [query, setQuery] = useState('')

  return (
    <Screen>
      <View style={styles.container}>
        <PageHeader title="Recherches" />
        <SearchFilters query={query} onSearchChange={setQuery} />
      </View>
      <SearchResultList query={query} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
})