import { useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Text } from '@/components/ui/text'
import { getCurrentUser } from '@/src/api/users.api'
import { colors, radius } from '@/src/app/theme/tokens'
import { StaleTimes } from '@/src/constants/query.constant'
import { useAuthStore } from '@/src/stores/auth.store'
import {
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingState,
  PageHeader,
  PrimaryButton,
  Screen,
  Section,
  TertiaryButton,
} from '@/src/shared/ui'

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
  ],
  lists: [
    { icon: '🗺', title: 'Roadtrip Paris', count: 6 },
    { icon: '⭐', title: 'Date night', count: 4 },
    { icon: '☀️', title: 'Brunch du dimanche', count: 5 },
  ],
  favorites: [
    { icon: '❤️', title: 'Le Petit Rivage', count: 1 },
    { icon: '❤️', title: 'Bistro Luna', count: 1 },
    { icon: '❤️', title: 'Parc des Arts', count: 1 },
  ],
}

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
      <Screen scrollable>
        <PageHeader title="Profil" subtitle="Espace membre et préférences." />
        <EmptyState
          title="Connexion requise"
          description="Connecte-toi pour voir ton profil, tes listes et tes favoris."
          actionLabel="Se connecter"
          onAction={onRequestLogin}
        />
      </Screen>
    )
  }

  const firstLetter = (currentUser?.firstname?.[0] ?? 'A').toUpperCase()
  const displayName = currentUser ? `${currentUser.firstname} ${currentUser.lastname}`.trim() : 'Profil'
  const displayedCollections = COLLECTIONS_BY_TAB[activeCollectionTab]

  return (
    <Screen scrollable>
      <Section>
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
            <Text style={styles.meta}>MEMBRE · COMPTE CONNECTÉ</Text>
          </View>
        </View>
      </Section>

      {isLoading ? <LoadingState label="Chargement du profil..." /> : null}
      {isError ? (
        <ErrorState message="Impossible de charger ton profil." onRetry={() => void refetch()} />
      ) : null}

      {currentUser ? (
        <Section bordered>
          <Text style={styles.profileLabel}>
            Nom: {currentUser.firstname} {currentUser.lastname}
          </Text>
          <Text style={styles.profileLabel}>Email: {currentUser.email}</Text>
          <Text style={styles.profileMeta}>ID: {currentUser.id}</Text>
        </Section>
      ) : null}

      <Section title="Mes collections">
        <View style={styles.segmentTabs}>
          {COLLECTION_TABS.map((tab) => (
            <TertiaryButton
              key={tab.key}
              label={tab.label}
              onPress={() => setActiveCollectionTab(tab.key)}
              active={activeCollectionTab === tab.key}
            />
          ))}
        </View>

        <View style={styles.listWrapper}>
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
        </View>
      </Section>

      <Section title="Mes goûts">
        <View style={styles.tastesWrap}>
          {TASTE_CHIPS.map((taste, index) => (
            <FilterChip key={taste} label={taste} active={index < 2} />
          ))}
        </View>
      </Section>

      <PrimaryButton label="Se déconnecter" onPress={clearToken} />
    </Screen>
  )
}

const styles = StyleSheet.create({
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
    color: colors.primary,
  },
  identityBlock: {
    flex: 1,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 32,
    color: colors.textPrimary,
  },
  meta: {
    marginTop: 1,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
  segmentTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  listWrapper: {
    gap: 8,
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
  tastesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
})
