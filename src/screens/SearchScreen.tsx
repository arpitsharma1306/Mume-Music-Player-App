import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';

import { Song } from '../types';
import { COLORS, SPACING, FONT_SIZE, MINI_PLAYER_HEIGHT, BORDER_RADIUS } from '../constants';
import { searchSongs, globalSearch } from '../services/api';
import { usePlayerStore, useSearchStore } from '../store';
import { SongCard, SearchBar, LoadingSpinner, EmptyState, SongOptionsModal } from '../components';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const currentSong = usePlayerStore((state) => state.currentSong);
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useSearchStore();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchSongs(query, 0, 30);
        if (response.success && response.data.results) {
          setResults(response.data.results);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 500),
    []
  );

  // Handle search query change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      debouncedSearch.cancel();
      performSearch(searchQuery);
    }
  };

  // Perform search
  const performSearch = async (query: string) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await searchSongs(query, 0, 30);
      if (response.success && response.data.results) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle recent search tap
  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // Handle song options
  const handleSongOptions = (song: Song) => {
    setSelectedSong(song);
    setShowOptions(true);
  };

  // Handle clear search
  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  };

  // Render song item
  const renderSongItem = ({ item }: { item: Song }) => (
    <SongCard
      song={item}
      onOptionsPress={() => handleSongOptions(item)}
    />
  );

  // Render recent search item
  const renderRecentItem = ({ item }: { item: string }) => (
    <View style={styles.recentItem}>
      <TouchableOpacity
        style={styles.recentContent}
        onPress={() => handleRecentSearch(item)}
      >
        <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.recentText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeRecentSearch(item)}
      >
        <Ionicons name="close" size={20} color={COLORS.textTertiary} />
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (isSearching) return null;
    
    if (!hasSearched) {
      return (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Popular Searches</Text>
          {['Arijit Singh', 'Pritam', 'AR Rahman', 'Honey Singh'].map((query) => (
            <TouchableOpacity
              key={query}
              style={styles.suggestionItem}
              onPress={() => handleRecentSearch(query)}
            >
              <Ionicons name="trending-up" size={20} color={COLORS.primary} />
              <Text style={styles.suggestionText}>{query}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <EmptyState
        icon="search-outline"
        title="No Results Found"
        message={`No songs found for "${searchQuery}"`}
      />
    );
  };

  const bottomPadding = currentSong ? MINI_PLAYER_HEIGHT + SPACING.md : SPACING.md;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearchChange}
        onSubmit={handleSearchSubmit}
        onClear={handleClear}
        autoFocus={false}
      />

      {/* Recent Searches */}
      {!searchQuery && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            renderItem={renderRecentItem}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Search Results */}
      {isSearching ? (
        <LoadingSpinner message="Searching..." />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomPadding },
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  recentContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recentTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  clearText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  recentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  suggestions: {
    padding: SPACING.md,
  },
  suggestionsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  listContent: {
    flexGrow: 1,
  },
});

export default SearchScreen;
