// Song related types
export interface ImageQuality {
  quality: string;
  url: string;
  link?: string;
}

export interface DownloadUrl {
  quality: string;
  url: string;
  link?: string;
}

export interface Album {
  id: string;
  name: string;
  url?: string;
}

export interface Artist {
  id: string;
  name: string;
  role?: string;
  type?: string;
  image?: ImageQuality[];
  url?: string;
}

export interface ArtistDetails {
  primary: Artist[];
  featured: Artist[];
  all: Artist[];
}

export interface Song {
  id: string;
  name: string;
  type?: string;
  year?: string | null;
  releaseDate?: string | null;
  duration?: number | string | null;
  label?: string | null;
  explicitContent?: boolean | number;
  playCount?: string | null;
  language?: string;
  hasLyrics?: boolean | string;
  lyricsId?: string | null;
  url?: string;
  copyright?: string | null;
  album?: Album;
  artists?: ArtistDetails;
  primaryArtists?: string;
  image: ImageQuality[];
  downloadUrl: DownloadUrl[];
}

export interface SearchResult {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Song[];
  };
}

export interface GlobalSearchResult {
  success: boolean;
  data: {
    songs: {
      results: Song[];
      position: number;
    };
    albums: {
      results: AlbumResult[];
      position: number;
    };
    artists: {
      results: ArtistResult[];
      position: number;
    };
    playlists: {
      results: PlaylistResult[];
      position: number;
    };
  };
}

export interface AlbumResult {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  year?: string | null;
  type?: string;
  playCount?: number | null;
  language?: string;
  explicitContent?: boolean;
  artists?: ArtistDetails;
  url?: string;
  image: ImageQuality[];
}

export interface ArtistResult {
  id: string;
  name?: string;
  title?: string;
  role?: string;
  type?: string;
  description?: string;
  image: ImageQuality[];
  url?: string;
}

export interface PlaylistResult {
  id: string;
  name?: string;
  title?: string;
  type?: string;
  image: ImageQuality[];
  url?: string;
  songCount?: number | null;
  language?: string;
  explicitContent?: boolean;
}

// Player related types
export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
}

export interface QueueState {
  queue: Song[];
  originalQueue: Song[];
  currentIndex: number;
  history: Song[];
}

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  Player: { song?: Song };
  Queue: undefined;
  Search: undefined;
  ArtistDetails: { artistId: string };
  AlbumDetails: { albumId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
};

// Download types
export interface DownloadedSong extends Song {
  localPath: string;
  downloadedAt: number;
}

export interface DownloadProgress {
  songId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}
