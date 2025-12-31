import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

interface RecentlyPlayedState {
  recentlyPlayed: Song[];
  addToRecentlyPlayed: (song: Song) => void;
  clearRecentlyPlayed: () => void;
}

const MAX_RECENTLY_PLAYED = 5;

export const useRecentlyPlayedStore = create<RecentlyPlayedState>()(
  persist(
    (set, get) => ({
      recentlyPlayed: [],
      
      addToRecentlyPlayed: (song: Song) => {
        const { recentlyPlayed } = get();
        
        // Remove the song if it already exists
        const filtered = recentlyPlayed.filter(s => s.id !== song.id);
        
        // Add the song to the beginning
        const updated = [song, ...filtered].slice(0, MAX_RECENTLY_PLAYED);
        
        set({ recentlyPlayed: updated });
      },
      
      clearRecentlyPlayed: () => {
        set({ recentlyPlayed: [] });
      },
    }),
    {
      name: '@mume_recently_played',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
