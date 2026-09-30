import { Track, SmartPlaylist, UserPlaylist, LocalStorageFolder, EqualizerPreset, KeyboardShortcutConfig } from '../types/music';
import { generateProceduralArtwork } from './metadataService';

export const DEFAULT_SMART_PLAYLISTS: SmartPlaylist[] = [
  {
    id: 'smart-hires',
    name: 'Hi-Res Lossless Masters',
    description: 'Tracks rendered in studio master grade 24-bit / 96kHz and 192kHz ALAC & FLAC audio.',
    icon: 'Sparkles',
    matchType: 'all',
    rules: [
      { id: 'r1', field: 'isHiRes', operator: 'isTrue', value: true }
    ],
    sortBy: 'dateAdded',
    sortOrder: 'desc',
    isSmart: true,
    coverGradient: ['#fa2d48', '#881337']
  },
  {
    id: 'smart-favorites',
    name: 'Loved Tracks',
    description: 'All your favorite songs across your local library.',
    icon: 'Heart',
    matchType: 'all',
    rules: [
      { id: 'r2', field: 'isFavorite', operator: 'isTrue', value: true }
    ],
    sortBy: 'playCount',
    sortOrder: 'desc',
    isSmart: true,
    coverGradient: ['#e11d48', '#4c0519']
  },
  {
    id: 'smart-top25',
    name: 'Top 25 Most Played',
    description: 'Your heaviest rotation tracks based on local listening telemetry.',
    icon: 'Flame',
    matchType: 'all',
    rules: [
      { id: 'r3', field: 'playCount', operator: 'greaterThan', value: 0 }
    ],
    limit: 25,
    sortBy: 'playCount',
    sortOrder: 'desc',
    isSmart: true,
    coverGradient: ['#f97316', '#7c2d12']
  },
  {
    id: 'smart-recent',
    name: 'Recently Added Lossless',
    description: 'Newly scanned local folder albums and imported audio collections.',
    icon: 'Clock',
    matchType: 'all',
    rules: [
      { id: 'r4', field: 'isLossless', operator: 'isTrue', value: true }
    ],
    limit: 30,
    sortBy: 'dateAdded',
    sortOrder: 'desc',
    isSmart: true,
    coverGradient: ['#06b6d4', '#164e63']
  },
  {
    id: 'smart-electronic',
    name: 'Electronic & Synthwave',
    description: 'Synthesizers, driving beats, and ambient soundscapes.',
    icon: 'Disc',
    matchType: 'all',
    rules: [
      { id: 'r5', field: 'genre', operator: 'contains', value: 'Electronic' }
    ],
    sortBy: 'title',
    sortOrder: 'asc',
    isSmart: true,
    coverGradient: ['#a855f7', '#3b0764']
  }
];

export const DEFAULT_EQUALIZER_PRESETS: EqualizerPreset[] = [
  { id: 'flat', name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'bass-boost', name: 'Bass Booster', gains: [6, 5, 4, 2, 0, 0, 0, 0, 1, 2] },
  { id: 'acoustic', name: 'Acoustic', gains: [4, 3, 1, 1, 2, 2, 3, 3, 3, 2] },
  { id: 'electronic', name: 'Electronic', gains: [5, 4, 2, 0, -2, 2, 1, 3, 4, 5] },
  { id: 'rock', name: 'Rock', gains: [5, 3, -1, -2, 1, 2, 3, 4, 4, 4] },
  { id: 'vocal-booster', name: 'Vocal Booster', gains: [-2, -2, -1, 1, 3, 4, 4, 3, 1, 0] },
  { id: 'classical', name: 'Classical', gains: [4, 3, 2, 2, -1, -1, 0, 2, 3, 3] },
  { id: 'late-night', name: 'Late Night', gains: [-3, -2, 0, 2, 3, 2, 1, -1, -3, -4] }
];

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcutConfig[] = [
  { id: 'play_pause', action: 'Toggle Play/Pause', label: 'Play / Pause', defaultKey: ' ', currentKey: ' ', requiresCtrl: false, requiresShift: false, requiresAlt: false },
  { id: 'next_track', action: 'Next Track', label: 'Next Track', defaultKey: 'ArrowRight', currentKey: 'ArrowRight', requiresCtrl: true, requiresShift: false, requiresAlt: false },
  { id: 'prev_track', action: 'Previous Track', label: 'Previous Track', defaultKey: 'ArrowLeft', currentKey: 'ArrowLeft', requiresCtrl: true, requiresShift: false, requiresAlt: false },
  { id: 'volume_up', action: 'Volume Up', label: 'Volume Up', defaultKey: 'ArrowUp', currentKey: 'ArrowUp', requiresCtrl: true, requiresShift: false, requiresAlt: false },
  { id: 'volume_down', action: 'Volume Down', label: 'Volume Down', defaultKey: 'ArrowDown', currentKey: 'ArrowDown', requiresCtrl: true, requiresShift: false, requiresAlt: false },
  { id: 'toggle_lyrics', action: 'Toggle Lyrics', label: 'Show/Hide Lyrics', defaultKey: 'l', currentKey: 'l', requiresCtrl: true, requiresShift: false, requiresAlt: false },
  { id: 'toggle_queue', action: 'Toggle Queue', label: 'Show/Hide Up Next', defaultKey: 'u', currentKey: 'u', requiresCtrl: true, requiresShift: false, requiresAlt: false },
  { id: 'focus_search', action: 'Search', label: 'Focus Search Bar', defaultKey: 'f', currentKey: 'f', requiresCtrl: true, requiresShift: false, requiresAlt: false },
  { id: 'toggle_mini', action: 'Mini Player', label: 'Toggle Mini Player', defaultKey: 'm', currentKey: 'm', requiresCtrl: true, requiresShift: false, requiresAlt: false },
  { id: 'sync_folders', action: 'Sync Folders', label: 'Resync Local Folders', defaultKey: 's', currentKey: 's', requiresCtrl: true, requiresShift: true, requiresAlt: false }
];

export const DEFAULT_LOCAL_FOLDERS: LocalStorageFolder[] = [
  {
    id: 'folder-1',
    name: 'Lossless Hi-Res Collection',
    path: 'C:\\Users\\User\\Music\\Hi-Res Studio Masters',
    trackCount: 6,
    totalSize: 348127232, // ~332 MB
    lastSynced: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'synced'
  },
  {
    id: 'folder-2',
    name: 'Vinyl Rips & FLAC Archive',
    path: 'D:\\Audio\\Vinyl Rips 24-96',
    trackCount: 4,
    totalSize: 489228192,
    lastSynced: new Date(Date.now() - 86400000).toISOString(),
    status: 'synced'
  }
];

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    albumArtist: 'M83',
    duration: 244,
    trackNumber: 2,
    discNumber: 1,
    year: 2011,
    genre: 'Electronic',
    artworkUrl: generateProceduralArtwork('Midnight City', 'M83', 'Hurry Up, We\'re Dreaming'),
    accentColors: ['#fa2d48', '#4a0e4e', '#0f081d'],
    audioSrc: 'synth:midnight_city',
    fileName: '02. M83 - Midnight City (24bit-96kHz).flac',
    filePath: 'C:\\Users\\User\\Music\\Hi-Res Studio Masters\\M83\\02. M83 - Midnight City.flac',
    fileSize: 58249000,
    audioQuality: {
      format: 'Hi-Res Lossless',
      sampleRate: 96000,
      bitDepth: 24,
      bitrate: 2822,
      isHiResLossless: true,
      isLossless: true
    },
    lyrics: {
      type: 'synced',
      syncedLines: [
        { time: 8.5, text: "Waiting in a car" },
        { time: 12.0, text: "Waiting for a ride in the dark" },
        { time: 16.5, text: "The night city grows" },
        { time: 20.2, text: "Look and see her eyes, they glow" },
        { time: 24.8, text: "Waiting in a car" },
        { time: 28.5, text: "Waiting for a ride in the dark" },
        { time: 33.0, text: "The night city grows" },
        { time: 37.1, text: "Look and see her eyes, they glow" },
        { time: 42.0, text: "Waiting in a car" },
        { time: 46.2, text: "Waiting for a ride in the dark" },
        { time: 50.8, text: "The city is my church" },
        { time: 54.9, text: "It wraps me in the blinding twilight" },
        { time: 66.5, text: "Waiting in a car" },
        { time: 70.3, text: "Waiting for the right time" },
        { time: 75.0, text: "The city is my church" },
        { time: 79.2, text: "It wraps me in the blinding twilight" },
        { time: 98.0, text: "Look and see her eyes, they glow" }
      ]
    },
    dateAdded: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    playCount: 18,
    isFavorite: true,
    rating: 5,
    folderId: 'folder-1'
  },
  {
    id: 'track-2',
    title: 'Get Lucky (feat. Pharrell Williams)',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    albumArtist: 'Daft Punk',
    duration: 248,
    trackNumber: 8,
    discNumber: 1,
    year: 2013,
    genre: 'Funk / Electronic',
    artworkUrl: generateProceduralArtwork('Get Lucky', 'Daft Punk', 'Random Access Memories'),
    accentColors: ['#eab308', '#78350f', '#180d05'],
    audioSrc: 'synth:get_lucky',
    fileName: '08. Daft Punk - Get Lucky [ALAC 24-88.2].m4a',
    filePath: 'C:\\Users\\User\\Music\\Hi-Res Studio Masters\\Daft Punk\\08. Get Lucky.m4a',
    fileSize: 64120000,
    audioQuality: {
      format: 'Hi-Res Lossless',
      sampleRate: 88200,
      bitDepth: 24,
      bitrate: 2600,
      isHiResLossless: true,
      isLossless: true
    },
    lyrics: {
      type: 'synced',
      syncedLines: [
        { time: 7.2, text: "Like the legend of the phoenix" },
        { time: 11.5, text: "All ends with beginnings" },
        { time: 15.6, text: "What keeps the planet spinning" },
        { time: 19.8, text: "The force from the beginning" },
        { time: 24.0, text: "We've come too far to give up who we are" },
        { time: 31.8, text: "So let's raise the bar and our cups to the stars" },
        { time: 39.5, text: "She's up all night 'til the sun" },
        { time: 43.6, text: "I'm up all night to get some" },
        { time: 47.7, text: "She's up all night for good fun" },
        { time: 51.8, text: "I'm up all night to get lucky" },
        { time: 56.0, text: "We're up all night 'til the sun" },
        { time: 60.1, text: "We're up all night to get some" },
        { time: 64.2, text: "We're up all night for good fun" },
        { time: 68.3, text: "We're up all night to get lucky" }
      ]
    },
    dateAdded: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    playCount: 34,
    isFavorite: true,
    rating: 5,
    folderId: 'folder-1'
  },
  {
    id: 'track-3',
    title: 'Dreams',
    artist: 'Fleetwood Mac',
    album: 'Rumours (Super Deluxe Master)',
    albumArtist: 'Fleetwood Mac',
    duration: 257,
    trackNumber: 2,
    discNumber: 1,
    year: 1977,
    genre: 'Classic Rock',
    artworkUrl: generateProceduralArtwork('Dreams', 'Fleetwood Mac', 'Rumours'),
    accentColors: ['#ec4899', '#831843', '#1e050f'],
    audioSrc: 'synth:dreams',
    fileName: '02. Fleetwood Mac - Dreams (24-192 Master).flac',
    filePath: 'D:\\Audio\\Vinyl Rips 24-96\\Fleetwood Mac\\02. Dreams.flac',
    fileSize: 98400000,
    audioQuality: {
      format: 'Hi-Res Lossless',
      sampleRate: 192000,
      bitDepth: 24,
      bitrate: 4608,
      isHiResLossless: true,
      isLossless: true
    },
    lyrics: {
      type: 'synced',
      syncedLines: [
        { time: 10.4, text: "Now here you go again, you say you want your freedom" },
        { time: 19.8, text: "Well, who am I to keep you down?" },
        { time: 27.2, text: "It's only right that you should play the way you feel it" },
        { time: 35.6, text: "But listen carefully to the sound of your loneliness" },
        { time: 43.8, text: "Like a heartbeat, drives you mad" },
        { time: 48.0, text: "In the stillness of remembering what you had" },
        { time: 54.2, text: "And what you lost, and what you had, and what you lost" },
        { time: 62.4, text: "Yeah, thunder only happens when it's rainin'" },
        { time: 70.8, text: "Players only love you when they're playin'" },
        { time: 78.9, text: "Say, women, they will come and they will go" },
        { time: 87.2, text: "When the rain washes you clean, you'll know" }
      ]
    },
    dateAdded: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    playCount: 22,
    isFavorite: true,
    rating: 5,
    folderId: 'folder-2'
  },
  {
    id: 'track-4',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    albumArtist: 'The Weeknd',
    duration: 200,
    trackNumber: 9,
    discNumber: 1,
    year: 2020,
    genre: 'Synthwave / Pop',
    artworkUrl: generateProceduralArtwork('Blinding Lights', 'The Weeknd', 'After Hours'),
    accentColors: ['#ef4444', '#991b1b', '#200505'],
    audioSrc: 'synth:blinding_lights',
    fileName: '09. The Weeknd - Blinding Lights.flac',
    filePath: 'C:\\Users\\User\\Music\\Hi-Res Studio Masters\\The Weeknd\\09. Blinding Lights.flac',
    fileSize: 42100000,
    audioQuality: {
      format: 'Lossless',
      sampleRate: 44100,
      bitDepth: 16,
      bitrate: 1411,
      isHiResLossless: false,
      isLossless: true
    },
    lyrics: {
      type: 'synced',
      syncedLines: [
        { time: 9.0, text: "Yeah" },
        { time: 13.5, text: "I've been tryna call" },
        { time: 17.2, text: "I've been on my own for long enough" },
        { time: 21.8, text: "Maybe you can show me how to love, maybe" },
        { time: 29.5, text: "I'm going through withdrawals" },
        { time: 33.2, text: "You don't even have to do too much" },
        { time: 37.5, text: "You can turn me on with just a touch, baby" },
        { time: 44.8, text: "I look around and Sin City's cold and empty" },
        { time: 49.6, text: "No one's around to judge me" },
        { time: 53.0, text: "I can't see clearly when you're gone" },
        { time: 59.8, text: "I said, ooh, I'm blinded by the lights" },
        { time: 66.8, text: "No, I can't sleep until I feel your touch" }
      ]
    },
    dateAdded: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    playCount: 12,
    isFavorite: false,
    rating: 4,
    folderId: 'folder-1'
  },
  {
    id: 'track-5',
    title: 'Time',
    artist: 'Pink Floyd',
    album: 'The Dark Side of the Moon (50th Anniversary)',
    albumArtist: 'Pink Floyd',
    duration: 413,
    trackNumber: 4,
    discNumber: 1,
    year: 1973,
    genre: 'Progressive Rock',
    artworkUrl: generateProceduralArtwork('Time', 'Pink Floyd', 'The Dark Side of the Moon'),
    accentColors: ['#3b82f6', '#1e3a8a', '#050c1f'],
    audioSrc: 'synth:time',
    fileName: '04. Pink Floyd - Time (24bit 96kHz Master).flac',
    filePath: 'D:\\Audio\\Vinyl Rips 24-96\\Pink Floyd\\04. Time.flac',
    fileSize: 114000000,
    audioQuality: {
      format: 'Hi-Res Lossless',
      sampleRate: 96000,
      bitDepth: 24,
      bitrate: 2822,
      isHiResLossless: true,
      isLossless: true
    },
    lyrics: {
      type: 'synced',
      syncedLines: [
        { time: 138.0, text: "Ticking away the moments that make up a dull day" },
        { time: 144.5, text: "Fritter and waste the hours in an offhand way" },
        { time: 151.2, text: "Kicking around on a piece of ground in your hometown" },
        { time: 158.0, text: "Waiting for someone or something to show you the way" },
        { time: 165.5, text: "Tired of lying in the sunshine, staying home to watch the rain" },
        { time: 172.5, text: "You are young and life is long, and there is time to kill today" },
        { time: 179.5, text: "And then one day you find ten years have got behind you" },
        { time: 186.2, text: "No one told you when to run, you missed the starting gun" }
      ]
    },
    dateAdded: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    playCount: 9,
    isFavorite: true,
    rating: 5,
    folderId: 'folder-2'
  },
  {
    id: 'track-6',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    albumArtist: 'Dua Lipa',
    duration: 203,
    trackNumber: 5,
    discNumber: 1,
    year: 2020,
    genre: 'Nu-Disco / Pop',
    artworkUrl: generateProceduralArtwork('Levitating', 'Dua Lipa', 'Future Nostalgia'),
    accentColors: ['#d946ef', '#701a75', '#1a041c'],
    audioSrc: 'synth:levitating',
    fileName: '05. Dua Lipa - Levitating.m4a',
    filePath: 'C:\\Users\\User\\Music\\Hi-Res Studio Masters\\Dua Lipa\\05. Levitating.m4a',
    fileSize: 49000000,
    audioQuality: {
      format: 'Lossless',
      sampleRate: 48000,
      bitDepth: 24,
      bitrate: 1536,
      isHiResLossless: false,
      isLossless: true
    },
    lyrics: {
      type: 'synced',
      syncedLines: [
        { time: 5.5, text: "If you wanna run away with me, I know a galaxy" },
        { time: 9.8, text: "And I can take you for a ride" },
        { time: 14.0, text: "I had a premonition that we fell into a rhythm" },
        { time: 18.2, text: "Where the music don't stop for life" },
        { time: 22.5, text: "Glitter in the sky, glitter in my eyes" },
        { time: 26.6, text: "Shining just the way I like" },
        { time: 30.8, text: "If you're feeling like you need a little bit of company" },
        { time: 35.1, text: "You met me at the perfect time" },
        { time: 39.5, text: "You want me, I want you, baby" },
        { time: 43.8, text: "My sugarboo, I'm levitating" }
      ]
    },
    dateAdded: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    playCount: 15,
    isFavorite: false,
    rating: 4,
    folderId: 'folder-1'
  }
];

// Smart Playlist Rule Engine
export function evaluateSmartPlaylist(playlist: SmartPlaylist, allTracks: Track[]): Track[] {
  let filtered = allTracks.filter((track) => {
    if (!playlist.rules || playlist.rules.length === 0) return true;

    const matches = playlist.rules.map((rule) => {
      let trackVal: any = undefined;

      switch (rule.field) {
        case 'title': trackVal = track.title; break;
        case 'artist': trackVal = track.artist; break;
        case 'album': trackVal = track.album; break;
        case 'genre': trackVal = track.genre; break;
        case 'year': trackVal = track.year; break;
        case 'playCount': trackVal = track.playCount; break;
        case 'isFavorite': trackVal = track.isFavorite; break;
        case 'isHiRes': trackVal = track.audioQuality.isHiResLossless; break;
        case 'isLossless': trackVal = track.audioQuality.isLossless; break;
        case 'dateAdded': trackVal = new Date(track.dateAdded).getTime(); break;
      }

      switch (rule.operator) {
        case 'contains':
          return String(trackVal || '').toLowerCase().includes(String(rule.value).toLowerCase());
        case 'doesNotContain':
          return !String(trackVal || '').toLowerCase().includes(String(rule.value).toLowerCase());
        case 'equals':
          return String(trackVal || '').toLowerCase() === String(rule.value).toLowerCase();
        case 'greaterThan':
          return Number(trackVal || 0) > Number(rule.value);
        case 'lessThan':
          return Number(trackVal || 0) < Number(rule.value);
        case 'isTrue':
          return Boolean(trackVal) === true;
        case 'isFalse':
          return Boolean(trackVal) === false;
        case 'inLastDays': {
          const days = Number(rule.value) || 30;
          const msThreshold = Date.now() - days * 86400000;
          return Number(trackVal || 0) >= msThreshold;
        }
        default:
          return true;
      }
    });

    return playlist.matchType === 'all'
      ? matches.every(Boolean)
      : matches.some(Boolean);
  });

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (playlist.sortBy) {
      case 'title': comparison = a.title.localeCompare(b.title); break;
      case 'artist': comparison = a.artist.localeCompare(b.artist); break;
      case 'album': comparison = a.album.localeCompare(b.album); break;
      case 'year': comparison = (a.year || 0) - (b.year || 0); break;
      case 'playCount': comparison = a.playCount - b.playCount; break;
      case 'dateAdded': comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(); break;
    }
    return playlist.sortOrder === 'desc' ? -comparison : comparison;
  });

  if (playlist.limit && playlist.limit > 0) {
    return filtered.slice(0, playlist.limit);
  }

  return filtered;
}
