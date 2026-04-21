# Hack Front (React Native)

Migration du projet de **React PWA (Vite)** vers **React Native avec Expo**.

## Prérequis

- `Node.js` 20+ recommandé
- `npm` 10+ (inclus avec Node)
- `Android Studio` + SDK Android (pour émulateur Android)
- `Xcode` (uniquement sur macOS, pour simulateur iOS)
- Optionnel: appli `Expo Go` sur téléphone Android/iOS

## Installation

1. Copier les variables d'environnement:

```bash
cp .env.example .env
```

Sous PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Renseigner `EXPO_PUBLIC_API_HOST` dans `.env`.

3. Installer les dépendances:

```bash
npm install
```

## Lancer le projet en développement

### Démarrage du serveur Metro

```bash
npm run start
```

Ensuite, dans le terminal Expo:
- `a` pour ouvrir Android (émulateur ou appareil)
- `i` pour ouvrir iOS (simulateur sur macOS)

### Android (raccourci direct)

```bash
npm run android
```

### iOS (raccourci direct)

```bash
npm run ios
```

## Development Build Android (Dev Client)

La config Android est prête (`android.package` défini dans `app.json`: `com.hackgroup2.front`).

1. Se connecter à Expo:

```bash
npx eas login
```

2. Générer un dev build Android (APK interne):

```bash
npx eas build --platform android --profile development
```

3. Installer l'APK sur l'émulateur/téléphone Android.

4. Lancer Metro en mode dev client:

```bash
npx expo start --dev-client
```

Alternative locale (sans EAS cloud):

```bash
npx expo run:android
```

## Notes iOS

- Le simulateur iOS nécessite **macOS + Xcode**.
- Sur Windows/Linux, vous pouvez tester iOS uniquement sur un iPhone réel via `Expo Go`.

## Scripts utiles

- `npm run start`: démarre Metro
- `npm run android`: ouvre Android
- `npm run ios`: ouvre iOS
- `npm run typecheck`: vérification TypeScript
- `npm run lint`: lint ESLint
