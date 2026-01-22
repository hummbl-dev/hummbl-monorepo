# HUMMBL Mobile Application

React Native mobile app for iOS and Android using Expo.

---

## 📱 **Overview**

Native mobile application sharing core logic with the web app through a monorepo structure.

**Tech Stack:**

- React Native 0.73
- Expo SDK 50
- Expo Router (file-based routing)
- TypeScript
- Zustand (state management)
- Shared packages from web app

---

## 🏗️ **Project Structure**

```
hummbl-io/
├── mobile/                 # Mobile app
│   ├── app/               # Screens (Expo Router)
│   │   ├── _layout.tsx    # Root layout
│   │   ├── index.tsx      # Home screen
│   │   ├── search.tsx     # Search screen
│   │   ├── bookmarks.tsx  # Bookmarks screen
│   │   ├── mental-models/ # Mental models screens
│   │   └── narratives/    # Narratives screens
│   ├── assets/            # Images, fonts, icons
│   ├── app.json           # Expo configuration
│   ├── package.json       # Mobile dependencies
│   └── tsconfig.json      # TypeScript config
│
├── shared/                # Shared logic (web + mobile)
│   ├── src/
│   │   ├── hooks/         # Shared hooks
│   │   ├── utils/         # Shared utilities
│   │   ├── types.ts       # Shared TypeScript types
│   │   └── index.ts       # Exports
│   ├── package.json       # Shared package config
│   └── tsconfig.json      # Shared TS config
│
└── src/                   # Web app (existing)
```

---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 20.x
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only)
- Android: Android Studio

### **Installation**

```bash
cd mobile
npm install
```

### **Development**

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run web version
npm run web
```

### **Testing on Device**

1. Install Expo Go app on your device
2. Scan QR code from terminal
3. App loads on your device

---

## 📦 **Shared Packages**

The mobile app reuses logic from the web app through the `@hummbl/shared` package.

**Shared Modules:**

- `useBookmarks` - Bookmark management
- `useNotes` - Notes system
- `useSearchHistory` - Search history
- `useReadingHistory` - Reading tracking
- `fuzzySearch` - Search algorithm
- `relatedContent` - Recommendations

**Usage:**

```typescript
import { useBookmarks, fuzzySearch } from '@hummbl/shared';

function MyComponent() {
  const { bookmarks, addBookmark } = useBookmarks();

  const results = fuzzySearch(query, items);

  return <View>...</View>;
}
```

---

## 🎨 **Screens**

### **Home Screen** (`/`)

- Feature cards (Mental Models, Narratives, Search, Bookmarks)
- Statistics (200+ models, 20+ narratives)
- Quick navigation

### **Mental Models** (`/mental-models`)

- Browse all mental models
- Filter by category
- Search
- View details

### **Narratives** (`/narratives`)

- Browse all narratives
- Filter by category/evidence quality
- Read full text
- Related content

### **Search** (`/search`)

- Fuzzy search across all content
- Real-time results
- Score-based ranking
- Quick filters

### **Bookmarks** (`/bookmarks`)

- View saved content
- Organize by collections
- Quick access
- Sync with web app

---

## 🔄 **Offline Support**

The mobile app is designed for offline-first usage:

- **localStorage** - Local data persistence
- **AsyncStorage** - React Native storage
- **Sync Queue** - Background sync when online
- **Cache** - Cached content for offline reading

---

## 🎯 **Navigation**

Using Expo Router (file-based):

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate
router.push('/mental-models');
router.push('/narratives/N001');

// Go back
router.back();
```

---

## 🔧 **Configuration**

### **Expo Configuration** (`app.json`)

```json
{
  "expo": {
    "name": "HUMMBL",
    "slug": "hummbl",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "io.hummbl.app"
    },
    "android": {
      "package": "io.hummbl.app"
    }
  }
}
```

### **Environment Variables**

```typescript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
```

---

## 📱 **Platform-Specific Code**

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
}
```

---

## 🧪 **Testing**

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🚀 **Building for Production**

### **iOS**

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### **Android**

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

---

## 📊 **Performance**

**Bundle Size Targets:**

- iOS: < 20 MB
- Android: < 15 MB

**Launch Time:**

- Cold start: < 3s
- Warm start: < 1s

**Optimization:**

- Code splitting
- Lazy loading
- Image optimization
- Hermes engine (Android)

---

## 🔐 **Security**

- Secure storage for auth tokens
- HTTPS only
- Certificate pinning (production)
- Biometric authentication (planned)

---

## 🎨 **Design System**

**Colors:**

- Primary: `#3b82f6`
- Background: `#f9fafb`
- Text: `#1f2937`
- Secondary Text: `#6b7280`

**Typography:**

- Title: 32px, bold
- Heading: 24px, semi-bold
- Body: 16px, regular
- Caption: 14px, regular

**Spacing:**

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

---

## 📈 **Roadmap**

### **Phase 1 (Current - P5.4)**

- ✅ Basic app structure
- ✅ Home screen
- ✅ Search screen
- ✅ Bookmarks screen
- ✅ Shared package setup

### **Phase 2 (Future)**

- Mental models list
- Narrative reader
- Offline sync
- Push notifications

### **Phase 3 (Future)**

- Dark mode
- Accessibility improvements
- Performance optimization
- Analytics integration

---

## 🐛 **Troubleshooting**

**Metro bundler issues:**

```bash
expo start --clear
```

**iOS simulator not opening:**

```bash
xcrun simctl list devices
```

**Android emulator issues:**

```bash
adb devices
adb reverse tcp:8081 tcp:8081
```

---

## 📚 **Resources**

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://expo.github.io/router/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

## 🤝 **Contributing**

1. Follow existing code style
2. Add TypeScript types
3. Test on both iOS and Android
4. Update documentation
5. Submit PR

---

**Status:** ✅ Basic infrastructure ready  
**Next:** Implement remaining screens and integrate shared logic
