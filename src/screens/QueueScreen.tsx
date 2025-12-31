import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Song } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { getBestImageUrl, getArtistNames, formatDuration } from '../services/api';
import { usePlayerStore, useQueueStore } from '../store';
import { EmptyState } from '../components';

const QueueScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { currentSong, playSong, isPlaying } = usePlayerStore();
  const { queue, currentIndex, removeFromQueue, clearQueue, playFromQueue, setCurrentIndex } = useQueueStore();

  // Handle play from queue
  const handlePlayFromQueue = async (index: number) => {
    const song = playFromQueue(index);
    if (song) {
      await playSong(song, false);
    }
  };

  // Handle remove from queue
  const handleRemove = (index: number) => {
    removeFromQueue(index);
  };

  // Handle clear queue
  const handleClearQueue = () => {
    Alert.alert(
      'Clear Queue',
      'Are you sure you want to clear your queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearQueue },
      ]
    );
  };

  // Render queue item
  const renderQueueItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrentSong = index === currentIndex;
    const imageUrl = getBestImageUrl(item.image);
    const artistNames = getArtistNames(item);
    const duration = formatDuration(item.duration);

    return (
      <TouchableOpacity
        style={[styles.queueItem, isCurrentSong && styles.currentItem]}
        onPress={() => handlePlayFromQueue(index)}
        activeOpacity={0.7}
      >
        <View style={styles.indexContainer}>
          {isCurrentSong && isPlaying ? (
            <Ionicons name="musical-notes" size={18} color={COLORS.primary} />
          ) : (
            <Text style={[styles.indexText, isCurrentSong && styles.currentIndexText]}>
              {index + 1}
            </Text>
          )}
        </View>

        <Image source={{ uri: imageUrl }} style={styles.artwork} />

        <View style={styles.songInfo}>
          <Text
            style={[styles.songTitle, isCurrentSong && styles.currentTitle]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artistNames}
          </Text>
        </View>

        <Text style={styles.duration}>{duration}</Text>

        {!isCurrentSong && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(index)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <EmptyState
      icon="list-outline"
      title="Queue is Empty"
      message="Add songs to your queue to see them here"
      actionLabel="Browse Songs"
      onAction={() => navigation.goBack()}
    />
  );

  // Render header component
  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderTitle}>Up Next</Text>
      <Text style={styles.listHeaderSubtitle}>
        {queue.length} {queue.length === 1 ? 'song' : 'songs'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Queue</Text>

        {queue.length > 0 && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClearQueue}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Now Playing Section */}
      {currentSong && currentIndex >= 0 && currentIndex < queue.length && (
        <View style={styles.nowPlayingSection}>
          <Text style={styles.sectionTitle}>Now Playing</Text>
          <View style={styles.nowPlayingCard}>
            <Image
              source={{ uri: getBestImageUrl(currentSong.image) }}
              style={styles.nowPlayingArtwork}
            />
            <View style={styles.nowPlayingInfo}>
              <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                {currentSong.name}
              </Text>
              <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                {getArtistNames(currentSong)}
              </Text>
            </View>
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={40}
              color={COLORS.primary}
            />
          </View>
        </View>
      )}

      {/* Queue List */}
      <FlatList
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderQueueItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={queue.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.sm,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  clearText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    textAlign: 'right',
  },
  nowPlayingSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nowPlayingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  nowPlayingArtwork: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  nowPlayingInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nowPlayingTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  nowPlayingArtist: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  listHeaderTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  listHeaderSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  currentItem: {
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
  currentIndexText: {
    color: COLORS.primary,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    marginLeft: SPACING.sm,
  },
  songInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  songTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  currentTitle: {
    color: COLORS.primary,
  },
  artistName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  duration: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginRight: SPACING.sm,
  },
  removeButton: {
    padding: SPACING.xs,
  },
});

export default QueueScreen;
