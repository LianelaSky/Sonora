export type AudioFormat = 'FLAC' | 'ALAC' | 'WAV' | 'MP3' | 'AAC' | 'Hi-Res Lossless' | 'Lossless';

export interface AudioQuality {
  format: AudioFormat;
  sampleRate: number; // e.g. 96000, 192000, 44100
  bitDepth: number; // e.g. 24, 16
  bitrate: number; // in kbps, e.g. 2822, 1411, 320
  isHiResLossless: boolean;
  isLossless: boolean;
}

export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export interface TrackLyrics {
  type: 'synced' | 'plain';
  syncedLines?: SyncedLyricLine[];
  plainText?: string;
  source?: 'embedded' | 'lrc' | 'manual' | 'online';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  duration: number; // in seconds
  trackNumber?: number;
  discNumber?: number;
  year?: number;
  genre?: string;
  artworkUrl: string;
  accentColors?: [string, string, string]; // e.g. ['#fa2d48', '#5b132b', '#1a0b16'] for dynamic background
  audioSrc: string; // Blob URL or audio stream or synth generator ID
  fileName: string;
  filePath: string;
  fileSize: number; // in bytes
  audioQuality: AudioQuality;
  lyrics?: TrackLyrics;
  dateAdded: string; // ISO string
  lastPlayed?: string; // ISO string
  playCount: number;
  isFavorite: boolean;
  rating?: number; // 1-5
  folderId?: string; // ID of the local storage folder it belongs to
}

export type SmartRuleField = 
  | 'title'
  | 'artist'
  | 'album'
  | 'genre'
  | 'year'
  | 'playCount'
  | 'isFavorite'
  | 'isHiRes'
  | 'isLossless'
  | 'dateAdded';

export type SmartRuleOperator = 
  | 'contains'
  | 'doesNotContain'
  | 'equals'
  | 'greaterThan'
  | 'lessThan'
  | 'isTrue'
  | 'isFalse'
  | 'inLastDays';

export interface SmartRule {
  id: string;
  field: SmartRuleField;
  operator: SmartRuleOperator;
  value: string | number | boolean;
}

export interface SmartPlaylist {
  id: string;
  name: string;
  description: string;
  icon?: string;
  matchType: 'all' | 'any';
  rules: SmartRule[];
  limit?: number;
  sortBy: 'dateAdded' | 'playCount' | 'title' | 'artist' | 'year' | 'album';
  sortOrder: 'asc' | 'desc';
  isSmart: true;
  coverGradient?: [string, string];
}

export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  coverUrl?: string;
  coverGradient?: [string, string];
  createdAt: string;
  updatedAt: string;
  isSmart: false;
}

export interface LocalStorageFolder {
  id: string;
  name: string;
  path: string;
  trackCount: number;
  totalSize: number; // bytes
  lastSynced: string;
  status: 'synced' | 'syncing' | 'idle' | 'error';
  errorMessage?: string;
}

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: number[]; // 10 bands: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
}

export interface KeyboardShortcutConfig {
  id: string;
  action: string;
  label: string;
  defaultKey: string;
  currentKey: string;
  requiresCtrl: boolean;
  requiresShift: boolean;
  requiresAlt: boolean;
}

export type LibraryViewMode = 
  | 'listen-now'
  | 'recently-added'
  | 'artists'
  | 'albums'
  | 'songs'
  | 'genres'
  | 'folders'
  | 'playlist'
  | 'smart-playlist'
  | 'search';
