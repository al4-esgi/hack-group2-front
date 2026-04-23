import { EmptyState, PageHeader, PrimaryButton, RestaurantCard, Screen, Section } from '@/src/shared/ui'

type SavedScreenProps = {
  isAuthenticated: boolean
  onRequestLogin: () => void
}

const SAVED_ITEMS = [
  { name: 'Le Petit Rivage', city: 'Paris', area: '7e', distinctions: ['star'] as const },
  { name: 'Bistro Luna', city: 'Lyon', area: 'Presqu’île', distinctions: ['bib'] as const },
  { name: 'Parc des Arts', city: 'Lille', area: 'Vieux Lille', distinctions: ['green-star'] as const },
]

export default function SavedScreen({ isAuthenticated, onRequestLogin }: SavedScreenProps) {
  if (!isAuthenticated) {
    return (
      <Screen scrollable>
        <PageHeader title="Saved" subtitle="Retrouve tes adresses mises de côté." />
        <EmptyState
          title="Connexion requise"
          description="Connecte-toi pour accéder à tes favoris."
          actionLabel="Se connecter"
          onAction={onRequestLogin}
        />
      </Screen>
    )
  }

  return (
    <Screen scrollable>
      <PageHeader title="Saved" subtitle="Tes lieux enregistrés récemment." />
      <Section>
        {SAVED_ITEMS.map((item) => (
          <RestaurantCard
            key={item.name}
            name={item.name}
            city={item.city}
            area={item.area}
            distinctions={[...item.distinctions]}
            priceLevel={2}
          />
        ))}
      </Section>
      <PrimaryButton label="Voir toute la liste" onPress={() => undefined} />
    </Screen>
  )
}
