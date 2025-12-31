import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { RootStackParamList } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import SongOptionsModal from '../components/SongOptionsModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - 80;

const PlayerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const sliderWidth = useRef(0);

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const COLORS = getThemeColors(isDarkMode);

  const {
    currentSong,
    isPlaying,
    progress,
    position,
    duration,
    repeatMode,
    isShuffled,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();

  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = useCallback((value: number) => {
    const newPosition = (value / 100) * duration;
    seekTo(newPosition);
  }, [duration, seekTo]);

  const panResponder = React.useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (sliderWidth.current > 0 && duration > 0) {
          const { locationX } = evt.nativeEvent;
          const percentage = Math.max(0, Math.min(100, (locationX / sliderWidth.current) * 100));
          const newPosition = (percentage / 100) * duration;
          seekTo(newPosition);
        }
      },
      onPanResponderMove: (evt) => {
        if (sliderWidth.current > 0 && duration > 0) {
          const { locationX } = evt.nativeEvent;
          const percentage = Math.max(0, Math.min(100, (locationX / sliderWidth.current) * 100));
          const newPosition = (percentage / 100) * duration;
          seekTo(newPosition);
        }
      },
    }),
  [duration, seekTo]);

  if (!currentSong) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No song playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const artistName = currentSong.artists?.primary?.[0]?.name || currentSong.primaryArtists || 'Unknown Artist';
  const imageUrl = currentSong.image?.[2]?.url || currentSong.image?.[1]?.url;
  const progressPercent = progress * 100;
  const isLiked = isFavorite(currentSong.id);

  const getRepeatIcon = (): 'repeat' | 'repeat-outline' => {
    switch (repeatMode) {
      case 'one':
        return 'repeat';
      case 'all':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-down" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.nowPlaying, { color: COLORS.textPrimary }]}>Now Playing</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowOptionsModal(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Album Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.artwork}
        />
      </View>

      {/* Song Info */}
      <View style={styles.songInfoContainer}>
        <Text style={[styles.songTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
          {currentSong.name}
        </Text>
        <Text style={[styles.artistName, { color: COLORS.textSecondary }]} numberOfLines={1}>
          {artistName}
        </Text>
      </View>

      {/* Progress Slider */}
      <View style={styles.progressContainer}>
        <View
          style={styles.sliderContainer}
          onLayout={(e) => {
            sliderWidth.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          <View style={[styles.sliderTrack, { backgroundColor: COLORS.progressBackground }]}>
            <View style={[styles.sliderFill, { width: `${progressPercent}%`, backgroundColor: COLORS.primary }]} />
          </View>
          <View
            style={[
              styles.sliderThumb,
              { left: `${progressPercent}%`, marginLeft: -10, backgroundColor: COLORS.primary, shadowColor: COLORS.primary },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: COLORS.textSecondary }]}>{formatTime(position)}</Text>
          <Text style={[styles.timeText, { color: COLORS.textSecondary }]}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={playPrevious}
        >
          <Ionicons name="play-skip-back" size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.seekButton}
          onPress={() => seekTo(Math.max(0, position - 10))}
        >
          <Ionicons name="play-back" size={24} color={COLORS.textPrimary} />
          <Text style={[styles.seekText, { color: COLORS.textSecondary }]}>10</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.playPauseButton, { backgroundColor: COLORS.primary, shadowColor: COLORS.primary }]}
          onPress={togglePlayPause}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={36} 
            color={COLORS.white} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.seekButton}
          onPress={() => seekTo(Math.min(duration, position + 10))}
        >
          <Ionicons name="play-forward" size={24} color={COLORS.textPrimary} />
          <Text style={[styles.seekText, { color: COLORS.textSecondary }]}>10</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={playNext}
        >
          <Ionicons name="play-skip-forward" size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Secondary Controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={toggleShuffle}
        >
          <Ionicons 
            name="shuffle" 
            size={22} 
            color={isShuffled ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={toggleRepeat}
        >
          <Ionicons 
            name={getRepeatIcon()} 
            size={22} 
            color={repeatMode !== 'off' ? COLORS.primary : COLORS.textSecondary} 
          />
          {repeatMode === 'one' && <Text style={[styles.repeatOneText, { color: COLORS.primary }]}>1</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => toggleFavorite(currentSong)}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={22} 
            color={isLiked ? COLORS.primary : COLORS.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Queue')}
        >
          <Ionicons name="list" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="share-social-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Lyrics Button */}
      <TouchableOpacity style={styles.lyricsButton}>
        <Ionicons name="chevron-up" size={20} color={COLORS.textSecondary} />
        <Text style={[styles.lyricsText, { color: COLORS.textSecondary }]}>Lyrics</Text>
      </TouchableOpacity>

      <SongOptionsModal
        visible={showOptionsModal}
        song={currentSong}
        onClose={() => setShowOptionsModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  nowPlaying: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  artworkContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  songInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  songTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    textAlign: 'center',
  },
  artistName: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
  },
  progressContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  timeText: {
    fontSize: FONT_SIZE.sm,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  controlButton: {
    padding: SPACING.md,
  },
  seekButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  seekText: {
    fontSize: FONT_SIZE.xs,
    position: 'absolute',
    bottom: -2,
  },
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  secondaryButton: {
    padding: SPACING.sm,
    position: 'relative',
  },
  repeatOneText: {
    position: 'absolute',
    fontSize: 8,
    fontWeight: '700',
    bottom: 4,
    right: 4,
  },
  lyricsButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  lyricsText: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});

export default PlayerScreen;
