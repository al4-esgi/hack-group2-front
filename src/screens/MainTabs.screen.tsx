import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { colors, radius } from '@/src/app/theme/tokens'
import { AppRoutes } from '@/src/constants/routes.constant'
import type { RootStackParamList } from '@/src/navigation/navigation.types'
import { useAuthStore } from '@/src/stores/auth.store'
import { BottomActionBar } from '@/src/shared/ui'
import FeedScreen from './tabs/Feed.screen'
import MapScreen from './tabs/MapScreen'
import ProfileScreen from './tabs/Profile.screen'
import SavedScreen from './tabs/Saved.screen'
import SearchesScreen from './tabs/Searches.screen'

type Props = NativeStackScreenProps<RootStackParamList, typeof AppRoutes.ROOT>
type TabKey = 'feed' | 'map' | 'searches' | 'saved' | 'profile'

const TAB_ITEMS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'feed', label: 'Feed', icon: '≡' },
  { key: 'map', label: 'Map', icon: '◎' },
  { key: 'searches', label: 'Recherches', icon: '⌕' },
  { key: 'saved', label: 'Saved', icon: '♡' },
  { key: 'profile', label: 'Profil', icon: 'A' },
]

export default function MainTabsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('feed')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const handleRequestLogin = () => navigation.navigate(AppRoutes.LOGIN)

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedScreen />
      case 'map':
        return <MapScreen />
      case 'searches':
        return <SearchesScreen />
      case 'saved':
        return <SavedScreen isAuthenticated={isAuthenticated} onRequestLogin={handleRequestLogin} />
      case 'profile':
        return <ProfileScreen isAuthenticated={isAuthenticated} onRequestLogin={handleRequestLogin} />
      default:
        return <FeedScreen />
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderTabContent()}</View>

      <BottomActionBar style={styles.navbar}>
        {TAB_ITEMS.map((tab) => {
          const isActive = tab.key === activeTab

          return (
            <Pressable key={tab.key} style={styles.navButton} onPress={() => setActiveTab(tab.key)}>
              <View style={[styles.navIcon, isActive ? styles.navIconActive : undefined]}>
                <Text style={[styles.navIconLabel, isActive ? styles.navIconLabelActive : undefined]}>
                  {tab.icon}
                </Text>
              </View>
              <Text style={[styles.navLabel, isActive ? styles.navLabelActive : undefined]}>
                {tab.label}
              </Text>
            </Pressable>
          )
        })}
      </BottomActionBar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
  },
  navbar: {
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  navIcon: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  navIconActive: {
    borderColor: colors.primary,
  },
  navIconLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  navIconLabelActive: {
    color: colors.primary,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  navLabelActive: {
    color: colors.primary,
  },
})
