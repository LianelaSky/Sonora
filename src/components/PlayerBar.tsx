import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Volume1,
  Quote, 
  ListMusic, 
  Sliders, 
  Activity, 
  Info,
  Heart,
  Radio
} from 'lucide-react';
import { Track } from '../types/music';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  showLyrics: boolean;
  showQueue: boolean;
  showVisualizer: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLyrics: () => void;
  onToggleQueue: () => void;
  onToggleVisualizer: () => void;
  onOpenEqualizer: () => void;
  onOpenShazam?: () => void;
  onToggleFavorite?: (trackId: string) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isShuffle,
  repeatMode,
  showLyrics,
  showQueue,
  showVisualizer,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLyrics,
  onToggleQueue,
  onToggleVisualizer,
  onOpenEqualizer,
  onOpenShazam,
  onToggleFavorite,
}) => {
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume || 0.8);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const remainingTime = duration > 0 ? duration - currentTime : 0;

  const handleMuteToggle = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(prevVolume || 0.7);
    }
  };

  return (
    <footer className="h-22 bg-[#181820]/95 border-t border-white/[0.08] px-4 flex items-center justify-between select-none shrink-0 z-40 backdrop-blur-3xl shadow-2xl relative">
      {/* LEFT: Playback Transport Controls */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
        {/* Shuffle */}
        <button
          onClick={onToggleShuffle}
          className={`p-2 rounded-full transition-colors relative ${
            isShuffle ? 'text-[#fa2d48]' : 'text-white/50 hover:text-white'
          }`}
          title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
        >
          <Shuffle className="w-4 h-4" />
          {isShuffle && <span className="w-1 h-1 bg-[#fa2d48] rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />}
        </button>

        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={!currentTrack}
          className="p-2 rounded-full text-white/70 hover:text-white disabled:opacity-30 disabled:hover:text-white/70 transition-colors"
          title="Previous Track (Ctrl+Left)"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        {/* Play / Pause (Apple Music signature button) */}
        <button
          onClick={onTogglePlay}
          disabled={!currentTrack}
          className="w-10 h-10 rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-30"
          title="Play / Pause (Space)"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={!currentTrack}
          className="p-2 rounded-full text-white/70 hover:text-white disabled:opacity-30 disabled:hover:text-white/70 transition-colors"
          title="Next Track (Ctrl+Right)"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>

        {/* Repeat */}
        <button
          onClick={onToggleRepeat}
          className={`p-2 rounded-full transition-colors relative ${
            repeatMode !== 'off' ? 'text-[#fa2d48]' : 'text-white/50 hover:text-white'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="w-4 h-4" />
          ) : (
            <Repeat className="w-4 h-4" />
          )}
          {repeatMode !== 'off' && (
            <span className="w-1 h-1 bg-[#fa2d48] rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
          )}
        </button>
      </div>

      {/* CENTER: Track Information & Apple Music Scrubber */}
      <div className="flex-1 max-w-2xl px-4 flex flex-col items-center justify-center">
        {currentTrack ? (
          <div className="w-full flex flex-col items-center">
            {/* Track Info Row */}
            <div className="flex items-center gap-2 mb-1.5 max-w-full">
              <span className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </span>
              <span className="text-white/40 text-xs">·</span>
              <span className="text-xs text-white/70 truncate hover:underline cursor-pointer">
                {currentTrack.artist}
              </span>

              {/* Audio Quality Badge (Apple Music Hi-Res Lossless badge) */}
              <button
                onClick={() => setShowQualityModal(!showQualityModal)}
                className={`ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded tracking-wider uppercase transition-colors ${
                  currentTrack.audioQuality.isHiResLossless
                    ? 'bg-[#fa2d48]/20 text-[#fa2d48] border border-[#fa2d48]/30 hover:bg-[#fa2d48]/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                title="View High-Resolution Audio Details"
              >
                {currentTrack.audioQuality.isHiResLossless ? 'Hi-Res Lossless' : 'Lossless'}
              </button>

              {/* Shazam Auto-Detect */}
              {onOpenShazam && (
                <button
                  onClick={onOpenShazam}
                  className="ml-0.5 p-1 rounded hover:bg-white/10 text-[#00d4ff] hover:text-white transition-colors"
                  title="Shazam: Auto-detect track and update file metadata"
                >
                  <Radio className="w-3 h-3 animate-pulse" />
                </button>
              )}

              {/* Favorite Heart */}
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(currentTrack.id)}
                  className={`p-1 transition-colors ${
                    currentTrack.isFavorite ? 'text-[#fa2d48]' : 'text-white/30 hover:text-white/70'
                  }`}
                  title={currentTrack.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${currentTrack.isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Scrubber Progress Slider */}
            <div className="w-full flex items-center gap-2.5 text-[11px] text-white/40 tabular-nums">
              <span className="w-9 text-right">{formatTime(currentTime)}</span>
              <div className="relative flex-1 flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => onSeek(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #fa2d48 0%, #fa2d48 ${
                      (currentTime / (duration || 1)) * 100
                    }%, rgba(255,255,255,0.18) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.18) 100%)`,
                  }}
                />
              </div>
              <span className="w-9">-{formatTime(remainingTime)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-white/30 italic">Select a track to start listening</div>
        )}
      </div>

      {/* RIGHT: Volume & Apple Music Secondary Tools */}
      <div className="flex items-center justify-end gap-2 w-1/4 min-w-[220px]">
        {/* Mini Visualizer Toggle */}
        <button
          onClick={onToggleVisualizer}
          className={`p-2 rounded-md transition-colors ${
            showVisualizer ? 'text-[#fa2d48] bg-white/[0.08]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Audio Spectrum Visualizer"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* Equalizer */}
        <button
          onClick={onOpenEqualizer}
          className="p-2 rounded-md text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
          title="10-Band Graphic Equalizer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Live Lyrics Button (Apple Music Speech Bubble with Quotes) */}
        <button
          onClick={onToggleLyrics}
          disabled={!currentTrack}
          className={`p-2 rounded-md transition-all relative ${
            showLyrics 
              ? 'text-white bg-[#fa2d48] shadow-md shadow-[#fa2d48]/20' 
              : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
          } disabled:opacity-30`}
          title="Offline Live Lyrics (Ctrl+L)"
        >
          <Quote className="w-4 h-4" />
          {currentTrack?.lyrics?.syncedLines && !showLyrics && (
            <span className="w-1.5 h-1.5 bg-[#fa2d48] rounded-full absolute top-1.5 right-1.5" />
          )}
        </button>

        {/* Up Next Queue */}
        <button
          onClick={onToggleQueue}
          className={`p-2 rounded-md transition-colors ${
            showQueue ? 'text-[#fa2d48] bg-white/[0.08]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Up Next Playing Queue (Ctrl+U)"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Slider with Mute Button */}
        <div className="flex items-center gap-1.5 ml-1">
          <button
            onClick={handleMuteToggle}
            className="p-1 text-white/50 hover:text-white transition-colors"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="w-20 flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                  volume * 100
                }%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Popover: Audio Quality Details */}
      {showQualityModal && currentTrack && (
        <div className="absolute bottom-24 right-1/3 w-80 bg-[#1c1c24] border border-white/10 rounded-xl p-4 shadow-2xl z-50 text-xs text-white backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-sm flex items-center gap-1.5 text-white">
              <Info className="w-4 h-4 text-[#fa2d48]" />
              Audio Quality Specifications
            </span>
            <button
              onClick={() => setShowQualityModal(false)}
              className="text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 space-y-2 text-white/80">
            <div className="flex justify-between">
              <span className="text-white/40">Encoding</span>
              <span className="font-mono text-white font-medium">{currentTrack.audioQuality.format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Sample Rate</span>
              <span className="font-mono text-white font-medium">
                {(currentTrack.audioQuality.sampleRate / 1000).toFixed(1)} kHz
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Bit Depth</span>
              <span className="font-mono text-white font-medium">{currentTrack.audioQuality.bitDepth}-bit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Bitrate</span>
              <span className="font-mono text-white font-medium">{currentTrack.audioQuality.bitrate} kbps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Local Storage</span>
              <span className="font-mono text-white/60 truncate max-w-[150px]">
                {(currentTrack.fileSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-white/50 leading-relaxed">
            {currentTrack.audioQuality.isHiResLossless
              ? 'Studio Master grade audio matching the original recording resolution. Requires a compatible high-resolution external DAC.'
              : 'Lossless audio preserving bit-for-bit audio fidelity without perceptual compression artifacts.'}
          </div>
        </div>
      )}
    </footer>
  );
};
