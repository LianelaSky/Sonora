import { Track, SyncedLyricLine, TrackLyrics, AudioQuality } from '../types/music';

// Generate dynamic Apple Music vibrant accent colors from an image or title
export function generateAccentColors(title: string, artist: string): [string, string, string] {
  // Deterministic color palette generation based on string hash
  let hash = 0;
  const str = `${title}-${artist}`;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 45) % 360;
  const hue3 = (hue1 + 180) % 360;

  return [
    `hsl(${hue1}, 85%, 48%)`,
    `hsl(${hue2}, 70%, 25%)`,
    `hsl(${hue3}, 80%, 8%)`,
  ];
}

// Procedural high-resolution album artwork generator using Canvas
export function generateProceduralArtwork(title: string, artist: string, album: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const [color1, color2, color3] = generateAccentColors(title, artist);

  // Mesh gradient background
  const grad = ctx.createRadialGradient(200, 200, 50, 300, 300, 450);
  grad.addColorStop(0, color1);
  grad.addColorStop(0.6, color2);
  grad.addColorStop(1, color3);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 600);

  // Subtle concentric vinyl grooves
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1.5;
  for (let r = 80; r < 550; r += 24) {
    ctx.beginPath();
    ctx.arc(300, 300, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Apple Music glass badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(40, 420, 520, 140, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  const cleanTitle = title.length > 24 ? title.substring(0, 22) + '...' : title;
  ctx.fillText(cleanTitle, 70, 480);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  const cleanArtist = artist.length > 30 ? artist.substring(0, 28) + '...' : artist;
  ctx.fillText(cleanArtist, 70, 525);

  // Center stylized disc monogram
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(300, 230, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 72px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = (artist.charAt(0) || 'A') + (title.charAt(0) || 'M');
  ctx.fillText(initials.toUpperCase(), 300, 230);

  return canvas.toDataURL('image/jpeg', 0.92);
}

// iTunes Search API - Automatic Album Art & Metadata Fetcher
export async function fetchArtworkFromITunes(title: string, artist: string): Promise<{
  artworkUrl?: string;
  year?: number;
  genre?: string;
  album?: string;
} | null> {
  try {
    const query = `${title} ${artist}`.trim();
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.resultCount > 0 && data.results[0]) {
      const item = data.results[0];
      // Convert standard 100x100 artwork to crisp 600x600 or 1200x1200
      let art = item.artworkUrl100 as string;
      if (art) {
        art = art.replace('100x100bb.jpg', '600x600bb.jpg');
      }

      const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined;

      return {
        artworkUrl: art,
        year: releaseYear,
        genre: item.primaryGenreName,
        album: item.collectionName,
      };
    }
  } catch (err) {
    console.warn('iTunes API fetch failed or network restricted:', err);
  }
  return null;
}

// Parse standard LRC format string into synchronized lines
export function parseLRC(lrcText: string): SyncedLyricLine[] {
  const lines = lrcText.split(/\r?\n/);
  const result: SyncedLyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Reset regex index
    timeRegex.lastIndex = 0;
    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length > 0) {
      const text = trimmed.replace(timeRegex, '').trim();
      if (!text) continue;

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const totalSeconds = minutes * 60 + seconds + millis / 1000;
        result.push({ time: totalSeconds, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

// Convert SyncedLyricLine[] back to LRC file format string
export function exportToLRC(lines: SyncedLyricLine[], title: string, artist: string): string {
  let output = `[ti:${title}]\n[ar:${artist}]\n[by:Sonora Music for Windows]\n\n`;
  for (const line of lines) {
    const mins = Math.floor(line.time / 60);
    const secs = Math.floor(line.time % 60);
    const hundredths = Math.floor((line.time % 1) * 100);
    const timeFormatted = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}]`;
    output += `${timeFormatted} ${line.text}\n`;
  }
  return output;
}

// Parse Local Audio File Metadata from File object
export async function parseAudioFile(file: File, folderPath: string = 'C:\\Music'): Promise<Track> {
  const fileName = file.name;
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const ext = fileName.split('.').pop()?.toUpperCase() || 'MP3';

  // Smart filename heuristics: "Artist - Title" or "01 - Title" or "01. Artist - Title"
  let title = nameWithoutExt;
  let artist = 'Unknown Artist';
  let album = 'Local Audio';
  let trackNum: number | undefined = undefined;

  // Pattern: "01 - Artist - Title" or "01 Artist - Title"
  const trackNumPrefixMatch = nameWithoutExt.match(/^(\d{1,2})[\s\.\-_]+(.+)$/);
  let cleanName = nameWithoutExt;
  if (trackNumPrefixMatch) {
    trackNum = parseInt(trackNumPrefixMatch[1], 10);
    cleanName = trackNumPrefixMatch[2];
  }

  // Pattern: "Artist - Title"
  if (cleanName.includes(' - ')) {
    const parts = cleanName.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  } else if (cleanName.includes(' — ')) {
    const parts = cleanName.split(' — ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' — ').trim();
  }

  // Determine Audio Quality parameters
  const isFlac = ext === 'FLAC' || ext === 'ALAC';
  const isWav = ext === 'WAV';
  const isLossless = isFlac || isWav;
  const sampleRate = isLossless ? (file.size > 20000000 ? 96000 : 44100) : 44100;
  const bitDepth = isLossless ? (sampleRate >= 96000 ? 24 : 16) : 16;
  const bitrate = isLossless ? (bitDepth === 24 ? 2822 : 1411) : 320;

  const audioQuality: AudioQuality = {
    format: (isFlac ? (sampleRate >= 96000 ? 'Hi-Res Lossless' : 'Lossless') : ext as any),
    sampleRate,
    bitDepth,
    bitrate,
    isHiResLossless: sampleRate >= 96000 && bitDepth >= 24,
    isLossless,
  };

  // Generate URL for local blob
  const audioSrc = URL.createObjectURL(file);

  // Extract duration from temporary audio element
  const duration = await new Promise<number>((resolve) => {
    const tempAudio = document.createElement('audio');
    tempAudio.preload = 'metadata';
    tempAudio.src = audioSrc;
    tempAudio.onloadedmetadata = () => {
      resolve(tempAudio.duration || 180);
    };
    tempAudio.onerror = () => resolve(180);
  });

  const artworkUrl = generateProceduralArtwork(title, artist, album);
  const accentColors = generateAccentColors(title, artist);

  const track: Track = {
    id: 'track_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
    title,
    artist,
    album,
    duration,
    trackNumber: trackNum,
    year: new Date().getFullYear(),
    genre: 'Local Audio',
    artworkUrl,
    accentColors,
    audioSrc,
    fileName,
    filePath: `${folderPath}\\${fileName}`,
    fileSize: file.size,
    audioQuality,
    dateAdded: new Date().toISOString(),
    playCount: 0,
    isFavorite: false,
    lyrics: {
      type: 'plain',
      plainText: `Offline lyrics for "${title}" by ${artist}.\n\nImport a .LRC file or edit lyrics via the Lyrics panel to enable synchronized karaoke playback!`,
    },
  };

  return track;
}
