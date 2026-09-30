import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Quote, Volume2, Sparkles } from 'lucide-react';
import { Track } from '../types/music';

interface MiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onRestore: () => void;
  onOpenLyrics: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onRestore,
  onOpenLyrics,
}) => {
  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[#16161e]/95 border border-white/15 rounded-2xl p-3.5 shadow-2xl backdrop-blur-3xl select-none text-white">
      {/* Top Bar with Restore button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] text-[11px] text-white/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#fa2d48]" />
          <span className="font-semibold text-white/80">Sonora MiniPlayer</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenLyrics}
            className="p-1 hover:text-white transition-colors"
            title="Lyrics"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRestore}
            className="p-1 hover:text-white transition-colors"
            title="Expand to Full Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center gap-3">
        <img
          src={currentTrack.artworkUrl}
          alt={currentTrack.title}
          className="w-14 h-14 rounded-lg object-cover shadow-md border border-white/10 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xs truncate">{currentTrack.title}</div>
          <div className="text-[11px] text-white/60 truncate">{currentTrack.artist}</div>
          {currentTrack.audioQuality.isHiResLossless && (
            <span className="text-[9px] text-[#fa2d48] font-bold">24-bit Hi-Res</span>
          )}
        </div>
      </div>

      {/* Scrubber */}
      <div className="mt-3">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #fa2d48 0%, #fa2d48 ${
              (currentTime / (duration || 1)) * 100
            }%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-white/40 tabular-nums mt-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-1">
        <button
          onClick={onPrev}
          className="p-1.5 text-white/70 hover:text-white transition-colors"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>
        <button
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
        <button
          onClick={onNext}
          className="p-1.5 text-white/70 hover:text-white transition-colors"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};
