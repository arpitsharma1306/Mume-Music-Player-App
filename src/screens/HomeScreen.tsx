import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Song } from '../types';
import { COLORS, SPACING, FONT_SIZE, MINI_PLAYER_HEIGHT, TAB_BAR_HEIGHT } from '../constants';
import { searchSongs, getSongSuggestions } from '../services/api';
import { usePlayerStore } from '../store';
import { SongCard, SearchBar, LoadingSpinner, EmptyState, SongOptionsModal } from '../components';

const TRENDING_QUERIES = ['arijit singh', 'pritam', 'bollywood hits', 'latest hindi songs'];

const HomeScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const currentSong = usePlayerStore((state) => state.currentSong);

  // Fetch initial songs
  const fetchSongs = async (query: string = '', pageNum: number = 0, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Use a random trending query if no search query
      const searchTerm = query || TRENDING_QUERIES[Math.floor(Math.random() * TRENDING_QUERIES.length)];
      
      const result = await searchSongs(searchTerm, pageNum, 20);
      
      if (result.success && result.data.results) {
        const newSongs = result.data.results;
        
        if (pageNum === 0 || refresh) {
          setSongs(newSongs);
        } else {
          setSongs((prev) => [...prev, ...newSongs]);
        }
        
        setHasMore(newSongs.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSongs();
  }, []);

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchSongs(searchQuery, 0);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSongs(searchQuery, 0, true);
  };

  // Handle load more (pagination)
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchSongs(searchQuery, page + 1);
    }
  };

  // Handle song options
  const handleSongOptions = (song: Song) => {
    setSelectedSong(song);
    setShowOptions(true);
  };

  // Render song item
  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <SongCard
      song={item}
      index={index}
      showIndex
      onOptionsPress={() => handleSongOptions(item)}
    />
  );

  // Render footer (loading more indicator)
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return <LoadingSpinner size="small" message="Loading more..." />;
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="search-outline"
        title="No Songs Found"
        message="Try searching for a different song or artist"
        actionLabel="Browse Trending"
        onAction={() => {
          setSearchQuery('');
          fetchSongs();
        }}
      />
    );
  };

  // Calculate bottom padding based on mini player visibility
  const bottomPadding = currentSong ? MINI_PLAYER_HEIGHT + SPACING.md : SPACING.md;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MUME</Text>
        <Text style={styles.headerSubtitle}>Music Player</Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        onClear={() => {
          setSearchQuery('');
          fetchSongs();
        }}
        placeholder="Search songs, artists..."
      />

      {/* Song List */}
      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading songs..." />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomPadding },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    flexGrow: 1,
  },
});

export default HomeScreen;
