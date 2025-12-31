# MUME Music Player 🎵

A feature-rich music streaming app built with React Native (Expo) using the JioSaavn API. This app provides a seamless music listening experience with background playback, queue management, and offline download capabilities.

## 📱 Features

### Core Features

- **🔍 Search**: Search for songs, artists, and albums with real-time results
- **🎵 Music Playback**: Stream high-quality music with background playback support
- **📝 Queue Management**: Add, remove, and reorder songs in your queue
- **🔄 Persistent State**: Queue and playback state persist across app restarts
- **📲 Mini Player**: Quick access player bar synced with the full player

### Bonus Features

- **🔀 Shuffle Mode**: Randomize your queue playback
- **🔁 Repeat Modes**: Off, Repeat All, Repeat One
- **📥 Offline Downloads**: Download songs for offline listening
- **📊 Recent Searches**: Quick access to your search history

## 🏗️ Architecture

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── EmptyState.tsx
│   ├── LoadingSpinner.tsx
│   ├── MiniPlayer.tsx
│   ├── SearchBar.tsx
│   ├── SongCard.tsx
│   └── SongOptionsModal.tsx
├── constants/           # App constants and theme
│   └── index.ts
├── navigation/          # React Navigation setup
│   └── AppNavigator.tsx
├── screens/             # App screens
│   ├── HomeScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── PlayerScreen.tsx
│   ├── QueueScreen.tsx
│   └── SearchScreen.tsx
├── services/            # API and storage services
│   ├── api.ts
│   └── storage.ts
├── store/               # Zustand state management
│   ├── downloadStore.ts
│   ├── playerStore.ts
│   ├── queueStore.ts
│   └── searchStore.ts
└── types/               # TypeScript type definitions
    └── index.ts
```

### State Management

The app uses **Zustand** for state management with the following stores:

1. **PlayerStore**: Manages audio playback state, controls, and player modes
2. **QueueStore**: Handles queue operations with AsyncStorage persistence
3. **DownloadStore**: Manages offline downloads with file system storage
4. **SearchStore**: Handles search queries and recent searches

### Navigation

Uses **React Navigation v6** with:

- Native Stack Navigator for main app flow
- Bottom Tab Navigator for main screens (Home, Search, Library)
- Modal presentation for Player and Queue screens

### Audio Playback

- Uses **expo-av** for audio playback
- Configured for background playback on both iOS and Android
- Progress tracking with seek functionality
- Automatic playback of next song in queue

## 🛠️ Tech Stack

| Technology           | Purpose                         |
| -------------------- | ------------------------------- |
| React Native (Expo)  | Cross-platform mobile framework |
| TypeScript           | Type safety and better DX       |
| React Navigation v6  | Navigation management           |
| Zustand              | State management                |
| AsyncStorage         | Data persistence                |
| expo-av              | Audio playback                  |
| expo-file-system     | File downloads                  |
| expo-linear-gradient | UI gradients                    |
| Axios                | HTTP client                     |

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd MUME
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

### 4. Run on Android

```bash
# Using Expo Go
npm start
# Scan the QR code with Expo Go app

# Using Android Studio emulator
npm run android
```

### 5. Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build -p android --profile preview
```

## 📱 Running on Android Studio

1. Open Android Studio
2. Create/Open an Android Virtual Device (AVD)
3. Start the emulator
4. Run `npm run android` or press `a` in the Expo CLI

## 🎨 Design Decisions & Trade-offs

### 1. Expo vs Bare React Native

**Decision**: Used Expo (managed workflow)
**Reasoning**:

- Faster development with pre-configured native modules
- Easier build process with EAS
- Built-in support for audio, file system, and linear gradients
  **Trade-off**: Less control over native code, but sufficient for this use case

### 2. Zustand vs Redux Toolkit

**Decision**: Used Zustand
**Reasoning**:

- Simpler API with less boilerplate
- Built-in persistence middleware
- Better performance for frequent updates (player progress)
- Smaller bundle size
  **Trade-off**: Less middleware ecosystem compared to Redux

### 3. AsyncStorage vs MMKV

**Decision**: Used AsyncStorage
**Reasoning**:

- Native Expo support without additional configuration
- Sufficient performance for our data size
- Simpler setup
  **Trade-off**: Slightly slower than MMKV, but acceptable for our use case

### 4. expo-av vs react-native-track-player

**Decision**: Used expo-av
**Reasoning**:

- Native Expo integration
- Sufficient features for our requirements
- Simpler setup for background playback
  **Trade-off**: Less advanced features like lockscreen controls (would require additional native code)

### 5. Slider Component

**Decision**: Used @react-native-community/slider
**Reasoning**:

- Native performance for smooth seeking
- Cross-platform consistency
  **Trade-off**: Limited customization options

## 🔧 API Integration

The app integrates with the JioSaavn API:

- Base URL: `https://saavn.sumit.co`
- No authentication required

### Key Endpoints Used:

- `GET /api/search/songs` - Search for songs
- `GET /api/songs/{id}` - Get song details
- `GET /api/songs/{id}/suggestions` - Get song suggestions

## 📁 File Structure Explained

### Components

- **MiniPlayer**: Persistent bottom bar showing current track with basic controls
- **SongCard**: Reusable song list item with artwork, title, and options
- **SearchBar**: Search input with clear functionality
- **SongOptionsModal**: Bottom sheet with song actions (queue, download)

### Screens

- **HomeScreen**: Main screen with trending songs and search
- **SearchScreen**: Dedicated search with recent searches
- **LibraryScreen**: Queue and downloads management
- **PlayerScreen**: Full-screen player with all controls
- **QueueScreen**: Queue management with reordering

### Stores

- **playerStore**: Audio instance, playback state, controls
- **queueStore**: Queue array, current index, shuffle logic
- **downloadStore**: Download progress, local file management
- **searchStore**: Recent searches, search state

## 🎯 Future Improvements

1. **Lock Screen Controls**: Add media controls for lock screen
2. **Playlist Support**: Create and manage custom playlists
3. **Artist/Album Pages**: Detailed artist and album views
4. **Lyrics Display**: Show song lyrics in player
5. **Audio Quality Settings**: Let users choose streaming quality
6. **Equalizer**: Add audio equalizer for sound customization
7. **Social Features**: Share songs with friends
8. **Widgets**: Home screen widgets for quick playback

## 📝 Known Limitations

1. Background playback may stop after extended periods on some devices due to battery optimization
2. Download feature requires sufficient device storage
3. Some songs may not have download URLs available
4. Search results are limited by API pagination

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is for educational purposes as part of a React Native internship assignment.

## 🙏 Acknowledgments

- [JioSaavn API](https://saavn.sumit.co/docs) for providing the music data
- [Expo](https://expo.dev/) for the excellent development framework
- Design inspiration from the provided Figma reference

---

Built with ❤️ using React Native & Expo
