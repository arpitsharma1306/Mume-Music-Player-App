import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { getBestImageUrl, getArtistNames } from '../services/api';
import { usePlayerStore, useQueueStore, useDownloadStore } from '../store';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width - SPACING.xl * 2;
const SLIDER_WIDTH = width - SPACING.lg * 2;

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;

// Custom Slider Component
interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingStart: () => void;
  onSlidingComplete: (value: number) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
}) => {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      onSlidingStart();
      const x = evt.nativeEvent.locationX;
      const newValue = Math.max(0, Math.min(1, x / SLIDER_WIDTH));
      onValueChange(newValue);
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX;
      const newValue = Math.max(0, Math.min(1, x / SLIDER_WIDTH));
      onValueChange(newValue);
    },
    onPanResponderRelease: (evt) => {
      const x = evt.nativeEvent.locationX;
      const newValue = Math.max(0, Math.min(1, x / SLIDER_WIDTH));
      onSlidingComplete(newValue);
    },
  });

  return (
    <View
      style={sliderStyles.container}
      {...panResponder.panHandlers}
    >
      <View style={sliderStyles.track}>
        <View
          style={[sliderStyles.fill, { width: `${value * 100}%` }]}
        />
      </View>
      <View
        style={[
          sliderStyles.thumb,
          { left: Math.max(0, Math.min(SLIDER_WIDTH - 16, value * SLIDER_WIDTH - 8)) },
        ]}
      />
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    width: SLIDER_WIDTH,
  },
  track: {
    height: 4,
    backgroundColor: COLORS.progressBackground,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

const PlayerScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PlayerRouteProp>();
  
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const {
    currentSong,
    isPlaying,
    isLoading,
    progress,
    duration,
    position,
    repeatMode,
    isShuffled,
    playSong,
    togglePlayPause,
    seekTo,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();

  const { queue, currentIndex } = useQueueStore();
  const { downloadSong, isDownloaded, getDownloadProgress } = useDownloadStore();

  // Play song from route params if provided
  useEffect(() => {
    if (route.params?.song && (!currentSong || currentSong.id !== route.params.song.id)) {
      playSong(route.params.song);
    }
  }, [route.params?.song]);

  // Update seek value when not seeking
  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(progress);
    }
  }, [progress, isSeeking]);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No song playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl = getBestImageUrl(currentSong.image);
  const artistNames = getArtistNames(currentSong);
  const downloaded = isDownloaded(currentSong.id);
  const downloadProgress = getDownloadProgress(currentSong.id);

  // Handle seek
  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSeekValue(value);
  };

  const handleSeekEnd = async (value: number) => {
    setIsSeeking(false);
    const seekPosition = value * duration;
    await seekTo(seekPosition);
  };

  // Handle download
  const handleDownload = async () => {
    if (!downloaded && downloadProgress?.status !== 'downloading') {
      await downloadSong(currentSong);
    }
  };

  // Get repeat icon
  const getRepeatIcon = (): keyof typeof Ionicons.glyphMap => {
    return 'repeat';
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.background, COLORS.background]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-down" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>NOW PLAYING</Text>
            <Text style={styles.headerSubtitle}>
              {currentIndex + 1} / {queue.length || 1}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Queue')}
          >
            <Ionicons name="list" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Artwork */}
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.artwork}
            resizeMode="cover"
          />
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <View style={styles.songTitleContainer}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {currentSong.name}
            </Text>
            <TouchableOpacity onPress={handleDownload}>
              <Ionicons
                name={
                  downloaded
                    ? 'cloud-done'
                    : downloadProgress?.status === 'downloading'
                    ? 'cloud-download'
                    : 'cloud-download-outline'
                }
                size={24}
                color={downloaded ? COLORS.success : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.artistName} numberOfLines={1}>
            {artistNames}
          </Text>
          {currentSong.album?.name && (
            <Text style={styles.albumName} numberOfLines={1}>
              {currentSong.album.name}
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <CustomSlider
            value={seekValue}
            onValueChange={handleSeekChange}
            onSlidingStart={handleSeekStart}
            onSlidingComplete={handleSeekEnd}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Shuffle */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={toggleShuffle}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={isShuffled ? COLORS.primary : COLORS.textSecondary}
            />
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={playPrevious}
          >
            <Ionicons name="play-skip-back" size={32} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.playButtonGradient}
            >
              <Ionicons
                name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
                size={36}
                color={COLORS.white}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={playNext}
          >
            <Ionicons name="play-skip-forward" size={32} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Repeat */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={toggleRepeat}
          >
            <View>
              <Ionicons
                name={getRepeatIcon()}
                size={24}
                color={repeatMode !== 'off' ? COLORS.primary : COLORS.textSecondary}
              />
              {repeatMode === 'one' && (
                <Text style={styles.repeatOneIndicator}>1</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  artworkContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  songInfo: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  songTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songTitle: {
    flex: 1,
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: SPACING.md,
  },
  artistName: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  albumName: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SLIDER_WIDTH,
    paddingTop: SPACING.xs,
  },
  timeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  secondaryButton: {
    padding: SPACING.md,
  },
  controlButton: {
    padding: SPACING.md,
  },
  playButton: {
    marginHorizontal: SPACING.md,
  },
  playButtonGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneIndicator: {
    position: 'absolute',
    top: -4,
    right: -8,
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default PlayerScreen;
