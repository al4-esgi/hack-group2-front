import React, { useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  useWindowDimensions,
  FlatList,
  StatusBar,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { typography } from '@/src/app/theme/tokens'
import type { SocialPost, TikTokPost, InstagramPost } from '@/src/types/social.type'

type ReelFeedProps = {
  posts: SocialPost[]
}

type ReelItemProps = {
  post: SocialPost
}

function getTikTokEmbedHtml(post: TikTokPost): string {
  const videoId = post.url.split('/video/')?.[1]?.split('?')?.[0] || ''

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
          }
          iframe {
            width: 100%;
            height: 100vh;
            border: none;
          }
        </style>
        <script>
          (function() {
            window.open = function() { return null; };
            document.addEventListener('click', function(e) {
              if (e.target.href && e.target.href.includes('snssdk://')) {
                e.preventDefault();
                e.stopPropagation();
              }
            }, true);
          })();
        </script>
      </head>
      <body>
        <iframe
          src="https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&embed_can_play=1"
          allow="autoplay; fullscreen; encrypted-media"
          allowfullscreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
        ></iframe>
      </body>
    </html>
  `
}

function getInstagramVideoEmbedHtml(postUrl: string): string {
  const embedUrl = postUrl.replace(/\/?$/, '/embed/')
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body, html {
            margin: 0; padding: 0;
            width: 100%; height: 100%;
            overflow: hidden;
            background: #000;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe
          src="${embedUrl}"
          allow="autoplay; fullscreen"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `
}

function InstagramCard({ post, height }: { post: InstagramPost; height: number }) {
  const isVideo = post.type === 'Video'

  if (isVideo) {
    const html = getInstagramVideoEmbedHtml(post.url)
    return (
      <View style={[styles.instagramCard, { height }]}>
        <WebView
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          androidLayerType="hardware"
          scalesPageToFit={false}
          bounces={false}
          overScrollMode="never"
          onShouldStartLoadWithRequest={(navState) => {
            if (navState.url.startsWith('instagram://')) return false
            return true
          }}
        />
      </View>
    )
  }

  const imageUrl = post.displayUrl || post.images?.[0]

  return (
    <View style={[styles.instagramCard, { height }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.instagramImage} resizeMode="cover" />
      ) : (
        <View style={styles.instagramPlaceholder} />
      )}
      <View style={styles.instagramOverlay}>
        <View style={styles.instagramHeader}>
          <Text style={styles.instagramSource}>Instagram</Text>
        </View>
        <View style={styles.instagramFooter}>
          <Text style={styles.instagramUsername}>@{post.username}</Text>
          {post.caption ? (
            <Text style={styles.instagramCaption} numberOfLines={2}>
              {post.caption}
            </Text>
          ) : null}
          <View style={styles.instagramStats}>
            {post.likesCount != null && (
              <Text style={styles.instagramStat}>♥ {post.likesCount.toLocaleString()}</Text>
            )}
            <Text style={styles.instagramStat}>💬 {post.commentsCount.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

function ReelItem({ post }: ReelItemProps) {
  const { height: screenHeight } = useWindowDimensions()
  const reelHeight = screenHeight - 80 - (StatusBar.currentHeight ?? 0)

  const isTikTok = 'playCount' in post

  if (!isTikTok) {
    return <InstagramCard post={post as InstagramPost} height={reelHeight} />
  }

  const html = getTikTokEmbedHtml(post as TikTokPost)

  const handleShouldStartLoadWithRequest = (navState: any) => {
    if (navState.url.startsWith('snssdk://') || navState.url.includes('tiktok.com/@')) {
      return false
    }
    return true
  }

  return (
    <View style={[styles.itemContainer, { height: reelHeight }]} key={post.id}>
      <View style={styles.webviewContainer}>
        <WebView
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent
            console.warn('WebView error: ', nativeEvent)
          }}
          androidLayerType="hardware"
          androidHardwareAccelerationDisabled={false}
          scalesPageToFit={false}
          bounces={false}
          overScrollMode="never"
        />
      </View>
    </View>
  )
}

export function ReelFeed({ posts }: ReelFeedProps) {
  const { height: screenHeight } = useWindowDimensions()
  const itemHeight = screenHeight - 80 - (StatusBar.currentHeight ?? 0)

  const handleGetItemLayout = useCallback(
    (_data: ArrayLike<SocialPost> | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight],
  )

  if (posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune vidéo disponible</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <ReelItem post={item} />}
        keyExtractor={(item) => item.id}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={handleGetItemLayout}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        contentContainerStyle={{ backgroundColor: 'black' }}
        bounces={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  itemContainer: {
    width: Dimensions.get('window').width,
    overflow: 'hidden',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  webview: {
    flex: 1,
    backgroundColor: 'black',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyText: {
    color: 'white',
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
  },
  instagramCard: {
    width: Dimensions.get('window').width,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  instagramImage: {
    width: '100%',
    height: '100%',
  },
  instagramPlaceholder: {
    flex: 1,
    backgroundColor: '#111',
  },
  instagramOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  instagramHeader: {
    padding: 16,
    paddingTop: 48,
  },
  instagramSource: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(225,48,108,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  instagramFooter: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  instagramUsername: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  instagramCaption: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginBottom: 8,
  },
  instagramStats: {
    flexDirection: 'row',
    gap: 12,
  },
  instagramStat: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
})
