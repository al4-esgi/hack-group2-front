import {
  EditorialCard,
  HotelCard,
  ListHeader,
  PageHeader,
  RestaurantCard,
  Screen,
  Section,
} from '@/src/shared/ui'

const FEED_RESTAURANTS = [
  {
    name: 'Le Petit Rivage',
    city: 'Paris',
    area: '7e',
    cuisine: 'Cuisine française',
    description: 'Cuisine précise, produits de saison et salle intimiste.',
    distinctions: ['star'] as const,
    priceLevel: 3 as const,
  },
  {
    name: 'Bistro Luna',
    city: 'Lyon',
    area: 'Presqu’île',
    cuisine: 'Bistronomie',
    description: 'Adresse vivante avec une carte courte et très régulière.',
    distinctions: ['bib'] as const,
    priceLevel: 2 as const,
  },
]

const FEED_HOTELS = [
  {
    name: 'Maison Levain Hôtel',
    city: 'Bordeaux',
    area: 'Centre',
    description: 'Maison calme avec design sobre et service attentif.',
    priceLevel: 3 as const,
  },
]

const FEED_EDITORIAL = [
  {
    title: 'Tendances de la semaine',
    description: 'Les adresses qui progressent le plus dans les favoris.',
  },
  {
    title: 'Escapade du week-end',
    description: 'Un itinéraire court entre gastronomie, nature et hôtel de caractère.',
  },
]

export default function FeedScreen() {
  return (
    <Screen scrollable>
      <PageHeader
        title="Feed"
        subtitle="Sélection éditoriale et recommandations autour de toi."
      />

      <Section>
        <ListHeader title="Restaurants" subtitle="Sélection du moment" />
        {FEED_RESTAURANTS.map((restaurant) => (
          <RestaurantCard
            key={restaurant.name}
            name={restaurant.name}
            city={restaurant.city}
            area={restaurant.area}
            cuisine={restaurant.cuisine}
            description={restaurant.description}
            distinctions={[...restaurant.distinctions]}
            priceLevel={restaurant.priceLevel}
          />
        ))}
      </Section>

      <Section>
        <ListHeader title="Hôtels" subtitle="À proximité" />
        {FEED_HOTELS.map((hotel) => (
          <HotelCard
            key={hotel.name}
            name={hotel.name}
            city={hotel.city}
            area={hotel.area}
            description={hotel.description}
            priceLevel={hotel.priceLevel}
          />
        ))}
      </Section>

      <Section>
        <ListHeader title="Éditorial" subtitle="À lire" />
        {FEED_EDITORIAL.map((item) => (
          <EditorialCard
            key={item.title}
            title={item.title}
            description={item.description}
            eyebrow="Guide"
          />
        ))}
      </Section>
    </Screen>
  )
}
