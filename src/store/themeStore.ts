import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },
      
      setDarkMode: (value: boolean) => {
        set({ isDarkMode: value });
      },
    }),
    {
      name: '@mume_theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Light theme colors
export const LIGHT_COLORS = {
  // Primary colors (Orange)
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  
  // Accent colors
  accent: '#F97316',
  accentLight: '#FDBA74',
  
  // Background colors (Light)
  background: '#FFFFFF',
  backgroundSecondary: '#F8F8F8',
  backgroundTertiary: '#F3F4F6',
  cardBackground: '#FFFFFF',
  
  // Surface colors
  surface: '#F9FAFB',
  surfaceLight: '#FFFFFF',
  
  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textMuted: '#D1D5DB',
  
  // Gradient colors
  gradientStart: '#F97316',
  gradientMiddle: '#FB923C',
  gradientEnd: '#FDBA74',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Player specific
  progressBackground: '#E5E7EB',
  progressFill: '#F97316',
  seekBarThumb: '#F97316',
  
  // Misc
  border: '#E5E7EB',
  divider: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  
  // Tab colors
  tabActive: '#F97316',
  tabInactive: '#9CA3AF',
};

// Dark theme colors
export const DARK_COLORS = {
  // Primary colors (Orange)
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  
  // Accent colors
  accent: '#F97316',
  accentLight: '#FDBA74',
  
  // Background colors (Dark)
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2D2D2D',
  cardBackground: '#1E1E1E',
  
  // Surface colors
  surface: '#1E1E1E',
  surfaceLight: '#2D2D2D',
  
  // Text colors
  textPrimary: '#F9FAFB',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textMuted: '#52525B',
  
  // Gradient colors
  gradientStart: '#F97316',
  gradientMiddle: '#FB923C',
  gradientEnd: '#FDBA74',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Player specific
  progressBackground: '#3F3F46',
  progressFill: '#F97316',
  seekBarThumb: '#F97316',
  
  // Misc
  border: '#3F3F46',
  divider: '#27272A',
  overlay: 'rgba(0, 0, 0, 0.7)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  
  // Tab colors
  tabActive: '#F97316',
  tabInactive: '#71717A',
};

// Helper hook to get current theme colors
export const getThemeColors = (isDarkMode: boolean) => {
  return isDarkMode ? DARK_COLORS : LIGHT_COLORS;
};
