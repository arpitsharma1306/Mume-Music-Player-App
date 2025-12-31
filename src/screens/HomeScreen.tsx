import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SPACING, FONT_SIZE, BORDER_RADIUS, API_BASE_URL } from '../constants';
import { Song, RootStackParamList, HomeTab, SortOrder, SortBy } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { useRecentlyPlayedStore } from '../store/recentlyPlayedStore';
import LoadingSpinner from '../components/LoadingSpinner';
import SongOptionsModal from '../components/SongOptionsModal';
import { getArtistSongs } from '../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TABS: { key: HomeTab; label: string }[] = [
  { key: 'suggested', label: 'Suggested' },
  { key: 'songs', label: 'Songs' },
  { key: 'artists', label: 'Artists' },
  { key: 'albums', label: 'Albums' },
  { key: 'folders', label: 'Folders' },
];

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'artist', label: 'Artist' },
  { key: 'album', label: 'Album' },
  { key: 'year', label: 'Year' },
  { key: 'duration', label: 'Duration' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<HomeTab>('suggested');
  const [songs, setSongs] = useState<Song[]>([]);
  const [trendingArtists, setTrendingArtists] = useState<any[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('ascending');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [loadingArtistSongs, setLoadingArtistSongs] = useState(false);
  const [songsPage, setSongsPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreSongs, setHasMoreSongs] = useState(true);

  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();
  const { isDarkMode } = useThemeStore();
  const { recentlyPlayed, addToRecentlyPlayed } = useRecentlyPlayedStore();
  const COLORS = getThemeColors(isDarkMode);

  // Fetch songs using XMLHttpRequest (more reliable in React Native)
  const fetchSongsFromAPI = async (query: string, page: number = 0, limit: number = 50): Promise<Song[]> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${API_BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      
      console.log('XHR Request:', url);
      
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = () => {
        console.log('XHR Status:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('XHR Success, songs:', data?.data?.results?.length || 0);
            resolve(data?.data?.results || []);
          } catch (e) {
            console.error('JSON Parse error:', e);
            resolve([]);
          }
        } else {
          console.error('XHR Error status:', xhr.status);
          resolve([]);
        }
      };
      
      xhr.onerror = () => {
        console.error('XHR Network error');
        resolve([]);
      };
      
      xhr.ontimeout = () => {
        console.error('XHR Timeout');
        resolve([]);
      };
      
      xhr.timeout = 30000;
      xhr.send();
    });
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSongsPage(0);
      setHasMoreSongs(true);
      
      console.log('=== Fetching songs ===');
      
      // Try to fetch songs
      const songResults = await fetchSongsFromAPI('latest hindi songs', 0, 50);
      
      if (songResults.length > 0) {
        console.log('Setting', songResults.length, 'songs');
        setMostPlayed(songResults.slice(0, 12));
        setSongs(songResults);
        setHasMoreSongs(songResults.length >= 50);
        
        // Extract artists
        const artistSet = new Map();
        songResults.forEach((song: Song) => {
          const artistName = song.artists?.primary?.[0]?.name || song.primaryArtists?.split(',')?.[0]?.trim();
          const artistId = song.artists?.primary?.[0]?.id;
          if (artistName && artistId && !artistSet.has(artistId)) {
            artistSet.set(artistId, {
              id: artistId,
              name: artistName,
              image: song.image,
            });
          }
        });
        setTrendingArtists(Array.from(artistSet.values()).slice(0, 6));
      } else {
        // If no songs, show welcome message
        setError('Welcome! Tap Search to find your favorite music.');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Tap Search to find music');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreSongs = useCallback(async () => {
    if (loadingMore || !hasMoreSongs) return;
    
    setLoadingMore(true);
    const nextPage = songsPage + 1;
    
    try {
      const moreSongs = await fetchSongsFromAPI('latest hindi songs', nextPage, 50);
      
      if (moreSongs.length > 0) {
        // Filter out duplicates by ID
        const existingIds = new Set(songs.map(s => s.id));
        const newSongs = moreSongs.filter(s => !existingIds.has(s.id));
        
        setSongs(prev => [...prev, ...newSongs]);
        setSongsPage(nextPage);
        setHasMoreSongs(moreSongs.length >= 50);
      } else {
        setHasMoreSongs(false);
      }
    } catch (error) {
      console.error('Error loading more songs:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMoreSongs, songsPage, songs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handlePlaySong = (song: Song, songList: Song[]) => {
    setQueue(songList, songList.indexOf(song));
    playSong(song, false);
    addToRecentlyPlayed(song);
    navigation.navigate('Player', { song });
  };

  const handleArtistPress = async (artist: any) => {
    if (!artist.id || artist.id === artist.name) {
      // If no valid artist ID, search for their songs
      const results = await fetchSongsFromAPI(artist.name);
      if (results.length > 0) {
        setArtistSongs(results);
        setSelectedArtist(artist);
      }
      return;
    }
    
    setLoadingArtistSongs(true);
    setSelectedArtist(artist);
    
    try {
      const response = await getArtistSongs(artist.id, 0, 50);
      if (response.success && response.data.results) {
        setArtistSongs(response.data.results);
      } else {
        // Fallback to search
        const results = await fetchSongsFromAPI(artist.name);
        setArtistSongs(results);
      }
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      // Fallback to search
      const results = await fetchSongsFromAPI(artist.name);
      setArtistSongs(results);
    } finally {
      setLoadingArtistSongs(false);
    }
  };

  const handleSongOptions = (song: Song) => {
    setSelectedSong(song);
    setShowOptionsModal(true);
  };

  const getSortedSongs = () => {
    const sorted = [...songs].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortBy) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'artist':
          valueA = a.artists?.primary?.[0]?.name?.toLowerCase() || a.primaryArtists?.toLowerCase() || '';
          valueB = b.artists?.primary?.[0]?.name?.toLowerCase() || b.primaryArtists?.toLowerCase() || '';
          break;
        case 'album':
          valueA = a.album?.name?.toLowerCase() || '';
          valueB = b.album?.name?.toLowerCase() || '';
          break;
        case 'year':
          valueA = parseInt(a.year || '0');
          valueB = parseInt(b.year || '0');
          break;
        case 'duration':
          valueA = typeof a.duration === 'number' ? a.duration : parseInt(String(a.duration) || '0');
          valueB = typeof b.duration === 'number' ? b.duration : parseInt(String(b.duration) || '0');
          break;
        default:
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'ascending' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      return sortOrder === 'ascending' 
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });

    return sorted;
  };

  const formatDuration = (duration: number | string | null | undefined): string => {
    if (!duration) return '0:00';
    const totalSeconds = typeof duration === 'string' ? parseInt(duration) : duration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isCurrentSong = (song: Song) => currentSong?.id === song.id;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Ionicons name="musical-notes" size={28} color={COLORS.primary} />
        <Text style={[styles.logoText, { color: COLORS.textPrimary }]}>Mume</Text>
      </View>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search-outline" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabsContainer}
      contentContainerStyle={styles.tabsContent}
    >
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && [styles.activeTab, { borderBottomColor: COLORS.primary }]]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Text style={[
            styles.tabText, 
            { color: COLORS.textSecondary },
            activeTab === tab.key && [styles.activeTabText, { color: COLORS.primary }]
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSuggestedTab = () => {
    if (songs.length === 0) {
      return (
        <View style={styles.welcomeContainer}>
          <Ionicons name="musical-notes" size={80} color={COLORS.primary} />
          <Text style={[styles.welcomeTitle, { color: COLORS.textPrimary }]}>Welcome to Mume</Text>
          <Text style={[styles.welcomeText, { color: COLORS.textSecondary }]}>Tap the search icon to find your favorite songs</Text>
          <TouchableOpacity 
            style={[styles.searchPromptButton, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchPromptText}>Search Music</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Recently Played Section */}
        {recentlyPlayed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Recently Played</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentlyPlayed.map((song, index) => (
                <TouchableOpacity
                  key={song.id + index}
                  style={[styles.recentCard, { backgroundColor: COLORS.surface }]}
                  onPress={() => handlePlaySong(song, recentlyPlayed)}
                >
                  <Image
                    source={{ uri: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url }}
                    style={styles.recentImage}
                  />
                  <Text style={[styles.recentTitle, { color: COLORS.textPrimary }]} numberOfLines={2}>
                    {song.name}
                  </Text>
                  <Text style={[styles.recentArtist, { color: COLORS.textSecondary }]} numberOfLines={1}>
                    {song.artists?.primary?.[0]?.name || song.primaryArtists}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Artists Section */}
        {trendingArtists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Artists</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trendingArtists.map((artist, index) => (
                <TouchableOpacity 
                  key={artist.id + index} 
                  style={styles.artistCard}
                  onPress={() => handleArtistPress(artist)}
                >
                  <Image
                    source={{ uri: artist.image?.[2]?.url || artist.image?.[1]?.url }}
                    style={styles.artistImage}
                  />
                  <Text style={[styles.artistName, { color: COLORS.textPrimary }]} numberOfLines={1}>
                    {artist.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Most Played Section */}
        {mostPlayed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Most Played</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mostPlayed.map((song, index) => (
                <TouchableOpacity
                  key={song.id + index}
                  style={[styles.recentCard, { backgroundColor: COLORS.surface }]}
                  onPress={() => handlePlaySong(song, mostPlayed)}
                >
                  <Image
                    source={{ uri: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url }}
                    style={styles.recentImage}
                  />
                  <Text style={[styles.recentTitle, { color: COLORS.textPrimary }]} numberOfLines={2}>
                    {song.name}
                  </Text>
                  <Text style={[styles.recentArtist, { color: COLORS.textSecondary }]} numberOfLines={1}>
                    {song.artists?.primary?.[0]?.name || song.primaryArtists}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderSongsTab = () => {
    const sortedSongs = getSortedSongs();
    
    if (sortedSongs.length === 0) {
      return (
        <View style={styles.welcomeContainer}>
          <Ionicons name="musical-note-outline" size={64} color={COLORS.textMuted} />
          <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No songs yet</Text>
          <TouchableOpacity 
            style={[styles.searchPromptButton, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchPromptText}>Search Music</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.songsContainer}>
        <View style={styles.songsHeader}>
          <Text style={[styles.songsCount, { color: COLORS.textSecondary }]}>{sortedSongs.length} songs</Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={20} color={COLORS.textSecondary} />
            <Text style={[styles.sortButtonText, { color: COLORS.textSecondary }]}>Sort</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={sortedSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item: song }) => (
            <TouchableOpacity
              style={[styles.songItem, { backgroundColor: COLORS.surface }, isCurrentSong(song) && [styles.songItemActive, { backgroundColor: COLORS.primaryLight }]]}
              onPress={() => handlePlaySong(song, sortedSongs)}
              onLongPress={() => handleSongOptions(song)}
            >
              <Image
                source={{ uri: song.image?.[1]?.url || song.image?.[0]?.url }}
                style={styles.songImage}
              />
              <View style={styles.songInfo}>
                <Text 
                  style={[styles.songTitle, { color: COLORS.textPrimary }, isCurrentSong(song) && [styles.songTitleActive, { color: COLORS.primary }]]} 
                  numberOfLines={1}
                >
                  {song.name}
                </Text>
                <Text style={[styles.songArtist, { color: COLORS.textSecondary }]} numberOfLines={1}>
                  {song.artists?.primary?.[0]?.name || song.primaryArtists}
                </Text>
              </View>
              <Text style={[styles.songDuration, { color: COLORS.textMuted }]}>{formatDuration(song.duration)}</Text>
              <TouchableOpacity
                style={styles.songOptions}
                onPress={() => handleSongOptions(song)}
              >
                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.songsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          onEndReached={loadMoreSongs}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            loadingMore ? (
              <View style={styles.loadingMore}>
                <LoadingSpinner size="small" />
                <Text style={[styles.loadingMoreText, { color: COLORS.textSecondary }]}>Loading more songs...</Text>
              </View>
            ) : null
          )}
        />
      </View>
    );
  };

  const renderArtistsTab = () => {
    if (trendingArtists.length === 0) {
      return (
        <View style={styles.welcomeContainer}>
          <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
          <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No artists yet</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={trendingArtists}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item: artist }) => (
          <TouchableOpacity 
            style={styles.artistGridItem}
            onPress={() => handleArtistPress(artist)}
          >
            <Image
              source={{ uri: artist.image?.[2]?.url || artist.image?.[1]?.url }}
              style={styles.artistGridImage}
            />
            <Text style={[styles.artistGridName, { color: COLORS.textPrimary }]} numberOfLines={1}>
              {artist.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.artistsGrid}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderAlbumsTab = () => (
    <View style={styles.welcomeContainer}>
      <Ionicons name="albums-outline" size={64} color={COLORS.textMuted} />
      <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No albums yet</Text>
    </View>
  );

  const renderFoldersTab = () => (
    <View style={styles.welcomeContainer}>
      <Ionicons name="folder-outline" size={64} color={COLORS.textMuted} />
      <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No folders found</Text>
    </View>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
        <View style={[styles.sortModal, { backgroundColor: COLORS.surface }]}>
          <View style={[styles.modalHandle, { backgroundColor: COLORS.textMuted }]} />
          <Text style={[styles.modalTitle, { color: COLORS.textPrimary }]}>Sort By</Text>
          
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => setSortOrder('ascending')}
          >
            <Text style={[styles.sortOptionText, { color: COLORS.textPrimary }]}>Ascending</Text>
            <View style={[styles.radioButton, { borderColor: COLORS.textMuted }, sortOrder === 'ascending' && [styles.radioButtonActive, { borderColor: COLORS.primary }]]}>
              {sortOrder === 'ascending' && <View style={[styles.radioButtonInner, { backgroundColor: COLORS.primary }]} />}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => setSortOrder('descending')}
          >
            <Text style={[styles.sortOptionText, { color: COLORS.textPrimary }]}>Descending</Text>
            <View style={[styles.radioButton, { borderColor: COLORS.textMuted }, sortOrder === 'descending' && [styles.radioButtonActive, { borderColor: COLORS.primary }]]}>
              {sortOrder === 'descending' && <View style={[styles.radioButtonInner, { backgroundColor: COLORS.primary }]} />}
            </View>
          </TouchableOpacity>

          <View style={[styles.sortDivider, { backgroundColor: COLORS.border }]} />

          {SORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={styles.sortOption}
              onPress={() => {
                setSortBy(option.key);
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, { color: COLORS.textPrimary }]}>{option.label}</Text>
              <View style={[styles.radioButton, { borderColor: COLORS.textMuted }, sortBy === option.key && [styles.radioButtonActive, { borderColor: COLORS.primary }]]}>
                {sortBy === option.key && <View style={[styles.radioButtonInner, { backgroundColor: COLORS.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  const renderArtistSongsModal = () => (
    <Modal
      visible={selectedArtist !== null}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setSelectedArtist(null);
        setArtistSongs([]);
      }}
    >
      <View style={[styles.artistModalContainer, { backgroundColor: COLORS.background }]}>
        <View style={styles.artistModalHeader}>
          <TouchableOpacity 
            onPress={() => {
              setSelectedArtist(null);
              setArtistSongs([]);
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.artistModalTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
            {selectedArtist?.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        
        {loadingArtistSongs ? (
          <LoadingSpinner />
        ) : artistSongs.length > 0 ? (
          <FlatList
            data={artistSongs}
            keyExtractor={(item) => item.id}
            renderItem={({ item: song, index }) => (
              <TouchableOpacity
                style={[styles.songItem, { backgroundColor: COLORS.surface }, isCurrentSong(song) && [styles.songItemActive, { backgroundColor: COLORS.primaryLight }]]}
                onPress={() => {
                  handlePlaySong(song, artistSongs);
                  setSelectedArtist(null);
                  setArtistSongs([]);
                }}
              >
                <Image
                  source={{ uri: song.image?.[1]?.url || song.image?.[0]?.url }}
                  style={styles.songImage}
                />
                <View style={styles.songInfo}>
                  <Text style={[styles.songTitle, { color: COLORS.textPrimary }, isCurrentSong(song) && [styles.songTitleActive, { color: COLORS.primary }]]} numberOfLines={1}>
                    {song.name}
                  </Text>
                  <Text style={[styles.songArtist, { color: COLORS.textSecondary }]} numberOfLines={1}>
                    {song.artists?.primary?.[0]?.name || song.primaryArtists}
                  </Text>
                </View>
                <Text style={[styles.songDuration, { color: COLORS.textMuted }]}>{formatDuration(song.duration)}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <View style={styles.welcomeContainer}>
            <Ionicons name="musical-note-outline" size={64} color={COLORS.textMuted} />
            <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>No songs found for this artist</Text>
          </View>
        )}
      </View>
    </Modal>
  );

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    switch (activeTab) {
      case 'suggested':
        return renderSuggestedTab();
      case 'songs':
        return renderSongsTab();
      case 'artists':
        return renderArtistsTab();
      case 'albums':
        return renderAlbumsTab();
      case 'folders':
        return renderFoldersTab();
      default:
        return renderSuggestedTab();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top']}>
      {renderHeader()}
      {renderTabs()}
      {renderContent()}
      {renderSortModal()}
      {renderArtistSongsModal()}
      
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  searchButton: {
    padding: SPACING.sm,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  welcomeTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    marginTop: SPACING.lg,
  },
  welcomeText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  searchPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xl,
  },
  searchPromptText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  recentCard: {
    width: 130,
    marginRight: SPACING.md,
  },
  recentImage: {
    width: 130,
    height: 130,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  recentTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  recentArtist: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  artistCard: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 80,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.sm,
  },
  artistName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  songsContainer: {
    flex: 1,
  },
  songsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  songsCount: {
    fontSize: FONT_SIZE.md,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.xs,
  },
  songsList: {
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  songItemActive: {
    opacity: 0.8,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.sm,
  },
  songInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  songTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  songTitleActive: {
  },
  songArtist: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  songDuration: {
    fontSize: FONT_SIZE.sm,
    marginRight: SPACING.sm,
  },
  songOptions: {
    padding: SPACING.xs,
  },
  artistsGrid: {
    padding: SPACING.lg,
  },
  artistGridItem: {
    flex: 1,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    maxWidth: '33.33%',
  },
  artistGridImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: SPACING.sm,
  },
  artistGridName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sortModal: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  sortOptionText: {
    fontSize: FONT_SIZE.md,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sortDivider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  artistModalContainer: {
    flex: 1,
  },
  artistModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  artistModalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: SPACING.sm,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingMoreText: {
    fontSize: FONT_SIZE.sm,
  },
});

export default HomeScreen;
