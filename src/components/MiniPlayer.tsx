import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, MINI_PLAYER_HEIGHT } from '../constants';
import { getBestImageUrl, getArtistNames } from '../services/api';
import { usePlayerStore } from '../store';

const { width } = Dimensions.get('window');

const MiniPlayer: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isLoading = usePlayerStore((state) => state.isLoading);
  const progress = usePlayerStore((state) => state.progress);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);

  if (!currentSong) return null;

  const imageUrl = getBestImageUrl(currentSong.image);
  const artistNames = getArtistNames(currentSong);

  const handlePress = () => {
    navigation.navigate('Player', { song: currentSong });
  };

  const handlePlayPause = async () => {
    await togglePlayPause();
  };

  const handleNext = async () => {
    await playNext();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[COLORS.backgroundSecondary, COLORS.backgroundTertiary]}
        style={styles.gradient}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.content}>
          {/* Album art */}
          <Image source={{ uri: imageUrl }} style={styles.image} />

          {/* Song info */}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.name}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {artistNames}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePlayPause}
              disabled={isLoading}
            >
              <Ionicons
                name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
                size={28}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleNext}
            >
              <Ionicons
                name="play-forward"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    width: width,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradient: {
    flex: 1,
  },
  progressContainer: {
    height: 2,
    backgroundColor: COLORS.progressBackground,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  artist: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: SPACING.sm,
  },
});

export default MiniPlayer;
