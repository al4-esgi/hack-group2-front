import { useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Text } from '@/components/ui/text'
import { createUserList, getCurrentUser, getUserLists, type UserList } from '@/src/api/users.api'
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
  SecondaryButton,
  Screen,
  Section,
  TextField,
  TertiaryButton,
} from '@/src/shared/ui'

type ProfileScreenProps = {
  isAuthenticated: boolean
  onRequestLogin: () => void
}

const TASTE_CHIPS = ['Bistrot', 'Produits frais', 'Vin nature', '< 40€', 'Terrasse', 'Asiatique']

type CollectionTabKey = 'visited' | 'lists' | 'favorites'
type DisplayCollection = {
  id: string
  icon: string
  title: string
  count: number
}

const COLLECTION_TABS: { key: CollectionTabKey; label: string }[] = [
  { key: 'visited', label: 'Visité' },
  { key: 'lists', label: 'Listes' },
  { key: 'favorites', label: 'Favoris' },
]

const RESERVED_LIST_NAMES = new Set(['liked', 'visited'])

function normalizeListName(name: string) {
  return name.trim().toLowerCase()
}

function buildCollectionItem(list: UserList, icon: string, titleOverride?: string): DisplayCollection {
  return {
    id: list.id,
    icon,
    title: titleOverride ?? list.name,
    count: list.itemsCount,
  }
}

export default function ProfileScreen({ isAuthenticated, onRequestLogin }: ProfileScreenProps) {
  const clearToken = useAuthStore((state) => state.clearToken)
  const token = useAuthStore((state) => state.token)
  const [activeCollectionTab, setActiveCollectionTab] = useState<CollectionTabKey>('visited')
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [createListError, setCreateListError] = useState<string | null>(null)
  const [isCreatingList, setIsCreatingList] = useState(false)

  const { data: currentUser, isLoading, isError, refetch } = useQuery({
    queryKey: ['current-user', token],
    queryFn: getCurrentUser,
    enabled: isAuthenticated && Boolean(token),
    staleTime: StaleTimes.FIVE_MINUTES,
  })

  const {
    data: userLists = [],
    isLoading: isListsLoading,
    isError: isListsError,
    refetch: refetchLists,
  } = useQuery({
    queryKey: ['user-lists', currentUser?.id],
    queryFn: () => getUserLists(currentUser!.id),
    enabled: isAuthenticated && Boolean(token) && Boolean(currentUser?.id),
    staleTime: StaleTimes.ONE_MINUTE,
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
  const visitedList = userLists.find((list) => normalizeListName(list.name) === 'visited')
  const likedList = userLists.find((list) => normalizeListName(list.name) === 'liked')
  const customLists = userLists.filter((list) => !RESERVED_LIST_NAMES.has(normalizeListName(list.name)))

  const displayedCollections: DisplayCollection[] =
    activeCollectionTab === 'visited'
      ? visitedList
        ? [buildCollectionItem(visitedList, '📍', 'Visité')]
        : []
      : activeCollectionTab === 'favorites'
        ? likedList
          ? [buildCollectionItem(likedList, '❤️', 'Favoris')]
          : []
        : customLists.map((list) => buildCollectionItem(list, '🗂'))

  const handleCreateList = async () => {
    if (!currentUser?.id || isCreatingList) {
      return
    }

    const trimmedName = newListName.trim()

    if (!trimmedName) {
      setCreateListError('Le nom de la fiche est requis.')
      return
    }

    if (RESERVED_LIST_NAMES.has(normalizeListName(trimmedName))) {
      setCreateListError('Les noms "liked" et "visited" sont réservés.')
      return
    }

    setCreateListError(null)
    setIsCreatingList(true)

    try {
      await createUserList(currentUser.id, { name: trimmedName })
      setNewListName('')
      setIsCreateFormVisible(false)
      await refetchLists()
      setActiveCollectionTab('lists')
    } catch {
      setCreateListError('Impossible de créer la fiche pour le moment.')
    } finally {
      setIsCreatingList(false)
    }
  }

  const collectionEmptyStateTitle =
    activeCollectionTab === 'visited'
      ? 'Aucune adresse visitée'
      : activeCollectionTab === 'favorites'
        ? 'Aucun favori'
        : 'Aucune fiche personnalisée'

  const collectionEmptyStateDescription =
    activeCollectionTab === 'lists'
      ? 'Crée ta première fiche pour organiser tes adresses.'
      : 'Cette section sera alimentée dès que des restaurants y seront ajoutés.'

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
              onPress={() => {
                setActiveCollectionTab(tab.key)
                setCreateListError(null)
              }}
              active={activeCollectionTab === tab.key}
            />
          ))}
        </View>

        {activeCollectionTab === 'lists' ? (
          <View style={styles.listActions}>
            {isCreateFormVisible ? (
              <View style={styles.createListForm}>
                <TextField
                  label="Nom de la fiche"
                  value={newListName}
                  onChangeText={(value) => {
                    setNewListName(value)
                    if (createListError) {
                      setCreateListError(null)
                    }
                  }}
                  placeholder="Ex: Date nights"
                  autoCapitalize="sentences"
                  errorText={createListError}
                />
                <View style={styles.createListButtons}>
                  <SecondaryButton
                    label="Annuler"
                    fullWidth={false}
                    onPress={() => {
                      setIsCreateFormVisible(false)
                      setNewListName('')
                      setCreateListError(null)
                    }}
                  />
                  <PrimaryButton
                    label={isCreatingList ? 'Création...' : 'Créer'}
                    fullWidth={false}
                    onPress={() => void handleCreateList()}
                    disabled={isCreatingList}
                  />
                </View>
              </View>
            ) : (
              <SecondaryButton
                label="Créer une fiche"
                fullWidth={false}
                onPress={() => {
                  setIsCreateFormVisible(true)
                  setCreateListError(null)
                }}
              />
            )}
          </View>
        ) : null}

        <View style={styles.listWrapper}>
          {isLoading || isListsLoading ? <LoadingState label="Chargement des collections..." /> : null}
          {isError ? (
            <ErrorState message="Impossible de charger tes collections." onRetry={() => void refetch()} />
          ) : null}
          {isListsError ? (
            <ErrorState message="Impossible de charger tes listes." onRetry={() => void refetchLists()} />
          ) : null}
          {!isLoading && !isListsLoading && !isError && !isListsError && displayedCollections.length === 0 ? (
            <EmptyState title={collectionEmptyStateTitle} description={collectionEmptyStateDescription} />
          ) : null}
          {!isLoading && !isListsLoading && !isError && !isListsError
            ? displayedCollections.map((collection) => (
              <View key={`${activeCollectionTab}-${collection.id}`} style={styles.listRow}>
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
            ))
            : null}
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
  listActions: {
    alignItems: 'flex-start',
  },
  createListForm: {
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundSubtle,
    padding: 10,
  },
  createListButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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
