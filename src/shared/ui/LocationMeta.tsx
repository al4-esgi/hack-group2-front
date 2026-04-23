import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/src/app/theme/tokens'

type LocationMetaProps = {
  city: string
  area?: string
  distanceKm?: number
}

export function LocationMeta({ city, area, distanceKm }: LocationMetaProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.value}>{city}</Text>
      {area ? <Text style={styles.value}>· {area}</Text> : null}
      {distanceKm !== undefined ? <Text style={styles.value}>· {distanceKm.toFixed(1)} km</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
})
