import React, { useState, useMemo } from 'react';
import { 
  Track, 
  LibraryViewMode, 
  SmartPlaylist, 
  UserPlaylist 
} from '../types/music';
import { 
  Play, 
  Pause, 
  Heart, 
  Clock, 
  Disc, 
  Sparkles, 
  SlidersHorizontal, 
  Layers, 
  Users, 
  ArrowUpDown, 
  Quote, 
  ListPlus, 
  Shuffle, 
  Edit,
  FolderOpen,
  Radio
} from 'lucide-react';

interface LibraryViewProps {
  viewMode: LibraryViewMode;
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenLyrics: () => void;
  onIdentifyTrack?: (track: Track) => void;
  smartPlaylists: SmartPlaylist[];
  currentSmartPlaylist: SmartPlaylist | null;
  currentPlaylist: UserPlaylist | null;
  onEditSmartPlaylist?: (playlist: SmartPlaylist) => void;
  searchQuery: string;
  onSelectAlbum?: (albumName: string) => void;
  onSelectArtist?: (artistName: string) => void;
  onAddToPlaylist?: (track: Track) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  viewMode,
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onToggleFavorite,
  onOpenLyrics,
  onIdentifyTrack,
  currentSmartPlaylist,
  currentPlaylist,
  onEditSmartPlaylist,
  searchQuery,
  onAddToPlaylist,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState<'all' | 'songs' | 'albums' | 'artists' | 'lyrics'>('all');
  const [sortField, setSortField] = useState<'title' | 'artist' | 'album' | 'duration' | 'playCount'>('title');
  const [sortAsc, setSortAsc] = useState(true);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSort = (field: 'title' | 'artist' | 'album' | 'duration' | 'playCount') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Distinct albums list
  const albums = useMemo(() => {
    const map = new Map<string, { album: string; artist: string; year?: number; artworkUrl: string; tracks: Track[]; isHiRes: boolean }>();
    tracks.forEach((t) => {
      const key = `${t.album} - ${t.artist}`;
      if (!map.has(key)) {
        map.set(key, {
          album: t.album,
          artist: t.artist,
          year: t.year,
          artworkUrl: t.artworkUrl,
          tracks: [t],
          isHiRes: t.audioQuality.isHiResLossless,
        });
      } else {
        const item = map.get(key)!;
        item.tracks.push(t);
        if (t.audioQuality.isHiResLossless) item.isHiRes = true;
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  // Distinct artists list
  const artists = useMemo(() => {
    const map = new Map<string, { artist: string; tracks: Track[]; artworkUrl: string }>();
    tracks.forEach((t) => {
      if (!map.has(t.artist)) {
        map.set(t.artist, {
          artist: t.artist,
          tracks: [t],
          artworkUrl: t.artworkUrl,
        });
      } else {
        map.get(t.artist)!.tracks.push(t);
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  // Distinct genres list
  const genres = useMemo(() => {
    const map = new Map<string, Track[]>();
    tracks.forEach((t) => {
      const g = t.genre || 'Various';
      if (!map.has(g)) map.set(g, [t]);
      else map.get(g)!.push(t);
    });
    return Array.from(map.entries());
  }, [tracks]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { songs: [], albums: [], artists: [], lyricsMatches: [] };
    const q = searchQuery.toLowerCase();

    const matchingSongs = tracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q)
    );

    const matchingAlbums = albums.filter(
      (a) => a.album.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );

    const matchingArtists = artists.filter((a) => a.artist.toLowerCase().includes(q));

    // Search in lyrics
    const matchingLyrics: { track: Track; line: string }[] = [];
    tracks.forEach((t) => {
      if (t.lyrics?.syncedLines) {
        const line = t.lyrics.syncedLines.find((l) => l.text.toLowerCase().includes(q));
        if (line) matchingLyrics.push({ track: t, line: line.text });
      } else if (t.lyrics?.plainText && t.lyrics.plainText.toLowerCase().includes(q)) {
        matchingLyrics.push({ track: t, line: 'Matches in plain text lyrics' });
      }
    });

    return {
      songs: matchingSongs,
      albums: matchingAlbums,
      artists: matchingArtists,
      lyricsMatches: matchingLyrics,
    };
  }, [tracks, albums, artists, searchQuery]);

  // Sorted tracks for Songs view
  const sortedTracks = useMemo(() => {
    const list = [...tracks];
    list.sort((a, b) => {
      let res = 0;
      switch (sortField) {
        case 'title': res = a.title.localeCompare(b.title); break;
        case 'artist': res = a.artist.localeCompare(b.artist); break;
        case 'album': res = a.album.localeCompare(b.album); break;
        case 'duration': res = a.duration - b.duration; break;
        case 'playCount': res = a.playCount - b.playCount; break;
      }
      return sortAsc ? res : -res;
    });
    return list;
  }, [tracks, sortField, sortAsc]);

  // Render Track Row in high-density table (Apple Music Songs view)
  const renderTrackRow = (track: Track, index: number) => {
    const isCurrent = currentTrack?.id === track.id;
    return (
      <tr
        key={track.id}
        onClick={() => {
          if (isCurrent) onTogglePlay();
          else onPlayTrack(track);
        }}
        className={`group border-b border-white/[0.03] hover:bg-white/[0.06] text-xs transition-colors cursor-pointer ${
          isCurrent ? 'bg-white/[0.08] text-white font-medium' : 'text-white/80'
        }`}
      >
        {/* Track Number / Play Icon */}
        <td className="w-10 px-3 py-2.5 text-center text-white/40 group-hover:text-white">
          <div className="relative flex items-center justify-center">
            <span className="group-hover:hidden tabular-nums">{index + 1}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isCurrent) onTogglePlay();
                else onPlayTrack(track);
              }}
              className="hidden group-hover:flex items-center justify-center text-white hover:text-[#fa2d48]"
            >
              {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>
        </td>

        {/* Title & Artwork */}
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-3">
            <img
              src={track.artworkUrl}
              alt=""
              className="w-9 h-9 rounded object-cover border border-white/10 shrink-0 shadow"
            />
            <div className="min-w-0">
              <div className={`truncate font-medium ${isCurrent ? 'text-[#fa2d48]' : 'text-white'}`}>
                {track.title}
              </div>
              <div className="text-[11px] text-white/40 truncate md:hidden">
                {track.artist}
              </div>
            </div>
          </div>
        </td>

        {/* Artist */}
        <td className="px-3 py-2.5 hidden md:table-cell truncate max-w-[180px]">
          <span
            onClick={(e) => {
              e.stopPropagation();
              setSelectedArtist(track.artist);
            }}
            className="hover:underline hover:text-white"
          >
            {track.artist}
          </span>
        </td>

        {/* Album */}
        <td className="px-3 py-2.5 hidden lg:table-cell truncate max-w-[200px] text-white/60">
          <span
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAlbum(track.album);
            }}
            className="hover:underline hover:text-white"
          >
            {track.album}
          </span>
        </td>

        {/* Quality Badge */}
        <td className="px-3 py-2.5 hidden sm:table-cell">
          {track.audioQuality.isHiResLossless ? (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#fa2d48]/15 text-[#fa2d48] border border-[#fa2d48]/25">
              24-bit/96k
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-white/5 text-white/50 border border-white/10">
              Lossless
            </span>
          )}
        </td>

        {/* Plays */}
        <td className="px-3 py-2.5 text-right hidden sm:table-cell text-white/40 tabular-nums">
          {track.playCount > 0 ? track.playCount : '—'}
        </td>

        {/* Duration */}
        <td className="px-3 py-2.5 text-right text-white/50 tabular-nums">
          {formatTime(track.duration)}
        </td>

        {/* Actions (Heart / Lyrics / Shazam / Add) */}
        <td className="w-24 px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1.5">
            {onIdentifyTrack && (
              <button
                onClick={() => onIdentifyTrack(track)}
                className="p-1 text-white/20 hover:text-[#00d4ff] transition-colors"
                title="Shazam: Auto-detect track & update metadata"
              >
                <Radio className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onToggleFavorite(track.id)}
              className={`p-1 transition-colors ${
                track.isFavorite ? 'text-[#fa2d48]' : 'text-white/20 hover:text-white/60'
              }`}
              title={track.isFavorite ? 'Loved' : 'Love'}
            >
              <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
            </button>
            {track.lyrics?.syncedLines && (
              <button
                onClick={() => {
                  onPlayTrack(track);
                  onOpenLyrics();
                }}
                className="p-1 text-white/30 hover:text-white transition-colors"
                title="View Synchronized Lyrics"
              >
                <Quote className="w-3 h-3" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // --- ALBUM DETAIL SUBVIEW ---
  if (selectedAlbum) {
    const albumItem = albums.find((a) => a.album === selectedAlbum);
    if (albumItem) {
      const totalDuration = albumItem.tracks.reduce((acc, t) => acc + t.duration, 0);

      return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="text-xs text-[#fa2d48] hover:underline flex items-center gap-1"
          >
            ← Back to Library
          </button>

          {/* Album Hero */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={albumItem.artworkUrl}
              alt={albumItem.album}
              className="w-52 h-52 rounded-2xl shadow-2xl object-cover border border-white/10"
            />
            <div className="flex-1 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Album</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{albumItem.album}</h1>
              <div className="text-base font-medium text-[#fa2d48]">{albumItem.artist}</div>
              <div className="text-xs text-white/50 flex items-center gap-2">
                {albumItem.year && <span>{albumItem.year}</span>}
                <span>·</span>
                <span>{albumItem.tracks.length} Songs</span>
                <span>·</span>
                <span>{Math.floor(totalDuration / 60)} minutes</span>
                {albumItem.isHiRes && (
                  <>
                    <span>·</span>
                    <span className="text-[#fa2d48] font-bold">Hi-Res Lossless Master</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => onPlayTrack(albumItem.tracks[0])}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/25 transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play</span>
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...albumItem.tracks].sort(() => Math.random() - 0.5);
                    onPlayTrack(shuffled[0]);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Track Table */}
          <div className="mt-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  <th className="w-10 px-3 py-3 text-center">#</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3 hidden md:table-cell">Artist</th>
                  <th className="px-3 py-3 hidden sm:table-cell">Audio Quality</th>
                  <th className="px-3 py-3 text-right hidden sm:table-cell">Plays</th>
                  <th className="px-3 py-3 text-right">Time</th>
                  <th className="w-16 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {albumItem.tracks.map((t, idx) => renderTrackRow(t, idx))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }

  // --- SEARCH VIEW ---
  if (viewMode === 'search') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Search Sonora Music'}
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Search tracks, albums, artists, and offline synchronized lyrics across your local storage.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.05] rounded-lg w-fit border border-white/[0.06]">
          {(['all', 'songs', 'albums', 'artists', 'lyrics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSearchCategory(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                searchCategory === tab
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Matching Lyrics Section */}
        {(searchCategory === 'all' || searchCategory === 'lyrics') && searchResults.lyricsMatches.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-[#fa2d48]" />
              Matching Lyrics ({searchResults.lyricsMatches.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.lyricsMatches.map(({ track, line }, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onPlayTrack(track);
                    onOpenLyrics();
                  }}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#fa2d48]/50 hover:bg-white/[0.06] transition-all cursor-pointer group"
                >
                  <div className="text-xs text-[#fa2d48] font-semibold mb-1 italic">
                    "{line}"
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white">
                    <span className="font-medium group-hover:underline">{track.title}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/60">{track.artist}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Songs */}
        {(searchCategory === 'all' || searchCategory === 'songs') && searchResults.songs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Songs ({searchResults.songs.length})
            </h2>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <table className="w-full text-left">
                <tbody>
                  {searchResults.songs.map((t, idx) => renderTrackRow(t, idx))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Albums */}
        {(searchCategory === 'all' || searchCategory === 'albums') && searchResults.albums.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Albums ({searchResults.albums.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.albums.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedAlbum(item.album)}
                  className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all cursor-pointer group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                    <img
                      src={item.artworkUrl}
                      alt={item.album}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(item.tracks[0]);
                      }}
                      className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#fa2d48] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                  <div className="font-semibold text-white text-xs truncate">{item.album}</div>
                  <div className="text-[11px] text-white/50 truncate mt-0.5">{item.artist}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && searchResults.songs.length === 0 && searchResults.albums.length === 0 && searchResults.lyricsMatches.length === 0 && (
          <div className="p-12 text-center text-white/40">
            No matches found for "{searchQuery}". Check spelling or search by lyric words.
          </div>
        )}
      </div>
    );
  }

  // --- SMART PLAYLIST DETAIL VIEW ---
  if (viewMode === 'smart-playlist' && currentSmartPlaylist) {
    const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);

    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div
            className="w-48 h-48 rounded-2xl shadow-2xl flex flex-col items-center justify-center border border-white/10 p-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${currentSmartPlaylist.coverGradient?.[0] || '#fa2d48'}, ${currentSmartPlaylist.coverGradient?.[1] || '#831843'})`,
            }}
          >
            <Sparkles className="w-14 h-14 text-white drop-shadow-md mb-2" />
            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Smart Playlist</span>
          </div>

          <div className="flex-1 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Smart Playlist</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{currentSmartPlaylist.name}</h1>
            <p className="text-xs text-white/70 max-w-lg leading-relaxed">{currentSmartPlaylist.description}</p>
            <div className="text-xs text-white/50 flex items-center gap-2 pt-1">
              <span>{tracks.length} Songs</span>
              <span>·</span>
              <span>{Math.floor(totalDuration / 60)} minutes</span>
              <span>·</span>
              <span>Matched by {currentSmartPlaylist.rules.length} Smart Rules</span>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => tracks.length > 0 && onPlayTrack(tracks[0])}
                disabled={tracks.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/25 transition-transform active:scale-95 disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </button>
              <button
                onClick={() => {
                  if (tracks.length > 0) {
                    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                    onPlayTrack(shuffled[0]);
                  }
                }}
                disabled={tracks.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10 disabled:opacity-40"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>

              {onEditSmartPlaylist && (
                <button
                  onClick={() => onEditSmartPlaylist(currentSmartPlaylist)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Rules</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3 hidden md:table-cell">Artist</th>
                <th className="px-3 py-3 hidden lg:table-cell">Album</th>
                <th className="px-3 py-3 hidden sm:table-cell">Audio Quality</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">Plays</th>
                <th className="px-3 py-3 text-right">Time</th>
                <th className="w-16 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((t, idx) => renderTrackRow(t, idx))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- SONGS VIEW (High-density tabular list) ---
  if (viewMode === 'songs') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Songs</h1>
            <p className="text-xs text-white/50 mt-1">
              {tracks.length} tracks · {tracks.filter((t) => t.audioQuality.isHiResLossless).length} Studio Masters
            </p>
          </div>
          <button
            onClick={() => tracks.length > 0 && onPlayTrack(tracks[0])}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fa2d48] text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play All</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-white/40 uppercase tracking-wider select-none">
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-3 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">
                    <span>Title</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 hidden md:table-cell cursor-pointer hover:text-white" onClick={() => handleSort('artist')}>
                  <div className="flex items-center gap-1">
                    <span>Artist</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 hidden lg:table-cell cursor-pointer hover:text-white" onClick={() => handleSort('album')}>
                  <div className="flex items-center gap-1">
                    <span>Album</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 hidden sm:table-cell">Quality</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell cursor-pointer hover:text-white" onClick={() => handleSort('playCount')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Plays</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('duration')}>
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                  </div>
                </th>
                <th className="w-16 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedTracks.map((t, idx) => renderTrackRow(t, idx))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- ALBUMS VIEW ---
  if (viewMode === 'albums') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Albums</h1>
          <p className="text-xs text-white/50 mt-1">{albums.length} albums in local library</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {albums.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedAlbum(item.album)}
              className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all cursor-pointer group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                <img
                  src={item.artworkUrl}
                  alt={item.album}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrack(item.tracks[0]);
                  }}
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#fa2d48] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
              <div className="font-semibold text-white text-xs truncate group-hover:text-[#fa2d48] transition-colors">
                {item.album}
              </div>
              <div className="text-[11px] text-white/50 truncate mt-0.5">{item.artist}</div>
              {item.isHiRes && (
                <div className="text-[9px] text-[#fa2d48] font-bold mt-1 uppercase tracking-wider">
                  Hi-Res Lossless
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- ARTISTS VIEW ---
  if (viewMode === 'artists') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Artists</h1>
          <p className="text-xs text-white/50 mt-1">{artists.length} artists in local library</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {artists.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onPlayTrack(item.tracks[0])}
              className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all cursor-pointer group flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-3 shadow-xl border border-white/10 group-hover:border-[#fa2d48] transition-colors">
                <img
                  src={item.artworkUrl}
                  alt={item.artist}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="font-semibold text-white text-xs truncate max-w-full group-hover:text-[#fa2d48]">
                {item.artist}
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">
                {item.tracks.length} {item.tracks.length === 1 ? 'Track' : 'Tracks'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- GENRES VIEW ---
  if (viewMode === 'genres') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Genres</h1>
          <p className="text-xs text-white/50 mt-1">Browse music organized by sonic categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genres.map(([genreName, genreTracks], idx) => (
            <div
              key={idx}
              onClick={() => onPlayTrack(genreTracks[0])}
              className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.06] hover:border-[#fa2d48]/50 hover:from-[#fa2d48]/10 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <Layers className="w-6 h-6 text-[#fa2d48]" />
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#fa2d48] transition-colors">
                  {genreName}
                </h3>
                <span className="text-xs text-white/40">{genreTracks.length} Songs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- LISTEN NOW / RECENTLY ADDED (Default Hero Home) ---
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 select-none">
      {/* Hero Banner (Apple Music Windows Style) */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-[#200810] via-[#140b1e] to-[#0d0d12] border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-lg space-y-3">
          <span className="text-[11px] font-bold text-[#fa2d48] uppercase tracking-wider">
            Now in High-Resolution Audio
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Listen to your local library in 24-bit Studio Master quality.
          </h1>
          <p className="text-xs text-white/70 leading-relaxed">
            Direct bit-perfect audio playback from your Windows local storage folders with real-time synchronized offline lyrics, dynamic album color themes, and custom equalizer.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => tracks.length > 0 && onPlayTrack(tracks[0])}
              className="px-5 py-2.5 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/25 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen Now</span>
            </button>
            <button
              onClick={onOpenLyrics}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 border border-white/10"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Live Lyrics</span>
            </button>
          </div>
        </div>

        {/* Backdrop Visual Artwork Pill Glow */}
        {tracks[0] && (
          <img
            src={tracks[0].artworkUrl}
            alt=""
            className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full blur-[80px] opacity-40 pointer-events-none"
          />
        )}
      </div>

      {/* Recently Added Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Recently Added</h2>
          <span className="text-xs text-white/40">From local folders</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {tracks.slice(0, 6).map((t) => (
            <div
              key={t.id}
              onClick={() => onPlayTrack(t)}
              className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all cursor-pointer group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-md">
                <img
                  src={t.artworkUrl}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrack(t);
                  }}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#fa2d48] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
              <div className="font-semibold text-white text-xs truncate group-hover:text-[#fa2d48] transition-colors">
                {t.title}
              </div>
              <div className="text-[11px] text-white/50 truncate mt-0.5">{t.artist}</div>
              {t.audioQuality.isHiResLossless && (
                <div className="text-[9px] text-[#fa2d48] font-bold mt-1 uppercase tracking-wider">
                  Hi-Res
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
