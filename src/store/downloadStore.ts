import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Song, DownloadedSong, DownloadProgress } from '../types';
import { getBestDownloadUrl } from '../services/api';
import { STORAGE_KEYS } from '../constants';

interface DownloadState {
  downloadedSongs: DownloadedSong[];
  downloadProgress: { [key: string]: DownloadProgress };
  
  // Actions
  downloadSong: (song: Song) => Promise<void>;
  removeDownload: (songId: string) => Promise<void>;
  isDownloaded: (songId: string) => boolean;
  getLocalPath: (songId: string) => string | null;
  getDownloadProgress: (songId: string) => DownloadProgress | null;
  clearAllDownloads: () => Promise<void>;
}

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

// Ensure download directory exists
const ensureDownloadDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
};

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      downloadedSongs: [],
      downloadProgress: {},

      // Download a song
      downloadSong: async (song: Song) => {
        const { downloadedSongs, downloadProgress } = get();
        
        // Check if already downloaded
        if (downloadedSongs.some(s => s.id === song.id)) {
          console.log('Song already downloaded');
          return;
        }
        
        // Check if already downloading
        if (downloadProgress[song.id]?.status === 'downloading') {
          console.log('Song already downloading');
          return;
        }

        try {
          await ensureDownloadDir();
          
          const downloadUrl = getBestDownloadUrl(song.downloadUrl);
          if (!downloadUrl) {
            throw new Error('No download URL available');
          }

          // Set initial progress
          set({
            downloadProgress: {
              ...get().downloadProgress,
              [song.id]: { songId: song.id, progress: 0, status: 'downloading' },
            },
          });

          const localPath = `${DOWNLOAD_DIR}${song.id}.mp4`;

          // Download the file
          const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            localPath,
            {},
            (downloadProgress) => {
              const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
              set({
                downloadProgress: {
                  ...get().downloadProgress,
                  [song.id]: { songId: song.id, progress, status: 'downloading' },
                },
              });
            }
          );

          const result = await downloadResumable.downloadAsync();
          
          if (result?.uri) {
            const downloadedSong: DownloadedSong = {
              ...song,
              localPath: result.uri,
              downloadedAt: Date.now(),
            };

            set({
              downloadedSongs: [...get().downloadedSongs, downloadedSong],
              downloadProgress: {
                ...get().downloadProgress,
                [song.id]: { songId: song.id, progress: 1, status: 'completed' },
              },
            });
          }
        } catch (error) {
          console.error('Download error:', error);
          set({
            downloadProgress: {
              ...get().downloadProgress,
              [song.id]: { songId: song.id, progress: 0, status: 'failed' },
            },
          });
        }
      },

      // Remove a downloaded song
      removeDownload: async (songId: string) => {
        const { downloadedSongs } = get();
        const song = downloadedSongs.find(s => s.id === songId);
        
        if (song?.localPath) {
          try {
            await FileSystem.deleteAsync(song.localPath, { idempotent: true });
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        }

        set({
          downloadedSongs: downloadedSongs.filter(s => s.id !== songId),
          downloadProgress: {
            ...get().downloadProgress,
            [songId]: undefined as any,
          },
        });
      },

      // Check if song is downloaded
      isDownloaded: (songId: string) => {
        return get().downloadedSongs.some(s => s.id === songId);
      },

      // Get local path for downloaded song
      getLocalPath: (songId: string) => {
        const song = get().downloadedSongs.find(s => s.id === songId);
        return song?.localPath || null;
      },

      // Get download progress for a song
      getDownloadProgress: (songId: string) => {
        return get().downloadProgress[songId] || null;
      },

      // Clear all downloads
      clearAllDownloads: async () => {
        const { downloadedSongs } = get();
        
        for (const song of downloadedSongs) {
          if (song.localPath) {
            try {
              await FileSystem.deleteAsync(song.localPath, { idempotent: true });
            } catch (error) {
              console.error('Error deleting file:', error);
            }
          }
        }

        set({
          downloadedSongs: [],
          downloadProgress: {},
        });
      },
    }),
    {
      name: STORAGE_KEYS.DOWNLOADED_SONGS,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        downloadedSongs: state.downloadedSongs,
      }),
    }
  )
);
