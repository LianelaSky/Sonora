import React, { useEffect, useRef, useState } from 'react';
import { Track, SyncedLyricLine } from '../types/music';
import { 
  FileText, 
  Upload, 
  Edit3, 
  Download, 
  X, 
  Sparkles, 
  Check, 
  Clock, 
  Maximize2, 
  Minimize2,
  AlertCircle,
  Globe,
  RefreshCw,
  Search
} from 'lucide-react';
import { parseLRC, exportToLRC } from '../services/metadataService';
import { onlineLyrics } from '../services/onlineLyricsService';

interface LyricsViewProps {
  currentTrack: Track | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onClose: () => void;
  onUpdateTrackLyrics: (trackId: string, lyrics: Track['lyrics']) => void;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  currentTrack,
  currentTime,
  onSeek,
  onClose,
  onUpdateTrackLyrics,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFetchingOnline, setIsFetchingOnline] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<string | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const syncedLines = currentTrack?.lyrics?.syncedLines || [];
  const hasSynced = syncedLines.length > 0;

  // Online Lyrics Fetcher
  const handleFetchOnlineLyrics = async () => {
    if (!currentTrack) return;
    setIsFetchingOnline(true);
    setOnlineStatus('Searching online lyric databases (LRCLIB)...');

    const result = await onlineLyrics.fetchLyrics(
      currentTrack.title,
      currentTrack.artist,
      currentTrack.album,
      currentTrack.duration
    );

    setIsFetchingOnline(false);

    if (result && (result.syncedLines?.length || result.plainText)) {
      onUpdateTrackLyrics(currentTrack.id, result);
      setOnlineStatus('Lyrics synchronized from online library!');
      setTimeout(() => setOnlineStatus(null), 3000);
    } else {
      setOnlineStatus('No online lyrics found for this track.');
      setTimeout(() => setOnlineStatus(null), 4000);
    }
  };

  // Find the index of the currently active line
  let activeIndex = -1;
  if (hasSynced) {
    for (let i = 0; i < syncedLines.length; i++) {
      if (currentTime >= syncedLines[i].time) {
        if (i === syncedLines.length - 1 || currentTime < syncedLines[i + 1].time) {
          activeIndex = i;
          break;
        }
      }
    }
  }

  // Smoothly auto-scroll the active lyric into the center of the lyrics container
  useEffect(() => {
    if (activeLineRef.current && containerRef.current && !isEditing) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isEditing]);

  // Handle uploading an external .lrc file
  const handleLrcUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTrack) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseLRC(content);
        if (parsed.length > 0) {
          onUpdateTrackLyrics(currentTrack.id, {
            type: 'synced',
            syncedLines: parsed,
            source: 'lrc',
          });
        } else {
          // Fallback to plain text
          onUpdateTrackLyrics(currentTrack.id, {
            type: 'plain',
            plainText: content,
            source: 'lrc',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle starting edit
  const startEditing = () => {
    if (!currentTrack) return;
    if (hasSynced) {
      setEditText(exportToLRC(syncedLines, currentTrack.title, currentTrack.artist));
    } else {
      setEditText(currentTrack.lyrics?.plainText || '');
    }
    setIsEditing(true);
  };

  // Save edited lyrics
  const saveLyrics = () => {
    if (!currentTrack) return;
    const parsed = parseLRC(editText);
    if (parsed.length > 0) {
      onUpdateTrackLyrics(currentTrack.id, {
        type: 'synced',
        syncedLines: parsed,
        source: 'manual',
      });
    } else {
      onUpdateTrackLyrics(currentTrack.id, {
        type: 'plain',
        plainText: editText,
        source: 'manual',
      });
    }
    setIsEditing(false);
  };

  // Export .lrc file
  const handleExportLrc = () => {
    if (!currentTrack || !hasSynced) return;
    const content = exportToLRC(syncedLines, currentTrack.title, currentTrack.artist);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTrack.artist} - ${currentTrack.title}.lrc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentTrack) return null;

  const [c1, c2, c3] = currentTrack.accentColors || ['#fa2d48', '#581c87', '#0f172a'];

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col bg-[#0b0b0f] overflow-hidden select-none transition-all duration-300 ${
        isFullscreen ? 'top-0' : 'top-10 bottom-22'
      }`}
    >
      {/* Dynamic Animated Liquid Aurora Backdrop (Apple Music Signature) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        <div
          className="absolute -top-[30%] -left-[20%] w-[80vw] h-[80vw] rounded-full blur-[120px] animate-blob-1"
          style={{ background: c1 }}
        />
        <div
          className="absolute -bottom-[20%] -right-[20%] w-[90vw] h-[90vw] rounded-full blur-[140px] animate-blob-2"
          style={{ background: c2 }}
        />
        <div
          className="absolute top-[30%] left-[30%] w-[60vw] h-[60vw] rounded-full blur-[130px] animate-blob-3 opacity-70"
          style={{ background: c3 }}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[60px]" />
      </div>

      {/* Top Header bar with Track Info & Control Actions */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentTrack.artworkUrl}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-lg shadow-2xl object-cover border border-white/10"
          />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{currentTrack.title}</h2>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span>{currentTrack.artist}</span>
              <span>·</span>
              <span>{currentTrack.album}</span>
              {currentTrack.audioQuality.isHiResLossless && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#fa2d48]/20 text-[#fa2d48] border border-[#fa2d48]/30">
                  Hi-Res Lossless
                </span>
              )}
              {currentTrack.lyrics?.source === 'online' && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#0088ff]/20 text-[#00d4ff] border border-[#0088ff]/30 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  LRCLIB Synced
                </span>
              )}
            </div>
            {onlineStatus && (
              <div className="text-[11px] text-amber-300 animate-pulse mt-0.5">
                {onlineStatus}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Fetch Online Lyrics */}
          <button
            onClick={handleFetchOnlineLyrics}
            disabled={isFetchingOnline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0088ff]/20 hover:bg-[#0088ff]/30 text-xs text-[#00d4ff] transition-colors border border-[#0088ff]/30 disabled:opacity-50"
            title="Fetch synchronized lyrics online from LRCLIB"
          >
            {isFetchingOnline ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span>{isFetchingOnline ? 'Searching...' : 'Fetch Online'}</span>
          </button>

          {/* Import LRC */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white/90 cursor-pointer transition-colors border border-white/10">
            <Upload className="w-3.5 h-3.5" />
            <span>Import .LRC</span>
            <input
              type="file"
              accept=".lrc,.txt"
              onChange={handleLrcUpload}
              className="hidden"
            />
          </label>

          {/* Edit Lyrics */}
          <button
            onClick={isEditing ? saveLyrics : startEditing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white/90 transition-colors border border-white/10"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </>
            )}
          </button>

          {/* Export LRC if synced */}
          {hasSynced && (
            <button
              onClick={handleExportLrc}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors border border-white/10"
              title="Export as .LRC file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors border border-white/10"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors border border-white/10"
            title="Close Lyrics (Ctrl+L)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Lyrics Body */}
      <div
        ref={containerRef}
        className="relative z-10 flex-1 overflow-y-auto px-8 py-16 flex flex-col items-center justify-start text-center"
      >
        {isEditing ? (
          <div className="w-full max-w-3xl flex flex-col h-full">
            <div className="text-left text-xs text-white/60 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#fa2d48]" />
              Format as standard LRC timestamp lines: <code>[00:14.20] Hello lyrics text</code>
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 w-full p-4 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm leading-relaxed focus:outline-none focus:border-[#fa2d48] resize-none"
              rows={18}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveLyrics}
                className="px-5 py-2 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-sm text-white font-medium transition-colors shadow-lg"
              >
                Save Lyrics
              </button>
            </div>
          </div>
        ) : hasSynced ? (
          <div className="max-w-4xl w-full space-y-6 py-20">
            {syncedLines.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = activeIndex !== -1 && idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`cursor-pointer transition-all duration-300 py-2 px-6 rounded-2xl ${
                    isActive
                      ? 'text-white text-3xl md:text-4xl font-extrabold scale-105 drop-shadow-[0_4px_16px_rgba(255,255,255,0.3)] bg-white/[0.04]'
                      : isPast
                      ? 'text-white/40 text-2xl md:text-3xl font-bold hover:text-white/80'
                      : 'text-white/40 text-2xl md:text-3xl font-bold hover:text-white/80'
                  }`}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        ) : currentTrack.lyrics?.plainText ? (
          <div className="max-w-2xl w-full py-12">
            <div className="text-white/90 text-xl md:text-2xl font-semibold leading-loose whitespace-pre-line">
              {currentTrack.lyrics.plainText}
            </div>
            <div className="mt-12 p-4 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white/60 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Import an .LRC timestamp file to enjoy real-time karaoke synchronization!</span>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full my-auto flex flex-col items-center justify-center text-white/50 space-y-4">
            <AlertCircle className="w-12 h-12 text-white/20" />
            <h3 className="text-lg font-semibold text-white/80">No offline lyrics available</h3>
            <p className="text-xs text-white/50 text-center leading-relaxed">
              Import a .LRC file or use the editor to add lyrics for this track. Lyrics will be saved offline for instant playback.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleFetchOnlineLyrics}
                disabled={isFetchingOnline}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0088ff] to-[#00d4ff] hover:brightness-110 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isFetchingOnline ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Globe className="w-3.5 h-3.5" />
                )}
                <span>Fetch Online Lyrics</span>
              </button>
              <label className="px-4 py-2 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white text-xs font-medium cursor-pointer shadow-md transition-colors flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                <span>Import .LRC</span>
                <input
                  type="file"
                  accept=".lrc,.txt"
                  onChange={handleLrcUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={startEditing}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Write Lyrics</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
