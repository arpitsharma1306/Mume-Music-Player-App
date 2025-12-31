// API Configuration
export const API_BASE_URL = 'https://saavn.sumit.co';

// Colors - Light Theme with Orange Accents (Mume Design)
export const COLORS = {
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
export const DEFAULT_PAGE_LIMIT = 100;
export const MAX_SEARCH_RESULTS = 100;

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
