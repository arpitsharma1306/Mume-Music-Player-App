import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { useQueueStore, useDownloadStore } from '../store';

interface SongOptionsModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onPlayNext?: () => void;
  onAddToQueue?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

interface OptionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

const OptionItem: React.FC<OptionItemProps> = ({
  icon,
  label,
  onPress,
  destructive = false,
}) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <Ionicons
      name={icon}
      size={24}
      color={destructive ? COLORS.error : COLORS.textPrimary}
    />
    <Text
      style={[styles.optionLabel, destructive && styles.destructiveLabel]}
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
  const { addToQueue, queue } = useQueueStore();
  const { downloadSong, isDownloaded, removeDownload, getDownloadProgress } = useDownloadStore();

  if (!song) return null;

  const isInQueue = queue.some((s) => s.id === song.id);
  const downloaded = isDownloaded(song.id);
  const downloadProgress = getDownloadProgress(song.id);

  const handleAddToQueue = () => {
    addToQueue(song);
    onClose();
  };

  const handleDownload = async () => {
    if (downloaded) {
      await removeDownload(song.id);
    } else {
      await downloadSong(song);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {song.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.options}>
            <OptionItem
              icon={isInQueue ? 'checkmark-circle' : 'add-circle-outline'}
              label={isInQueue ? 'Already in Queue' : 'Add to Queue'}
              onPress={handleAddToQueue}
            />
            
            <OptionItem
              icon={downloaded ? 'cloud-done' : 'cloud-download-outline'}
              label={
                downloadProgress?.status === 'downloading'
                  ? `Downloading... ${Math.round(downloadProgress.progress * 100)}%`
                  : downloaded
                  ? 'Remove Download'
                  : 'Download'
              }
              onPress={handleDownload}
            />

            <OptionItem
              icon="share-outline"
              label="Share"
              onPress={onClose}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.backgroundSecondary,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  options: {
    paddingTop: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  optionLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  destructiveLabel: {
    color: COLORS.error,
  },
});

export default SongOptionsModal;
