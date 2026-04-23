import { useState } from 'react'
import { StyleSheet, View, Text, Pressable } from 'react-native'
import AutocompleteInput from 'react-native-autocomplete-input'
import { FilterChip } from './FilterChip'
import { colors, spacing, typography, radius } from '@/src/app/theme/tokens'

interface FilterItem {
  id: number
  name: string
}

interface AutocompleteFilterProps {
  data: FilterItem[] | undefined
  value: string
  onChangeText: (text: string) => void
  onSelect: (item: FilterItem) => void
  selectedIds: number[] | undefined
  onRemove: (id: number) => void
  placeholder: string
  loading?: boolean
  selectedItemsCache?: FilterItem[]
}

export function AutocompleteFilter({
  data,
  value,
  onChangeText,
  onSelect,
  selectedIds,
  onRemove,
  placeholder,
  loading = false,
  selectedItemsCache,
}: AutocompleteFilterProps) {
  const [hasSelected, setHasSelected] = useState(false)
  const [lastValidText, setLastValidText] = useState('')

  const selectedItems = selectedItemsCache || (data || []).filter((item) => selectedIds?.includes(item.id))


  // Filter data based on text input - only show if input has text
  const filteredData = (data || [])
    .filter((item) => item.name.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 5)

  // Show dropdown only when input has text and has matching items
  const showDropdown = value.trim().length > 0 && filteredData.length > 0

  // Handle text changes - detect selection
  const handleChangeText = (text: string) => {
    if (text === value) return // No change

    setLastValidText(text)

    // Check if text matches an item exactly (selection)
    const exactMatch = data?.find((item) => item.name.toLowerCase() === text.toLowerCase())

    if (exactMatch && !hasSelected) {
      // User selected an item
      setHasSelected(true)
      onSelect(exactMatch)
      // Clear input after selection
      setTimeout(() => {
        onChangeText('')
        setLastValidText('')
        setHasSelected(false)
      }, 100)
      return
    }

    // User is typing
    if (text !== '') {
      setHasSelected(false)
    }

    onChangeText(text)
  }

  const handleBlur = () => {
    // On blur, try to select if we have valid text
    if (lastValidText) {
      const match = data?.find((item) => item.name.toLowerCase() === lastValidText.toLowerCase())
      if (match && !selectedIds?.includes(match.id)) {
        onSelect(match)
        setTimeout(() => {
          onChangeText('')
          setLastValidText('')
        }, 100)
      }
    }
  }

  console.log(selectedIds, selectedItems)

  return (
    <View style={styles.container}>
      {/* Selected chips */}
      {selectedItems.length > 0 && (
        <View style={styles.selectedContainer}>
          {selectedItems.map((item) => (
            <FilterChip
              key={item.id}
              label={item.name}
              active={true}
              onPress={() => onRemove(item.id)}
            />
          ))}
        </View>
      )}

      {/* Autocomplete input */}
      <AutocompleteInput
        data={showDropdown ? filteredData.map((item) => item.name) : []}
        value={value}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        placeholder={placeholder}
        containerStyle={styles.autocompleteContainer}
        inputContainerStyle={styles.inputContainer}
        listContainerStyle={styles.listContainer}
        flatListProps={{
          keyExtractor: (item, index) => index.toString(),
          renderItem: ({ item }) => (
            <Pressable
              onPress={() => {
                const match = data?.find((d) => d.name === item)
                if (match) {
                  const currentIds = selectedIds || []
                  if (!currentIds.includes(match.id)) {
                    onSelect(match)
                  }
                  onChangeText('')
                  setLastValidText('')
                }
              }}
              style={styles.item}
            >
              <Text style={styles.itemText}>{item}</Text>
            </Pressable>
          ),
          scrollEnabled: false,
        }}
      />
      {loading && <Text style={styles.loading}>Carregando...</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  autocompleteContainer: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  listContainer: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radius.lg,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 0,
    maxHeight: 180,
  },
  item: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  itemText: {
    fontSize: typography.fontSize.body,
    color: colors.textPrimary,
  },
  loading: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.subText,
    marginTop: spacing[1],
  },
})
