import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';
import { STORAGE_KEYS } from '../constants';

interface QueueState {
  queue: Song[];
  originalQueue: Song[];
  currentIndex: number;
  
  // Actions
  addToQueue: (song: Song) => void;
  addMultipleToQueue: (songs: Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  setCurrentIndex: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  shuffleQueue: () => void;
  restoreOriginalQueue: () => void;
  getNextSong: () => Song | null;
  getPreviousSong: () => Song | null;
  playFromQueue: (index: number) => Song | null;
  playNext: (song: Song) => void;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      originalQueue: [],
      currentIndex: -1,

      // Add single song to queue
      addToQueue: (song: Song) => {
        const { queue, originalQueue } = get();
        
        // Check if song already exists in queue
        const existingIndex = queue.findIndex(s => s.id === song.id);
        if (existingIndex !== -1) {
          set({ currentIndex: existingIndex });
          return;
        }
        
        set({
          queue: [...queue, song],
          originalQueue: [...originalQueue, song],
        });
      },

      // Add multiple songs to queue
      addMultipleToQueue: (songs: Song[]) => {
        const { queue, originalQueue } = get();
        
        // Filter out duplicates
        const newSongs = songs.filter(
          song => !queue.some(s => s.id === song.id)
        );
        
        set({
          queue: [...queue, ...newSongs],
          originalQueue: [...originalQueue, ...newSongs],
        });
      },

      // Remove song from queue
      removeFromQueue: (index: number) => {
        const { queue, originalQueue, currentIndex } = get();
        
        if (index < 0 || index >= queue.length) return;
        
        const newQueue = [...queue];
        newQueue.splice(index, 1);
        
        const newOriginalQueue = [...originalQueue];
        const songToRemove = queue[index];
        const originalIndex = newOriginalQueue.findIndex(s => s.id === songToRemove.id);
        if (originalIndex !== -1) {
          newOriginalQueue.splice(originalIndex, 1);
        }
        
        // Adjust current index if needed
        let newCurrentIndex = currentIndex;
        if (index < currentIndex) {
          newCurrentIndex = currentIndex - 1;
        } else if (index === currentIndex && currentIndex >= newQueue.length) {
          newCurrentIndex = newQueue.length - 1;
        }
        
        set({
          queue: newQueue,
          originalQueue: newOriginalQueue,
          currentIndex: newCurrentIndex,
        });
      },

      // Clear entire queue
      clearQueue: () => {
        set({
          queue: [],
          originalQueue: [],
          currentIndex: -1,
        });
      },

      // Set entire queue
      setQueue: (songs: Song[], startIndex: number = 0) => {
        set({
          queue: songs,
          originalQueue: [...songs],
          currentIndex: startIndex,
        });
      },

      // Set current index
      setCurrentIndex: (index: number) => {
        set({ currentIndex: index });
      },

      // Reorder queue (drag and drop)
      reorderQueue: (fromIndex: number, toIndex: number) => {
        const { queue, currentIndex } = get();
        
        if (fromIndex < 0 || fromIndex >= queue.length) return;
        if (toIndex < 0 || toIndex >= queue.length) return;
        
        const newQueue = [...queue];
        const [movedItem] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, movedItem);
        
        // Adjust current index
        let newCurrentIndex = currentIndex;
        if (fromIndex === currentIndex) {
          newCurrentIndex = toIndex;
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          newCurrentIndex = currentIndex - 1;
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          newCurrentIndex = currentIndex + 1;
        }
        
        set({ queue: newQueue, currentIndex: newCurrentIndex });
      },

      // Shuffle queue
      shuffleQueue: () => {
        const { queue, currentIndex } = get();
        
        if (queue.length <= 1) return;
        
        // Keep current song at its position
        const currentSong = queue[currentIndex];
        const otherSongs = queue.filter((_, i) => i !== currentIndex);
        
        // Fisher-Yates shuffle
        for (let i = otherSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
        }
        
        // Put current song at the beginning
        const shuffledQueue = [currentSong, ...otherSongs];
        
        set({
          queue: shuffledQueue,
          currentIndex: 0,
        });
      },

      // Restore original queue order
      restoreOriginalQueue: () => {
        const { originalQueue, queue, currentIndex } = get();
        const currentSong = queue[currentIndex];
        
        // Find the current song's position in original queue
        const newIndex = originalQueue.findIndex(s => s.id === currentSong?.id);
        
        set({
          queue: [...originalQueue],
          currentIndex: newIndex >= 0 ? newIndex : 0,
        });
      },

      // Get next song in queue
      getNextSong: () => {
        const { queue, currentIndex } = get();
        
        if (currentIndex < queue.length - 1) {
          return queue[currentIndex + 1];
        }
        
        return null;
      },

      // Get previous song in queue
      getPreviousSong: () => {
        const { queue, currentIndex } = get();
        
        if (currentIndex > 0) {
          return queue[currentIndex - 1];
        }
        
        return null;
      },

      // Play song from queue at specific index
      playFromQueue: (index: number) => {
        const { queue } = get();
        
        if (index < 0 || index >= queue.length) return null;
        
        set({ currentIndex: index });
        return queue[index];
      },

      // Play a song next (insert after current song)
      playNext: (song: Song) => {
        const { queue, originalQueue, currentIndex } = get();
        
        // Check if song already exists in queue
        const existingIndex = queue.findIndex(s => s.id === song.id);
        if (existingIndex !== -1) {
          // Remove from current position
          const newQueue = [...queue];
          newQueue.splice(existingIndex, 1);
          
          // Insert after current song
          const insertIndex = existingIndex < currentIndex ? currentIndex : currentIndex + 1;
          newQueue.splice(insertIndex, 0, song);
          
          set({ queue: newQueue });
          return;
        }
        
        // Insert song after current index
        const newQueue = [...queue];
        const insertIndex = currentIndex + 1;
        newQueue.splice(insertIndex, 0, song);
        
        set({
          queue: newQueue,
          originalQueue: [...originalQueue, song],
        });
      },
    }),
    {
      name: STORAGE_KEYS.QUEUE,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        queue: state.queue,
        originalQueue: state.originalQueue,
        currentIndex: state.currentIndex,
      }),
    }
  )
);
