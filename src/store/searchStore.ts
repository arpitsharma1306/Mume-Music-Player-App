import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';
import { STORAGE_KEYS } from '../constants';

interface SearchState {
  recentSearches: string[];
  searchResults: Song[];
  isSearching: boolean;
  searchQuery: string;
  
  // Actions
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSearchResults: (results: Song[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearSearchResults: () => void;
}

const MAX_RECENT_SEARCHES = 10;

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      searchResults: [],
      isSearching: false,
      searchQuery: '',

      // Add to recent searches
      addRecentSearch: (query: string) => {
        const { recentSearches } = get();
        const trimmedQuery = query.trim().toLowerCase();
        
        if (!trimmedQuery) return;
        
        // Remove if already exists
        const filtered = recentSearches.filter(
          s => s.toLowerCase() !== trimmedQuery
        );
        
        // Add to beginning and limit
        const updated = [query.trim(), ...filtered].slice(0, MAX_RECENT_SEARCHES);
        
        set({ recentSearches: updated });
      },

      // Remove from recent searches
      removeRecentSearch: (query: string) => {
        const { recentSearches } = get();
        set({
          recentSearches: recentSearches.filter(
            s => s.toLowerCase() !== query.toLowerCase()
          ),
        });
      },

      // Clear all recent searches
      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      // Set search results
      setSearchResults: (results: Song[]) => {
        set({ searchResults: results });
      },

      // Set searching state
      setIsSearching: (isSearching: boolean) => {
        set({ isSearching });
      },

      // Set search query
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // Clear search results
      clearSearchResults: () => {
        set({ searchResults: [], searchQuery: '' });
      },
    }),
    {
      name: STORAGE_KEYS.RECENT_SEARCHES,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);
