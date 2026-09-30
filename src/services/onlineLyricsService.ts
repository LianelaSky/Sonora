import { SyncedLyricLine, TrackLyrics } from '../types/music';
import { parseLRC } from './metadataService';

export interface OnlineLyricResult {
  id?: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  syncedLyrics?: string;
  plainLyrics?: string;
  instrumental?: boolean;
}

export class OnlineLyricsService {
  // Fetch synced lyrics from LRCLIB open API
  public async fetchLyrics(
    title: string,
    artist: string,
    album?: string,
    duration?: number
  ): Promise<TrackLyrics | null> {
    try {
      // Clean up common file patterns like "(Remastered)", "[FLAC]", "feat. X"
      const cleanTitle = title
        .replace(/\(remastered[^)]*\)/gi, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\(feat\.[^)]*\)/gi, '')
        .trim();

      const cleanArtist = artist.replace(/feat\..*/gi, '').trim();

      // Try exact match first
      const params = new URLSearchParams();
      params.append('track_name', cleanTitle);
      params.append('artist_name', cleanArtist);
      if (album && album !== 'Local Audio') {
        params.append('album_name', album);
      }
      if (duration && duration > 0) {
        params.append('duration', Math.round(duration).toString());
      }

      const exactUrl = `https://lrclib.net/api/get?${params.toString()}`;
      let response = await fetch(exactUrl);

      if (!response.ok) {
        // Fallback to search query
        const query = `${cleanTitle} ${cleanArtist}`.trim();
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
        response = await fetch(searchUrl);

        if (!response.ok) return null;

        const results: OnlineLyricResult[] = await response.json();
        if (results && results.length > 0) {
          // Find closest matching result with syncedLyrics
          const withSynced = results.find((r) => r.syncedLyrics && r.syncedLyrics.trim().length > 0);
          const bestMatch = withSynced || results[0];

          return this.formatLyricResult(bestMatch);
        }
        return null;
      }

      const data: OnlineLyricResult = await response.json();
      return this.formatLyricResult(data);
    } catch (err) {
      console.warn('Online lyrics fetch failed (network or offline):', err);
      return null;
    }
  }

  // Search online lyrics with custom query
  public async searchLyrics(query: string): Promise<OnlineLyricResult[]> {
    try {
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      if (!response.ok) return [];
      const data: OnlineLyricResult[] = await response.json();
      return data || [];
    } catch (err) {
      console.warn('Online lyrics search failed:', err);
      return [];
    }
  }

  public formatLyricResult(result: OnlineLyricResult): TrackLyrics {
    if (result.syncedLyrics && result.syncedLyrics.trim().length > 0) {
      const parsedLines = parseLRC(result.syncedLyrics);
      return {
        type: 'synced',
        syncedLines: parsedLines,
        plainText: result.plainLyrics || undefined,
        source: 'online',
      };
    }

    if (result.plainLyrics && result.plainLyrics.trim().length > 0) {
      return {
        type: 'plain',
        plainText: result.plainLyrics,
        source: 'online',
      };
    }

    return {
      type: 'plain',
      plainText: result.instrumental ? 'Instrumental track — No lyrics available.' : 'Lyrics not found.',
      source: 'online',
    };
  }
}

export const onlineLyrics = new OnlineLyricsService();
