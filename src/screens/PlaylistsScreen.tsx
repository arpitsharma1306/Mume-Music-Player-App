import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { Playlist, RootStackParamList, Song } from '../types';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { useDownloadStore } from '../store/downloadStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { useRecentlyPlayedStore } from '../store/recentlyPlayedStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PlaylistsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { playlists, createPlaylist, deletePlaylist } = usePlaylistStore();
  const { playSong } = usePlayerStore();
  const { setQueue } = useQueueStore();
  const { downloadedSongs } = useDownloadStore();
  const { isDarkMode } = useThemeStore();
  const { addToRecentlyPlayed } = useRecentlyPlayedStore();
  const COLORS = getThemeColors(isDarkMode);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);
  const [showDownloaded, setShowDownloaded] = useState(false);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handleDeletePlaylist = (playlistId: string, playlistName: string) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlistName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deletePlaylist(playlistId)
        },
      ]
    );
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs, 0);
      playSong(playlist.songs[0], false);
      addToRecentlyPlayed(playlist.songs[0]);
      navigation.navigate('Player', { song: playlist.songs[0] });
    }
  };

  const handleShufflePlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.songs.length);
      setQueue(playlist.songs, randomIndex);
      playSong(playlist.songs[randomIndex], false);
      addToRecentlyPlayed(playlist.songs[randomIndex]);
      navigation.navigate('Player', { song: playlist.songs[randomIndex] });
    }
  };

  const handlePlayDownloadedSong = (song: Song, index: number) => {
    const songs = downloadedSongs.map(ds => ({ ...ds })) as Song[];
    setQueue(songs, index);
    playSong(song, false);
    addToRecentlyPlayed(song);
    navigation.navigate('Player', { song });
  };

  const handlePlayAllDownloaded = () => {
    if (downloadedSongs.length > 0) {
      const songs = downloadedSongs.map(ds => ({ ...ds })) as Song[];
      setQueue(songs, 0);
      playSong(songs[0], false);
      addToRecentlyPlayed(songs[0]);
      navigation.navigate('Player', { song: songs[0] });
    }
  };

  const handleShuffleDownloaded = () => {
    if (downloadedSongs.length > 0) {
      const songs = downloadedSongs.map(ds => ({ ...ds })) as Song[];
      const randomIndex = Math.floor(Math.random() * songs.length);
      setQueue(songs, randomIndex);
      playSong(songs[randomIndex], false);
      addToRecentlyPlayed(songs[randomIndex]);
      navigation.navigate('Player', { song: songs[randomIndex] });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="musical-notes-outline" size={80} color={COLORS.textMuted} />
      <Text style={[styles.emptyTitle, { color: COLORS.textPrimary }]}>No Playlists Yet</Text>
      <Text style={[styles.emptySubtitle, { color: COLORS.textSecondary }]}>
        Create your first playlist and start adding your favorite songs.
      </Text>
      <TouchableOpacity 
        style={[styles.createButton, { backgroundColor: COLORS.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={[styles.createButtonText, { color: COLORS.white }]}>Create Playlist</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    const isExpanded = expandedPlaylist === item.id;

    return (
      <View style={[styles.playlistContainer, { backgroundColor: COLORS.surface }]}>
        <TouchableOpacity
          style={styles.playlistItem}
          onPress={() => setExpandedPlaylist(isExpanded ? null : item.id)}
        >
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage }} style={styles.playlistImage} />
          ) : (
            <View style={[styles.playlistImage, styles.playlistImagePlaceholder, { backgroundColor: COLORS.backgroundTertiary }]}>
              <Ionicons name="musical-notes" size={24} color={COLORS.textTertiary} />
            </View>
          )}
          <View style={styles.playlistInfo}>
            <Text style={[styles.playlistTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.playlistMeta, { color: COLORS.textSecondary }]}>
              {item.songs.length} songs • Created {formatDate(item.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleDeletePlaylist(item.id, item.name)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && item.songs.length > 0 && (
          <View style={[styles.expandedContent, { borderTopColor: COLORS.border }]}>
            <View style={styles.playlistActions}>
              <TouchableOpacity
                style={[styles.shuffleBtn, { backgroundColor: COLORS.primary }]}
                onPress={() => handleShufflePlaylist(item)}
              >
                <Ionicons name="shuffle" size={18} color={COLORS.white} />
                <Text style={[styles.shuffleBtnText, { color: COLORS.white }]}>Shuffle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.playBtn, { backgroundColor: COLORS.background, borderColor: COLORS.primary }]}
                onPress={() => handlePlayPlaylist(item)}
              >
                <Ionicons name="play" size={18} color={COLORS.primary} />
                <Text style={[styles.playBtnText, { color: COLORS.primary }]}>Play</Text>
              </TouchableOpacity>
            </View>
            {item.songs.slice(0, 3).map((song, index) => (
              <TouchableOpacity
                key={song.id + index}
                style={styles.songItem}
                onPress={() => {
                  setQueue(item.songs, index);
                  playSong(song, false);
                  addToRecentlyPlayed(song);
                  navigation.navigate('Player', { song });
                }}
              >
                <Image
                  source={{ uri: song.image?.[1]?.url || song.image?.[0]?.url }}
                  style={[styles.songImage, { backgroundColor: COLORS.backgroundTertiary }]}
                />
                <View style={styles.songInfo}>
                  <Text style={[styles.songTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
                    {song.name}
                  </Text>
                  <Text style={[styles.songArtist, { color: COLORS.textSecondary }]} numberOfLines={1}>
                    {song.artists?.primary?.[0]?.name || song.primaryArtists}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {item.songs.length > 3 && (
              <Text style={[styles.moreSongs, { color: COLORS.primary }]}>
                +{item.songs.length - 3} more songs
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderDownloadedSection = () => (
    <View style={[styles.playlistContainer, { backgroundColor: COLORS.surface }]}>
      <TouchableOpacity
        style={styles.playlistItem}
        onPress={() => setShowDownloaded(!showDownloaded)}
      >
        <View style={[styles.playlistImage, styles.playlistImagePlaceholder, { backgroundColor: COLORS.backgroundTertiary }]}>
          <Ionicons name="download" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
            Downloaded Songs
          </Text>
          <Text style={[styles.playlistMeta, { color: COLORS.textSecondary }]}>
            {downloadedSongs.length} songs
          </Text>
        </View>
        <Ionicons 
          name={showDownloaded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={COLORS.textSecondary} 
        />
      </TouchableOpacity>

      {showDownloaded && downloadedSongs.length > 0 && (
        <View style={[styles.expandedContent, { borderTopColor: COLORS.border }]}>
          <View style={styles.playlistActions}>
            <TouchableOpacity
              style={[styles.shuffleBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleShuffleDownloaded}
            >
              <Ionicons name="shuffle" size={18} color={COLORS.white} />
              <Text style={[styles.shuffleBtnText, { color: COLORS.white }]}>Shuffle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: COLORS.background, borderColor: COLORS.primary }]}
              onPress={handlePlayAllDownloaded}
            >
              <Ionicons name="play" size={18} color={COLORS.primary} />
              <Text style={[styles.playBtnText, { color: COLORS.primary }]}>Play All</Text>
            </TouchableOpacity>
          </View>
          {downloadedSongs.slice(0, 5).map((song, index) => (
            <TouchableOpacity
              key={song.id + index}
              style={styles.songItem}
              onPress={() => handlePlayDownloadedSong(song, index)}
            >
              <Image
                source={{ uri: song.image?.[1]?.url || song.image?.[0]?.url }}
                style={[styles.songImage, { backgroundColor: COLORS.backgroundTertiary }]}
              />
              <View style={styles.songInfo}>
                <Text style={[styles.songTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
                  {song.name}
                </Text>
                <Text style={[styles.songArtist, { color: COLORS.textSecondary }]} numberOfLines={1}>
                  {song.artists?.primary?.[0]?.name || song.primaryArtists}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            </TouchableOpacity>
          ))}
          {downloadedSongs.length > 5 && (
            <Text style={[styles.moreSongs, { color: COLORS.primary }]}>
              +{downloadedSongs.length - 5} more songs
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <Pressable style={[styles.modalOverlay, { backgroundColor: COLORS.overlay }]} onPress={() => setShowCreateModal(false)}>
        <View style={[styles.createModal, { backgroundColor: COLORS.background }]}>
          <Text style={[styles.modalTitle, { color: COLORS.textPrimary }]}>Create Playlist</Text>
          <TextInput
            style={[styles.input, { backgroundColor: COLORS.surface, color: COLORS.textPrimary, borderColor: COLORS.border }]}
            placeholder="Playlist name"
            placeholderTextColor={COLORS.textTertiary}
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setNewPlaylistName('');
                setShowCreateModal(false);
              }}
            >
              <Text style={[styles.cancelBtnText, { color: COLORS.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: COLORS.primary }, !newPlaylistName.trim() && styles.disabledBtn]}
              onPress={handleCreatePlaylist}
              disabled={!newPlaylistName.trim()}
            >
              <Text style={[styles.confirmBtnText, { color: COLORS.white }]}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="list" size={28} color={COLORS.primary} />
          <Text style={[styles.logoText, { color: COLORS.textPrimary }]}>Playlists</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistItem}
        ListHeaderComponent={() => (
          <>
            {/* Downloaded Songs Section */}
            {downloadedSongs.length > 0 && renderDownloadedSection()}
          </>
        )}
        ListEmptyComponent={() => (
          downloadedSongs.length === 0 ? renderEmptyState() : null
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: SPACING.lg }}
      />

      {renderCreateModal()}
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
  addButton: {
    padding: SPACING.sm,
  },
  playlistContainer: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  playlistImage: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
  },
  playlistImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  playlistTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  playlistMeta: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  moreButton: {
    padding: SPACING.sm,
  },
  expandedContent: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
  },
  playlistActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingTop: SPACING.md,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  shuffleBtnText: {
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  playBtnText: {
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  songImage: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
  },
  songInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  songTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  songArtist: {
    fontSize: FONT_SIZE.xs,
  },
  moreSongs: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  createButtonText: {
    fontWeight: '600',
    fontSize: FONT_SIZE.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModal: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '85%',
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  input: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  cancelBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  cancelBtnText: {
    fontWeight: '500',
    fontSize: FONT_SIZE.md,
  },
  confirmBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontWeight: '600',
    fontSize: FONT_SIZE.md,
  },
});

export default PlaylistsScreen;
