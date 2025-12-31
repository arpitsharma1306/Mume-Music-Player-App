import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song, Playlist } from '../types';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { useQueueStore } from '../store/queueStore';
import { useDownloadStore } from '../store/downloadStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';

interface SongOptionsModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
}

interface OptionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  colors: ReturnType<typeof getThemeColors>;
}

const OptionItem: React.FC<OptionItemProps> = ({
  icon,
  label,
  onPress,
  destructive = false,
  colors,
}) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <Ionicons
      name={icon}
      size={22}
      color={destructive ? colors.error : colors.textSecondary}
    />
    <Text
      style={[styles.optionLabel, { color: colors.textPrimary }, destructive && { color: colors.error }]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const SongOptionsModal: React.FC<SongOptionsModalProps> = ({
  visible,
  song,
  onClose,
}) => {
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const COLORS = getThemeColors(isDarkMode);
  
  const { addToQueue, playNext } = useQueueStore();
  const { downloadSong, isDownloaded, removeDownload } = useDownloadStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { playlists, addSongToPlaylist, createPlaylist } = usePlaylistStore();

  if (!song) return null;

  const isLiked = isFavorite(song.id);
  const downloaded = isDownloaded(song.id);

  const handlePlayNext = () => {
    playNext(song);
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(song);
    onClose();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(song);
    onClose();
  };

  const handleAddToPlaylist = (playlist: Playlist) => {
    addSongToPlaylist(playlist.id, song);
    setShowPlaylistPicker(false);
    onClose();
  };

  const handleCreateAndAdd = () => {
    Alert.prompt(
      'New Playlist',
      'Enter playlist name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name) => {
            if (name?.trim()) {
              const playlist = createPlaylist(name.trim());
              addSongToPlaylist(playlist.id, song);
              setShowPlaylistPicker(false);
              onClose();
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDownload = async () => {
    if (downloaded) {
      await removeDownload(song.id);
    } else {
      await downloadSong(song);
    }
    onClose();
  };

  const handleShare = () => {
    // Implement share functionality
    onClose();
  };

  const handleDetails = () => {
    Alert.alert(
      'Song Details',
      `Title: ${song.name}\nArtist: ${song.artists?.primary?.[0]?.name || song.primaryArtists}\nAlbum: ${song.album?.name || 'Unknown'}\nYear: ${song.year || 'Unknown'}\nDuration: ${song.duration || 'Unknown'}s`,
      [{ text: 'OK' }]
    );
    onClose();
  };

  const renderPlaylistPicker = () => (
    <Modal
      visible={showPlaylistPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPlaylistPicker(false)}
    >
      <Pressable 
        style={[styles.overlay, { backgroundColor: COLORS.overlay }]} 
        onPress={() => setShowPlaylistPicker(false)}
      >
        <View style={[styles.playlistPickerContainer, { backgroundColor: COLORS.background }]}>
          <View style={[styles.modalHandle, { backgroundColor: COLORS.border }]} />
          <Text style={[styles.playlistPickerTitle, { color: COLORS.textPrimary }]}>Add to Playlist</Text>

          <ScrollView style={styles.playlistList}>
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={styles.playlistItem}
                onPress={() => handleAddToPlaylist(playlist)}
              >
                {playlist.coverImage ? (
                  <Image 
                    source={{ uri: playlist.coverImage }} 
                    style={styles.playlistImage} 
                  />
                ) : (
                  <View style={[styles.playlistImage, styles.playlistImagePlaceholder, { backgroundColor: COLORS.surface }]}>
                    <Ionicons name="musical-notes" size={20} color={COLORS.textTertiary} />
                  </View>
                )}
                <View style={styles.playlistInfo}>
                  <Text style={[styles.playlistName, { color: COLORS.textPrimary }]}>{playlist.name}</Text>
                  <Text style={[styles.playlistSongCount, { color: COLORS.textSecondary }]}>{playlist.songs.length} songs</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <>
      <Modal
        visible={visible && !showPlaylistPicker}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={[styles.overlay, { backgroundColor: COLORS.overlay }]} onPress={onClose}>
          <View style={[styles.container, { backgroundColor: COLORS.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: COLORS.border }]} />
            
            {/* Song Info Header */}
            <View style={styles.header}>
              <Image
                source={{ uri: song.image?.[1]?.url || song.image?.[0]?.url }}
                style={styles.songImage}
              />
              <View style={styles.songInfo}>
                <Text style={[styles.songTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
                  {song.name}
                </Text>
                <Text style={[styles.songArtist, { color: COLORS.textSecondary }]} numberOfLines={1}>
                  {song.artists?.primary?.[0]?.name || song.primaryArtists}
                </Text>
              </View>
              <TouchableOpacity onPress={handleToggleFavorite}>
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? COLORS.primary : COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: COLORS.border }]} />

            {/* Options */}
            <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
              <OptionItem
                icon="play-skip-forward-outline"
                label="Play Next"
                onPress={handlePlayNext}
                colors={COLORS}
              />
              <OptionItem
                icon="list-outline"
                label="Add to Playing Queue"
                onPress={handleAddToQueue}
                colors={COLORS}
              />
              <OptionItem
                icon="add-circle-outline"
                label="Add to Playlist"
                onPress={() => setShowPlaylistPicker(true)}
                colors={COLORS}
              />
              <OptionItem
                icon="disc-outline"
                label="Go to Album"
                onPress={() => {
                  // Navigate to album
                  onClose();
                }}
                colors={COLORS}
              />
              <OptionItem
                icon="person-outline"
                label="Go to Artist"
                onPress={() => {
                  // Navigate to artist
                  onClose();
                }}
                colors={COLORS}
              />
              <OptionItem
                icon="information-circle-outline"
                label="Details"
                onPress={handleDetails}
                colors={COLORS}
              />
              <OptionItem
                icon="call-outline"
                label="Set as Ringtone"
                onPress={() => {
                  Alert.alert('Info', 'Ringtone feature coming soon');
                  onClose();
                }}
                colors={COLORS}
              />
              <OptionItem
                icon="ban-outline"
                label="Add to Blacklist"
                onPress={() => {
                  Alert.alert('Info', 'Blacklist feature coming soon');
                  onClose();
                }}
                colors={COLORS}
              />
              <OptionItem
                icon="share-social-outline"
                label="Share"
                onPress={handleShare}
                colors={COLORS}
              />
              <OptionItem
                icon={downloaded ? "cloud-done-outline" : "cloud-download-outline"}
                label={downloaded ? "Remove Download" : "Download"}
                onPress={handleDownload}
                colors={COLORS}
              />
              <OptionItem
                icon="trash-outline"
                label="Delete from Device"
                onPress={() => {
                  if (downloaded) {
                    handleDownload();
                  } else {
                    Alert.alert('Info', 'Song is not downloaded');
                    onClose();
                  }
                }}
                destructive
                colors={COLORS}
              />
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {renderPlaylistPicker()}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    paddingBottom: SPACING.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  songImage: {
    width: 56,
    height: 56,
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
  songArtist: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: SPACING.lg,
  },
  options: {
    paddingHorizontal: SPACING.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  optionLabel: {
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.lg,
  },
  playlistPickerContainer: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '70%',
    paddingBottom: SPACING.xxl,
  },
  playlistPickerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  createPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  createPlaylistIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPlaylistText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    marginLeft: SPACING.md,
  },
  playlistList: {
    paddingHorizontal: SPACING.lg,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  playlistImage: {
    width: 48,
    height: 48,
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
  playlistName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  playlistSongCount: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
});

export default SongOptionsModal;
