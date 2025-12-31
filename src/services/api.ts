import axios from 'axios';
import { API_BASE_URL, DEFAULT_PAGE_LIMIT } from '../constants';
import { 
  Song, 
  SearchResult, 
  GlobalSearchResult, 
  AlbumResult, 
  ArtistResult,
  PlaylistResult 
} from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Search APIs
export const searchSongs = async (
  query: string, 
  page: number = 0, 
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<SearchResult> => {
  const response = await api.get('/api/search/songs', {
    params: { query, page, limit },
  });
  return response.data;
};

export const searchAlbums = async (
  query: string,
  page: number = 0,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<{ success: boolean; data: { total: number; results: AlbumResult[] } }> => {
  const response = await api.get('/api/search/albums', {
    params: { query, page, limit },
  });
  return response.data;
};

export const searchArtists = async (
  query: string,
  page: number = 0,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<{ success: boolean; data: { total: number; results: ArtistResult[] } }> => {
  const response = await api.get('/api/search/artists', {
    params: { query, page, limit },
  });
  return response.data;
};

export const searchPlaylists = async (
  query: string,
  page: number = 0,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<{ success: boolean; data: { total: number; results: PlaylistResult[] } }> => {
  const response = await api.get('/api/search/playlists', {
    params: { query, page, limit },
  });
  return response.data;
};

export const globalSearch = async (query: string): Promise<GlobalSearchResult> => {
  const response = await api.get('/api/search', {
    params: { query },
  });
  return response.data;
};

// Songs APIs
export const getSongById = async (id: string): Promise<{ success: boolean; data: Song[] }> => {
  const response = await api.get(`/api/songs/${id}`);
  return response.data;
};

export const getSongSuggestions = async (
  id: string
): Promise<{ success: boolean; data: Song[] }> => {
  const response = await api.get(`/api/songs/${id}/suggestions`);
  return response.data;
};

export const getSongsByIds = async (
  ids: string[]
): Promise<{ success: boolean; data: Song[] }> => {
  const response = await api.get('/api/songs', {
    params: { ids: ids.join(',') },
  });
  return response.data;
};

// Artists APIs
export const getArtistById = async (
  id: string
): Promise<{ success: boolean; data: ArtistResult }> => {
  const response = await api.get(`/api/artists/${id}`);
  return response.data;
};

export const getArtistSongs = async (
  id: string,
  page: number = 0,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<{ success: boolean; data: { total: number; results: Song[] } }> => {
  const response = await api.get(`/api/artists/${id}/songs`, {
    params: { page, limit },
  });
  return response.data;
};

export const getArtistAlbums = async (
  id: string,
  page: number = 0,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<{ success: boolean; data: { total: number; results: AlbumResult[] } }> => {
  const response = await api.get(`/api/artists/${id}/albums`, {
    params: { page, limit },
  });
  return response.data;
};

// Albums API
export const getAlbumById = async (
  id: string
): Promise<{ success: boolean; data: AlbumResult & { songs: Song[] } }> => {
  const response = await api.get(`/api/albums`, {
    params: { id },
  });
  return response.data;
};

// Playlist API
export const getPlaylistById = async (
  id: string
): Promise<{ success: boolean; data: PlaylistResult & { songs: Song[] } }> => {
  const response = await api.get(`/api/playlists`, {
    params: { id },
  });
  return response.data;
};

// Helper to get the best quality image URL
export const getBestImageUrl = (images: { quality: string; url?: string; link?: string }[]): string => {
  if (!images || images.length === 0) {
    return 'https://via.placeholder.com/500x500?text=No+Image';
  }
  
  // Priority order for image quality
  const qualityOrder = ['500x500', '150x150', '50x50'];
  
  for (const quality of qualityOrder) {
    const image = images.find(img => img.quality === quality);
    if (image) {
      return image.url || image.link || '';
    }
  }
  
  // Return the last image if no preferred quality found
  const lastImage = images[images.length - 1];
  return lastImage.url || lastImage.link || '';
};

// Helper to get the best quality download URL
export const getBestDownloadUrl = (
  downloadUrls: { quality: string; url?: string; link?: string }[],
  preferredQuality: string = '320kbps'
): string => {
  if (!downloadUrls || downloadUrls.length === 0) {
    return '';
  }
  
  // Priority order for download quality
  const qualityOrder = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
  
  // Try to get preferred quality first
  const preferred = downloadUrls.find(d => d.quality === preferredQuality);
  if (preferred) {
    return preferred.url || preferred.link || '';
  }
  
  // Otherwise, get the best available
  for (const quality of qualityOrder) {
    const download = downloadUrls.find(d => d.quality === quality);
    if (download) {
      return download.url || download.link || '';
    }
  }
  
  // Return the last download URL if no preferred quality found
  const lastDownload = downloadUrls[downloadUrls.length - 1];
  return lastDownload.url || lastDownload.link || '';
};

// Helper to format duration from seconds
export const formatDuration = (seconds: number | string | null | undefined): string => {
  if (!seconds) return '0:00';
  
  const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  
  if (isNaN(totalSeconds)) return '0:00';
  
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Helper to get artist names from song
export const getArtistNames = (song: Song): string => {
  if (song.primaryArtists) {
    return song.primaryArtists;
  }
  
  if (song.artists?.primary) {
    return song.artists.primary.map(a => a.name).join(', ');
  }
  
  return 'Unknown Artist';
};

export default api;
