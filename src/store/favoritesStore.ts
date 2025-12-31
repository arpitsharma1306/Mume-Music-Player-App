import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

interface FavoritesState {
  favorites: Song[];
  addToFavorites: (song: Song) => void;
  removeFromFavorites: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  toggleFavorite: (song: Song) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addToFavorites: (song: Song) => {
        const { favorites } = get();
        if (!favorites.find(s => s.id === song.id)) {
          set({ favorites: [...favorites, song] });
        }
      },

      removeFromFavorites: (songId: string) => {
        const { favorites } = get();
        set({ favorites: favorites.filter(s => s.id !== songId) });
      },

      isFavorite: (songId: string) => {
        const { favorites } = get();
        return favorites.some(s => s.id === songId);
      },

      toggleFavorite: (song: Song) => {
        const { isFavorite, addToFavorites, removeFromFavorites } = get();
        if (isFavorite(song.id)) {
          removeFromFavorites(song.id);
        } else {
          addToFavorites(song);
        }
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
