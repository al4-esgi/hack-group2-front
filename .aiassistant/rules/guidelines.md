---
apply: always
---

# GUIDELINES — UI mobile Michelin DS + palette By Universe

## 1. Source de vérité design

Référence obligatoire pour la structure UI/UX et les patterns composants :

- https://designsystem.michelin.com/
- UX principles : https://designsystem.michelin.com/ux-principles
- Typography : https://designsystem.michelin.com/brand/typography
- Spacing : https://designsystem.michelin.com/tokens/spacing
- Components : https://designsystem.michelin.com/components
- Button : https://designsystem.michelin.com/components/button
- Text field : https://designsystem.michelin.com/components/text-field
- Card : https://designsystem.michelin.com/components/card
- Empty state : https://designsystem.michelin.com/components/empty-state
- Colors : https://designsystem.michelin.com/colors

Règle de cadrage : on suit la logique Michelin DS pour la hiérarchie, la lisibilité et les composants, mais **on applique la palette By Universe** (pas le couple Michelin Blue / Yellow).

## 2. Positionnement visuel

- Light-first uniquement.
- Sobriété éditoriale.
- Composants lisibles, sans effets décoratifs lourds.
- Le contenu prime sur l’effet.
- Une action principale claire par zone.

Interdits :

- Rebranding libre.
- Multiplication d’accents couleur.
- Ombres fortes / styles “marketplace bruyant”.
- UI dense et difficile à scanner.

## 3. Palette By Universe (obligatoire)

Tokens de marque :

- `primary`: `#BD2333` (Michelin Red for Gastronomy)
- `accent`: `#582C83` (Michelin Purple Engaged)
- `success`: `#84BD00` (Michelin Generous Green)
- `info`: `#1095F9` (Michelin Sky Blue)
- `travel`: `#17A78F` (Michelin Green for Travel)
- `neutralBrand`: `#53565A` (Michelin Sustainable Grey)

Neutres UI :

- `backgroundPrimary`: `#FFFFFF`
- `backgroundSubtle`: `#F2F2F2`
- `borderSubtle`: `#E5E5E5`
- `textPrimary`: `#1A1A1A`
- `textSecondary`: `#53565A`

Règles d’usage :

- Une seule couleur d’accent dominante par écran.
- `primary` pour CTA majeur, état actif et accents critiques.
- Les distinctions (étoiles, bib, green star, keys) gardent leur sémantique stable.
- Ne jamais transmettre une information uniquement par la couleur.

## 4. Typographie

Référence DS : Noto Sans.

Implémentation projet :

- Si Noto Sans est disponible : utiliser Noto Sans.
- Sinon : fallback de projet autorisé (Figtree) tant que la hiérarchie est respectée.

Règles :

- H1/H2/H3 cohérents, labels courts, corps lisible.
- Pas de texte < 12px pour du contenu utile.
- Phrase case pour boutons et labels.
- Pas de paragraphes full uppercase.

## 5. Spacing, radius, surfaces

Spacing :

- Grille 8pt, avec exception 4px pour micro-espacement.
- Éviter les valeurs hors token.

Radius :

- `sm`: 3px
- `lg`: 8px
- `full`: 999px

Surfaces :

- Bordure fine prioritaire.
- Ombres minimales.
- Cartes nettes et scannables.

## 6. Stack graphique obligatoire

- React Native + TypeScript strict
- Gluestack UI (provider + primitives)
- Tokens centralisés (pas de hardcode répété)
- Composants métier partagés dans `src/shared/ui`

Interdits :

- Valeurs couleur/radius/spacing hardcodées dans chaque screen.
- Variantes visuelles dupliquées.
- Mélange logique métier + styles complexes dans le même bloc.

## 7. Composants métier à utiliser

Composants UI partagés attendus :

- `Screen`
- `Section`
- `PageHeader`
- `TextField`
- `SearchBar`
- `FilterChip`
- `RestaurantCard`
- `HotelCard`
- `EditorialCard`
- `DistinctionBadge`
- `PriceRange`
- `LocationMeta`
- `FavoriteButton`
- `PrimaryButton`
- `SecondaryButton`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ListHeader`
- `MapPin`
- `BottomActionBar`

Règle : on compose les pages avec ces briques, on n’écrit pas des variantes ad hoc par écran.

## 8. Accessibilité minimale

- Contraste lisible.
- Labels explicites (inputs, icon-only buttons, actions).
- États `loading / empty / error` toujours présents.
- Cibles tactiles confortables.
- Navigation simple et prévisible.

## 9. Definition of Done UI

Une tâche front est finie si :

- la page respecte Michelin DS (structure) + By Universe (couleurs),
- les tokens sont centralisés,
- les composants partagés sont réutilisés,
- pas de duplication évidente,
- états UI et accessibilité de base couverts,
- code TypeScript propre et maintenable.
