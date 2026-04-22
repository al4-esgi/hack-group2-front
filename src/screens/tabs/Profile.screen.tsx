import { useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { AppActionButton } from '@/components/ui/app-action-button'
import { getCurrentUser } from '../../api/users.api'
import { colors, radius } from '../../app/theme/tokens'
import { StaleTimes } from '../../constants/query.constant'
import { useAuthStore } from '../../stores/auth.store'

type ProfileScreenProps = {
  isAuthenticated: boolean
  onRequestLogin: () => void
}

const TASTE_CHIPS = ['Bistrot', 'Produits frais', 'Vin nature', '< 40€', 'Terrasse', 'Asiatique']

type CollectionTabKey = 'visited' | 'lists' | 'favorites'

const COLLECTION_TABS: { key: CollectionTabKey; label: string }[] = [
  { key: 'visited', label: 'Visités' },
  { key: 'lists', label: 'Listes' },
  { key: 'favorites', label: 'Favoris' },
]

const COLLECTIONS_BY_TAB: Record<CollectionTabKey, { icon: string; title: string; count: number }[]> = {
  visited: [
    { icon: '🍝', title: 'Mamma Roma', count: 1 },
    { icon: '🍣', title: 'Sora Sushi', count: 2 },
    { icon: '🥩', title: 'Grill 21', count: 1 },
    { icon: '🥐', title: 'Maison Levain', count: 1 },
    { icon: '🥗', title: 'Vert minute', count: 1 },
  ],
  lists: [
    { icon: '🗺', title: 'Roadtrip Paris', count: 6 },
    { icon: '⭐', title: 'Date night', count: 4 },
    { icon: '☀️', title: 'Brunch du dimanche', count: 5 },
    { icon: '🌃', title: 'Open late', count: 3 },
  ],
  favorites: [
    { icon: '❤️', title: 'Le Petit Rivage', count: 1 },
    { icon: '❤️', title: 'Bistro Luna', count: 1 },
    { icon: '❤️', title: 'Parc des Arts', count: 1 },
    { icon: '❤️', title: 'Casa Verde', count: 1 },
  ],
}

const MAX_VISIBLE_COLLECTION_ROWS = 3

export default function ProfileScreen({ isAuthenticated, onRequestLogin }: ProfileScreenProps) {
  const clearToken = useAuthStore((state) => state.clearToken)
  const token = useAuthStore((state) => state.token)
  const [activeCollectionTab, setActiveCollectionTab] = useState<CollectionTabKey>('visited')

  const { data: currentUser, isLoading, isError, refetch } = useQuery({
    queryKey: ['current-user', token],
    queryFn: getCurrentUser,
    enabled: isAuthenticated && Boolean(token),
    staleTime: StaleTimes.FIVE_MINUTES,
  })

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.lockedMessage}>Il faut se connecter pour acceder a cette page.</Text>
        <AppActionButton label="Se connecter" onPress={onRequestLogin} variant="primary" />
      </View>
    )
  }

  const firstLetter = (currentUser?.firstname?.[0] ?? 'A').toUpperCase()
  const displayName = currentUser ? `${currentUser.firstname} ${currentUser.lastname}`.trim() : 'Profil'
  const displayedCollections = COLLECTIONS_BY_TAB[activeCollectionTab]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          {currentUser?.photoUrl ? (
            <Image source={{ uri: currentUser.photoUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarLetter}>{firstLetter}</Text>
          )}
        </View>
        <View style={styles.identityBlock}>
          <Text style={styles.title}>{displayName}</Text>
          <Text style={styles.meta}>MEMBRE · COMPTE CONNECTE</Text>
        </View>
        <View style={styles.settingsChip}>
          <Text style={styles.settingsChipLabel}>⚙</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.red} />
          <Text style={styles.loadingLabel}>Chargement du profil...</Text>
        </View>
      ) : null}

      {isError ? (
        <View style={styles.block}>
          <Text style={styles.profileLabel}>Impossible de charger ton profil.</Text>
          <AppActionButton label="Réessayer" onPress={() => void refetch()} variant="secondary" />
        </View>
      ) : null}

      {currentUser ? (
        <View style={styles.block}>
          <Text style={styles.profileLabel}>
            Nom: {currentUser.firstname} {currentUser.lastname}
          </Text>
          <Text style={styles.profileLabel}>Email: {currentUser.email}</Text>
          <Text style={styles.profileMeta}>ID: {currentUser.id}</Text>
        </View>
      ) : null}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>Actif</Text>
          <Text style={styles.statLabel}>statut</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>visites</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>listes</Text>
        </View>
      </View>

      <View style={styles.segmentTabs}>
        {COLLECTION_TABS.map((tab) => (
          <AppActionButton
            key={tab.key}
            label={tab.label}
            onPress={() => setActiveCollectionTab(tab.key)}
            variant="tertiary"
            active={activeCollectionTab === tab.key}
            style={styles.segmentButton}
          />
        ))}
      </View>

      <View style={styles.listScrollArea}>
        <ScrollView contentContainerStyle={styles.listWrapper} nestedScrollEnabled>
          {displayedCollections.map((collection) => (
            <View key={`${activeCollectionTab}-${collection.title}`} style={styles.listRow}>
              <View style={styles.listIconBox}>
                <Text style={styles.listIcon}>{collection.icon}</Text>
              </View>
              <View style={styles.listTexts}>
                <Text style={styles.listTitle}>{collection.title}</Text>
                <Text style={styles.listSub}>
                  {collection.count} {collection.count > 1 ? 'lieux' : 'lieu'}
                </Text>
              </View>
              <Text style={styles.listChevron}>›</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tastesSection}>
        <Text style={styles.tastesTitle}>Mes goûts</Text>
        <View style={styles.tastesWrap}>
          {TASTE_CHIPS.map((taste, index) => {
            const isHighlighted = index < 2
            return (
              <View
                key={taste}
                style={[
                  styles.tasteChip,
                  isHighlighted ? styles.tasteChipHighlight : undefined,
                ]}
              >
                <Text
                  style={[
                    styles.tasteChipLabel,
                    isHighlighted ? styles.tasteChipLabelHighlight : undefined,
                  ]}
                >
                  {taste}
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      <AppActionButton
        label="Se déconnecter"
        onPress={clearToken}
        variant="secondary"
        style={styles.logoutButton}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.backgroundPrimary,
  },
  lockedMessage: {
    marginTop: 2,
    marginBottom: 14,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLetter: {
    fontSize: 23,
    fontWeight: '700',
    color: colors.red,
  },
  identityBlock: {
    flex: 1,
  },
  meta: {
    marginTop: 1,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  settingsChip: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  settingsChipLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingContainer: {
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSubtle,
    paddingVertical: 12,
  },
  loadingLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  block: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSubtle,
    padding: 10,
    gap: 5,
  },
  profileLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  profileMeta: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    backgroundColor: colors.backgroundSubtle,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  segmentTabs: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  segmentButton: {
    flex: 0,
    width: 'auto',
    minHeight: 34,
    paddingHorizontal: 2,
    alignSelf: 'flex-start',
  },
  listScrollArea: {
    maxHeight: MAX_VISIBLE_COLLECTION_ROWS * 56 + (MAX_VISIBLE_COLLECTION_ROWS - 1) * 8,
  },
  listWrapper: {
    gap: 8,
    paddingRight: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 8,
    backgroundColor: colors.backgroundSubtle,
  },
  listIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIcon: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listTexts: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  listSub: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listChevron: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  tastesSection: {
    marginTop: 3,
  },
  tastesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  tastesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tasteChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.backgroundPrimary,
  },
  tasteChipHighlight: {
    borderColor: colors.red,
  },
  tasteChipLabel: {
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textPrimary,
    fontWeight: '600',
  },
  tasteChipLabelHighlight: {
    color: colors.red,
  },
  logoutButton: {
    marginTop: 12,
  },
})
