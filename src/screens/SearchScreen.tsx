import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SPACING, FONT_SIZE, BORDER_RADIUS, API_BASE_URL } from '../constants';
import { Song, RootStackParamList } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import LoadingSpinner from '../components/LoadingSpinner';
import SongOptionsModal from '../components/SongOptionsModal';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'songs' | 'artists' | 'albums' | 'folders';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'songs', label: 'Songs' },
  { key: 'artists', label: 'Artists' },
  { key: 'albums', label: 'Albums' },
  { key: 'folders', label: 'Folders' },
];

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('songs');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const COLORS = getThemeColors(isDarkMode);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (searchQuery: string) => {
    try {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const removeRecentSearch = async (searchQuery: string) => {
    try {
      const updated = recentSearches.filter(s => s !== searchQuery);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      console.log('Searching for:', searchQuery.trim());
      
      // Use /api/search/songs endpoint as per documentation
      const response = await api.get('/api/search/songs', {
        params: { 
          query: searchQuery.trim(),
          page: 0,
          limit: 20
        }
      });
      
      console.log('Search response:', response.status);
      const songs = response.data?.data?.results || [];
      console.log('Found songs:', songs.length);
      
      if (songs.length > 0) {
        setResults(songs);
        saveRecentSearch(searchQuery.trim());
      } else {
        setResults([]);
      }
    } catch (error: any) {
      console.error('Search error:', error.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [recentSearches]);

  const handlePlaySong = (song: Song) => {
    setQueue(results, results.indexOf(song));
    playSong(song, false);
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

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <View style={[styles.searchContainer, { backgroundColor: inputFocused ? COLORS.primary : COLORS.surface }]}>
        <Ionicons name="search" size={20} color={inputFocused ? COLORS.white : COLORS.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: inputFocused ? COLORS.white : COLORS.textPrimary }]}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={inputFocused ? COLORS.white : COLORS.textTertiary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch(query)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => {
            setQuery('');
            setResults([]);
            setShowResults(false);
          }}>
            <Ionicons name="close" size={20} color={inputFocused ? COLORS.white : COLORS.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {FILTERS.map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[styles.filterChip, { borderColor: COLORS.primary }, activeFilter === filter.key && { backgroundColor: COLORS.primary }]}
          onPress={() => setActiveFilter(filter.key)}
        >
          <Text style={[styles.filterText, { color: COLORS.primary }, activeFilter === filter.key && { color: COLORS.white }]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRecentSearches = () => (
    <View style={styles.recentContainer}>
      <View style={styles.recentHeader}>
        <Text style={[styles.recentTitle, { color: COLORS.textPrimary }]}>Recent Searches</Text>
        {recentSearches.length > 0 && (
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={[styles.clearAll, { color: COLORS.primary }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentSearches.map((search, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.recentItem, { borderBottomColor: COLORS.border }]}
          onPress={() => {
            setQuery(search);
            handleSearch(search);
          }}
        >
          <Text style={[styles.recentText, { color: COLORS.textPrimary }]}>{search}</Text>
          <TouchableOpacity onPress={() => removeRecentSearch(search)}>
            <Ionicons name="close" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyEmoji, { backgroundColor: COLORS.primary }]}>
        <Text style={styles.emojiText}>😔</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>Not Found</Text>
      <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>
        Sorry, the keyword you entered cannot be found, please check again or search with another keyword.
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

  const renderResults = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (results.length === 0 && showResults) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={results}
        keyExtractor={(item, index) => item.id + index}
        renderItem={renderSongItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: SPACING.lg }}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top']}>
      {renderHeader()}
      {renderFilters()}
      
      {!showResults ? renderRecentSearches() : renderResults()}

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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  backButton: {
    padding: SPACING.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchContainerFocused: {
  },
  searchInput: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  searchInputFocused: {
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  activeFilterChip: {
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  activeFilterText: {
  },
  recentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recentTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  clearAll: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  recentText: {
    fontSize: FONT_SIZE.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyEmoji: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emojiText: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
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
  activeSongTitle: {
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
  pauseButton: {
  },
  moreButton: {
    padding: SPACING.sm,
  },
});

export default SearchScreen;
