import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AppRoutes } from '@/src/constants/routes.constant'
import type { RootStackParamList } from '@/src/navigation/navigation.types'
import { EmptyState, Screen } from '@/src/shared/ui'

export default function NotFound() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { t } = useTranslation('notFound')

  return (
    <Screen scrollable edges={['top', 'left', 'right', 'bottom']}>
      <EmptyState
        title={t('title')}
        description={t('description')}
        actionLabel="Retour à l'accueil"
        onAction={() => navigation.replace(AppRoutes.ROOT)}
      />
    </Screen>
  )
}
