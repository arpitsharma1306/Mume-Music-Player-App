import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, Song } from '../types';

interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  getPlaylist: (playlistId: string) => Playlist | undefined;
  isSongInPlaylist: (playlistId: string, songId: string) => boolean;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],

      createPlaylist: (name: string) => {
        const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name,
          songs: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(state => ({ playlists: [...state.playlists, newPlaylist] }));
        return newPlaylist;
      },

      deletePlaylist: (playlistId: string) => {
        set(state => ({
          playlists: state.playlists.filter(p => p.id !== playlistId),
        }));
      },

      renamePlaylist: (playlistId: string, newName: string) => {
        set(state => ({
          playlists: state.playlists.map(p =>
            p.id === playlistId
              ? { ...p, name: newName, updatedAt: Date.now() }
              : p
          ),
        }));
      },

      addSongToPlaylist: (playlistId: string, song: Song) => {
        set(state => ({
          playlists: state.playlists.map(p => {
            if (p.id === playlistId) {
              if (p.songs.find(s => s.id === song.id)) {
                return p;
              }
              return {
                ...p,
                songs: [...p.songs, song],
                updatedAt: Date.now(),
                coverImage: p.coverImage || (song.image?.[2]?.url || song.image?.[1]?.url),
              };
            }
            return p;
          }),
        }));
      },

      removeSongFromPlaylist: (playlistId: string, songId: string) => {
        set(state => ({
          playlists: state.playlists.map(p => {
            if (p.id === playlistId) {
              const newSongs = p.songs.filter(s => s.id !== songId);
              return {
                ...p,
                songs: newSongs,
                updatedAt: Date.now(),
                coverImage: newSongs[0]?.image?.[2]?.url || newSongs[0]?.image?.[1]?.url,
              };
            }
            return p;
          }),
        }));
      },

      getPlaylist: (playlistId: string) => {
        return get().playlists.find(p => p.id === playlistId);
      },

      isSongInPlaylist: (playlistId: string, songId: string) => {
        const playlist = get().playlists.find(p => p.id === playlistId);
        return playlist?.songs.some(s => s.id === songId) || false;
      },
    }),
    {
      name: 'playlists-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
