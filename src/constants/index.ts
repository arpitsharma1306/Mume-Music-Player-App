// API Configuration
export const API_BASE_URL = 'https://saavn.sumit.co';

// Colors - Modern Dark Music Player Theme
export const COLORS = {
  // Primary colors
  primary: '#E91E63',
  primaryLight: '#FF4081',
  primaryDark: '#C2185B',
  
  // Accent colors
  accent: '#00BCD4',
  accentLight: '#4DD0E1',
  
  // Background colors
  background: '#0D0D0D',
  backgroundSecondary: '#1A1A1A',
  backgroundTertiary: '#252525',
  cardBackground: '#1E1E1E',
  
  // Surface colors
  surface: '#2A2A2A',
  surfaceLight: '#3A3A3A',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#666666',
  textMuted: '#808080',
  
  // Gradient colors
  gradientStart: '#E91E63',
  gradientMiddle: '#9C27B0',
  gradientEnd: '#673AB7',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Player specific
  progressBackground: '#333333',
  progressFill: '#E91E63',
  seekBarThumb: '#FFFFFF',
  
  // Misc
  border: '#333333',
  divider: '#2A2A2A',
  overlay: 'rgba(0, 0, 0, 0.7)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Font sizes
export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

// Font weights
export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// Screen dimensions reference
export const MINI_PLAYER_HEIGHT = 70;
export const TAB_BAR_HEIGHT = 60;
export const HEADER_HEIGHT = 56;

// API Limits
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_SEARCH_RESULTS = 50;

// Storage keys
export const STORAGE_KEYS = {
  QUEUE: '@mume_queue',
  PLAYER_STATE: '@mume_player_state',
  DOWNLOADED_SONGS: '@mume_downloads',
  RECENT_SEARCHES: '@mume_recent_searches',
  FAVORITES: '@mume_favorites',
  SETTINGS: '@mume_settings',
};

// Audio quality options
export const AUDIO_QUALITY = {
  LOW: '96kbps',
  MEDIUM: '160kbps',
  HIGH: '320kbps',
};

// Default values
export const DEFAULT_AUDIO_QUALITY = AUDIO_QUALITY.HIGH;
