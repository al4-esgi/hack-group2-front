import { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTikTokHashtags, useInstagramHashtags } from '@/src/hooks/useSocial'
import { ReelFeed } from '@/src/shared/ui/ReelFeed'

export default function FeedScreen() {
  const tikTokQuery = useTikTokHashtags(
    {
      tags: ['guide michelin'],
      limit: 30,
    },
    true,
  )

  const instagramQuery = useInstagramHashtags(
    {
      tags: ['guide michelin'],
      limit: 30,
    },
    true,
  )

  const { data: tikTokData, isLoading: tikTokLoading } = tikTokQuery
  const { data: instagramData, isLoading: instagramLoading } = instagramQuery

  const isLoading = tikTokLoading || instagramLoading

  const posts = useMemo(() => {
    const merged = [...(tikTokData || []), ...(instagramData || [])]
    for (let i = merged.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[merged[i], merged[j]] = [merged[j], merged[i]]
    }
    return merged
  }, [tikTokData, instagramData])

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  ) : (
    <ReelFeed posts={posts} />
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
})
