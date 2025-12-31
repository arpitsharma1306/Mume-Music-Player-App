import { create } from 'zustand';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song, RepeatMode } from '../types';
import { getBestDownloadUrl, getBestImageUrl } from '../services/api';
import { useQueueStore } from './queueStore';

interface PlayerState {
  // Current song state
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  
  // Progress
  progress: number;
  duration: number;
  position: number;
  
  // Player modes
  repeatMode: RepeatMode;
  isShuffled: boolean;
  
  // Audio object
  sound: Audio.Sound | null;
  
  // Actions
  playSong: (song: Song, addToQueue?: boolean) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setProgress: (progress: number, position: number, duration: number) => void;
  cleanup: () => Promise<void>;
}

// Configure audio mode for background playback
const configureAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.error('Error configuring audio mode:', error);
  }
};

// Initialize audio configuration
configureAudio();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial state
  currentSong: null,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  position: 0,
  repeatMode: 'off',
  isShuffled: false,
  sound: null,

  // Play a song
  playSong: async (song: Song, addToQueue = true) => {
    const { sound: currentSound, cleanup } = get();
    
    // Cleanup previous sound
    if (currentSound) {
      await cleanup();
    }

    set({ isLoading: true, currentSong: song });

    try {
      const downloadUrl = getBestDownloadUrl(song.downloadUrl);
      
      if (!downloadUrl) {
        throw new Error('No download URL available');
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: downloadUrl },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            const duration = status.durationMillis || 0;
            const position = status.positionMillis || 0;
            const progress = duration > 0 ? position / duration : 0;
            
            set({
              duration: duration / 1000,
              position: position / 1000,
              progress,
              isPlaying: status.isPlaying,
            });

            // Handle song completion
            if (status.didJustFinish) {
              get().playNext();
            }
          }
        }
      );

      set({ sound: newSound, isLoading: false, isPlaying: true });

      // Add to queue if needed
      if (addToQueue) {
        const queueStore = useQueueStore.getState();
        queueStore.addToQueue(song);
        queueStore.setCurrentIndex(queueStore.queue.length - 1);
      }

    } catch (error) {
      console.error('Error playing song:', error);
      set({ isLoading: false, isPlaying: false });
    }
  },

  // Toggle play/pause
  togglePlayPause: async () => {
    const { sound, isPlaying } = get();
    
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        set({ isPlaying: false });
      } else {
        await sound.playAsync();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  },

  // Pause
  pause: async () => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.pauseAsync();
        set({ isPlaying: false });
      } catch (error) {
        console.error('Error pausing:', error);
      }
    }
  },

  // Resume
  resume: async () => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.playAsync();
        set({ isPlaying: true });
      } catch (error) {
        console.error('Error resuming:', error);
      }
    }
  },

  // Stop
  stop: async () => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.stopAsync();
        set({ isPlaying: false, progress: 0, position: 0 });
      } catch (error) {
        console.error('Error stopping:', error);
      }
    }
  },

  // Seek to position
  seekTo: async (position: number) => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.setPositionAsync(position * 1000);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  },

  // Play next song
  playNext: async () => {
    const { repeatMode, currentSong, playSong } = get();
    const queueStore = useQueueStore.getState();
    
    // If repeat one, replay current song
    if (repeatMode === 'one' && currentSong) {
      await playSong(currentSong, false);
      return;
    }

    const nextSong = queueStore.getNextSong();
    
    if (nextSong) {
      queueStore.setCurrentIndex(queueStore.currentIndex + 1);
      await playSong(nextSong, false);
    } else if (repeatMode === 'all' && queueStore.queue.length > 0) {
      // Loop back to start
      queueStore.setCurrentIndex(0);
      await playSong(queueStore.queue[0], false);
    }
  },

  // Play previous song
  playPrevious: async () => {
    const { position, playSong, currentSong } = get();
    const queueStore = useQueueStore.getState();

    // If more than 3 seconds into song, restart it
    if (position > 3 && currentSong) {
      await playSong(currentSong, false);
      return;
    }

    const previousSong = queueStore.getPreviousSong();
    
    if (previousSong) {
      queueStore.setCurrentIndex(queueStore.currentIndex - 1);
      await playSong(previousSong, false);
    }
  },

  // Toggle repeat mode
  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  // Toggle shuffle
  toggleShuffle: () => {
    const { isShuffled } = get();
    const queueStore = useQueueStore.getState();
    
    if (!isShuffled) {
      queueStore.shuffleQueue();
    } else {
      queueStore.restoreOriginalQueue();
    }
    
    set({ isShuffled: !isShuffled });
  },

  // Set progress (called from playback status update)
  setProgress: (progress: number, position: number, duration: number) => {
    set({ progress, position, duration });
  },

  // Cleanup sound object
  cleanup: async () => {
    const { sound } = get();
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error cleaning up sound:', error);
      }
    }
    set({ sound: null });
  },
}));
