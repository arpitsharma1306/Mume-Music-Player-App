import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Song, DownloadedSong } from '../types';
import { COLORS, SPACING, FONT_SIZE, MINI_PLAYER_HEIGHT, BORDER_RADIUS } from '../constants';
import { usePlayerStore, useQueueStore, useDownloadStore } from '../store';
import { SongCard, EmptyState, SongOptionsModal } from '../components';

type TabType = 'queue' | 'downloads';

const LibraryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const currentSong = usePlayerStore((state) => state.currentSong);
  const { queue, clearQueue } = useQueueStore();
  const { downloadedSongs, clearAllDownloads } = useDownloadStore();

  // Handle song options
  const handleSongOptions = (song: Song) => {
    setSelectedSong(song);
    setShowOptions(true);
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

  // Handle clear downloads
  const handleClearDownloads = () => {
    Alert.alert(
      'Clear Downloads',
      'Are you sure you want to delete all downloaded songs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: clearAllDownloads },
      ]
    );
  };

  // Render song item
  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <SongCard
      song={item}
      index={index}
      showIndex={activeTab === 'queue'}
      onOptionsPress={() => handleSongOptions(item)}
    />
  );

  // Render empty state
  const renderEmptyState = () => {
    if (activeTab === 'queue') {
      return (
        <EmptyState
          icon="list-outline"
          title="Your Queue is Empty"
          message="Add songs to your queue and they will appear here"
        />
      );
    }
    return (
      <EmptyState
        icon="download-outline"
        title="No Downloads"
        message="Download songs to listen offline"
      />
    );
  };

  // Get data based on active tab
  const data = activeTab === 'queue' ? queue : downloadedSongs;
  const hasItems = data.length > 0;

  const bottomPadding = currentSong ? MINI_PLAYER_HEIGHT + SPACING.md : SPACING.md;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        {hasItems && (
          <TouchableOpacity
            onPress={activeTab === 'queue' ? handleClearQueue : handleClearDownloads}
          >
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'queue' && styles.activeTab]}
          onPress={() => setActiveTab('queue')}
        >
          <Ionicons
            name="list"
            size={18}
            color={activeTab === 'queue' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'queue' && styles.activeTabText,
            ]}
          >
            Queue ({queue.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'downloads' && styles.activeTab]}
          onPress={() => setActiveTab('downloads')}
        >
          <Ionicons
            name="download"
            size={18}
            color={activeTab === 'downloads' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'downloads' && styles.activeTabText,
            ]}
          >
            Downloads ({downloadedSongs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Song Options Modal */}
      <SongOptionsModal
        visible={showOptions}
        song={selectedSong}
        onClose={() => setShowOptions(false)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  clearText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  activeTab: {
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  listContent: {
    flexGrow: 1,
  },
});

export default LibraryScreen;
