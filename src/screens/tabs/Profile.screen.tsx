import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../../api/users.api'
import { StaleTimes } from '../../constants/query.constant'
import { useAuthStore } from '../../stores/auth.store'

type ProfileScreenProps = {
  isAuthenticated: boolean
  onRequestLogin: () => void
}

export default function ProfileScreen({ isAuthenticated, onRequestLogin }: ProfileScreenProps) {
  const clearToken = useAuthStore((state) => state.clearToken)
  const token = useAuthStore((state) => state.token)

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
        <Text style={styles.lockedMessage}>
          Il faut se connecter pour acceder a cette page.
        </Text>
        <Pressable style={styles.loginButton} onPress={onRequestLogin}>
          <Text style={styles.loginButtonLabel}>Se connecter</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Compte connecté.</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingLabel}>Chargement du profil...</Text>
        </View>
      ) : null}

      {isError ? (
        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>Impossible de charger ton profil.</Text>
          <Pressable style={styles.retryButton} onPress={() => void refetch()}>
            <Text style={styles.retryButtonLabel}>Réessayer</Text>
          </Pressable>
        </View>
      ) : null}

      {currentUser ? (
        <View style={styles.profileCard}>
          {currentUser.photoUrl ? (
            <Image source={{ uri: currentUser.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackLabel}>
                {(currentUser.firstname?.[0] ?? '?').toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.profileLabel}>
            Nom: {currentUser.firstname} {currentUser.lastname}
          </Text>
          <Text style={styles.profileLabel}>Email: {currentUser.email}</Text>
        </View>
      ) : null}

      <Pressable style={styles.logoutButton} onPress={clearToken}>
        <Text style={styles.logoutButtonLabel}>Se déconnecter</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  lockedMessage: {
    marginTop: 10,
    marginBottom: 14,
    fontSize: 15,
    color: '#444444',
  },
  loginButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#111111',
    borderRadius: 10,
  },
  loginButtonLabel: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadingLabel: {
    color: '#444444',
    fontSize: 14,
  },
  profileCard: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    gap: 6,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },
  avatarFallbackLabel: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  profileLabel: {
    color: '#222222',
    fontSize: 15,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#111111',
    backgroundColor: '#ffffff',
  },
  retryButtonLabel: {
    color: '#111111',
    fontWeight: '600',
    fontSize: 13,
  },
  logoutButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#111111',
    backgroundColor: '#ffffff',
  },
  logoutButtonLabel: {
    color: '#111111',
    fontWeight: '600',
  },
})
