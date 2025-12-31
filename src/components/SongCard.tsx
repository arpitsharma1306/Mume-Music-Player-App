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

import { Song, RootStackParamList } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import { getBestImageUrl, getArtistNames, formatDuration } from '../services/api';
import { usePlayerStore, useQueueStore } from '../store';

interface SongCardProps {
  song: Song;
  index?: number;
  showIndex?: boolean;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

const { width } = Dimensions.get('window');

const SongCard: React.FC<SongCardProps> = ({
  song,
  index = 0,
  showIndex = false,
  onPress,
  onOptionsPress,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const playSong = usePlayerStore((state) => state.playSong);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const { setQueue } = useQueueStore();

  const isCurrentSong = currentSong?.id === song.id;
  const imageUrl = getBestImageUrl(song.image);
  const artistNames = getArtistNames(song);
  const duration = formatDuration(song.duration);

  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else {
      await playSong(song);
      navigation.navigate('Player', { song });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCurrentSong && styles.currentSong]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {showIndex && (
        <View style={styles.indexContainer}>
          {isCurrentSong && isPlaying ? (
            <Ionicons name="musical-notes" size={16} color={COLORS.primary} />
          ) : (
            <Text style={styles.indexText}>{index + 1}</Text>
          )}
        </View>
      )}

      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {isCurrentSong && (
          <View style={styles.playingIndicator}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={16}
              color={COLORS.white}
            />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.title, isCurrentSong && styles.currentTitle]}
          numberOfLines={1}
        >
          {song.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artistNames}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.duration}>{duration}</Text>
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={onOptionsPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
  },
  currentSong: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  indexContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  playingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  currentTitle: {
    color: COLORS.primary,
  },
  artist: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginRight: SPACING.sm,
  },
  optionsButton: {
    padding: SPACING.xs,
  },
});

export default SongCard;
