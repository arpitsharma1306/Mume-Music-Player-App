import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { Song, RootStackParamList } from '../types';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { useRecentlyPlayedStore } from '../store/recentlyPlayedStore';
import SongOptionsModal from '../components/SongOptionsModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { favorites } = useFavoritesStore();
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();
  const { isDarkMode } = useThemeStore();
  const { addToRecentlyPlayed } = useRecentlyPlayedStore();
  const COLORS = getThemeColors(isDarkMode);
  const [selectedSong, setSelectedSong] = React.useState<Song | null>(null);
  const [showOptionsModal, setShowOptionsModal] = React.useState(false);

  const handlePlaySong = (song: Song) => {
    setQueue(favorites, favorites.indexOf(song));
    playSong(song, false);
    addToRecentlyPlayed(song);
    navigation.navigate('Player', { song });
  };

  const handleSongOptions = (song: Song) => {
    setSelectedSong(song);
    setShowOptionsModal(true);
  };

  const formatDuration = (duration: number | string | null | undefined): string => {
    if (!duration) return '00:00';
    const totalSeconds = typeof duration === 'string' ? parseInt(duration) : duration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} mins`;
  };

  const isCurrentSong = (song: Song) => currentSong?.id === song.id;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={COLORS.textMuted} />
      <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No Favorites Yet</Text>
      <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>
        Songs you love will appear here. Tap the heart icon on any song to add it to your favorites.
      </Text>
    </View>
  );

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handlePlaySong(item)}
    >
      <Image
        source={{ uri: item.image?.[1]?.url || item.image?.[0]?.url }}
        style={styles.songImage}
      />
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: COLORS.textPrimary }, isCurrentSong(item) && { color: COLORS.primary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.songArtist, { color: COLORS.textSecondary }]} numberOfLines={1}>
          {item.artists?.primary?.[0]?.name || item.primaryArtists}
          {item.duration ? ` | ${formatDuration(item.duration)}` : ''}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.playButton, { backgroundColor: COLORS.primary }]}
        onPress={() => handlePlaySong(item)}
      >
        <Ionicons 
          name={isCurrentSong(item) && isPlaying ? "pause" : "play"} 
          size={20} 
          color={COLORS.white} 
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => handleSongOptions(item)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={28} color={COLORS.primary} />
          <Text style={[styles.logoText, { color: COLORS.textPrimary }]}>Favorites</Text>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {favorites.length > 0 ? (
        <>
          <View style={styles.listHeader}>
            <Text style={[styles.songCount, { color: COLORS.textPrimary }]}>{favorites.length} songs</Text>
            <TouchableOpacity 
              style={styles.shuffleButton}
              onPress={() => {
                const randomIndex = Math.floor(Math.random() * favorites.length);
                handlePlaySong(favorites[randomIndex]);
              }}
            >
              <Ionicons name="shuffle" size={20} color={COLORS.primary} />
              <Text style={[styles.shuffleText, { color: COLORS.primary }]}>Shuffle All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderSongItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: SPACING.lg }}
          />
        </>
      ) : (
        renderEmptyState()
      )}

      <SongOptionsModal
        visible={showOptionsModal}
        song={selectedSong}
        onClose={() => setShowOptionsModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  searchButton: {
    padding: SPACING.sm,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  songCount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  shuffleText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
  },
  songInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  songTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  moreButton: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
});

export default FavoritesScreen;
