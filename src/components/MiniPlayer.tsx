import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS, MINI_PLAYER_HEIGHT } from '../constants';
import { RootStackParamList } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MiniPlayer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDarkMode } = useThemeStore();
  const COLORS = getThemeColors(isDarkMode);
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause, 
    playNext,
    progress,
    duration 
  } = usePlayerStore();

  if (!currentSong) return null;

  const artistName = currentSong.artists?.primary?.[0]?.name || currentSong.primaryArtists || 'Unknown Artist';
  const imageUrl = currentSong.image?.[1]?.url || currentSong.image?.[0]?.url;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: COLORS.background, borderTopColor: COLORS.border }]}
      onPress={() => navigation.navigate('Player', { song: currentSong })}
      activeOpacity={0.95}
    >
      {/* Progress bar at top */}
      <View style={[styles.progressBar, { backgroundColor: COLORS.progressBackground }]}>
        <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: COLORS.primary }]} />
      </View>

      <View style={styles.content}>
        {/* Album Art */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.albumArt}
        />

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={[styles.artistName, { color: COLORS.textSecondary }]} numberOfLines={1}>
            {artistName}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.playPauseButton, { backgroundColor: COLORS.primary }]}
            onPress={togglePlayPause}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={playNext}
          >
            <Ionicons
              name="play-skip-forward"
              size={22}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBar: {
    height: 2,
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
  },
  songInfo: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  songTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  artistName: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  playPauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    padding: SPACING.sm,
  },
});

export default MiniPlayer;
