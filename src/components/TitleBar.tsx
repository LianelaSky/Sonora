import React from 'react';
import { Minus, Square, X, Music, Sliders, Keyboard, Disc, Search, Radio, Download, AppWindow } from 'lucide-react';
import { Track } from '../types/music';
import { windowsNative } from '../services/windowsNative';

interface TitleBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onToggleMiniPlayer: () => void;
  isMiniPlayer: boolean;
  onOpenEqualizer: () => void;
  onOpenShortcuts: () => void;
  onOpenSearch: () => void;
  onOpenShazam: () => void;
  onOpenWindowsInstall?: () => void;
  searchQuery: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  currentTrack,
  isPlaying,
  onToggleMiniPlayer,
  isMiniPlayer,
  onOpenEqualizer,
  onOpenShortcuts,
  onOpenSearch,
  onOpenShazam,
  onOpenWindowsInstall,
  searchQuery
}) => {
  const handleMinimize = () => {
    windowsNative.minimize(onToggleMiniPlayer);
  };

  const handleMaximize = () => {
    windowsNative.maximize();
  };

  const handleClose = () => {
    windowsNative.close(() => {
      if (confirm('Minimize Sonora Music to background? Audio will continue playing.')) {
        onToggleMiniPlayer();
      }
    });
  };

  return (
    <div className="h-10 bg-[#121217]/95 border-b border-white/[0.06] select-none flex items-center justify-between px-3 text-xs text-white/70 z-50 shrink-0 backdrop-blur-md">
      {/* Left: App Logo & Windows Navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-white tracking-wide">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#fa2d48] to-[#fb5e74] flex items-center justify-center shadow-sm">
            <Music className="w-3 h-3 text-white" />
          </div>
          <span className="text-[13px] font-medium tracking-tight">Sonora</span>
          <span className="text-[11px] text-white/40 font-normal">Music</span>
        </div>

        <div className="h-3.5 w-px bg-white/10 mx-1" />

        {/* Global Quick Search Shortcut Affordance */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.09] text-white/60 hover:text-white transition-colors text-[11px] border border-white/[0.04]"
          title="Search library and lyrics (Ctrl+F)"
        >
          <Search className="w-3 h-3 text-white/50" />
          <span>{searchQuery ? searchQuery : 'Search library & lyrics...'}</span>
          <kbd className="px-1.5 py-0.5 text-[9px] bg-black/40 rounded border border-white/10 text-white/40 font-mono">
            Ctrl+F
          </kbd>
        </button>
      </div>

      {/* Center: Subtle Now Playing Caption */}
      <div className="hidden md:flex items-center gap-2 max-w-sm truncate text-center text-white/60 text-[11px]">
        {currentTrack ? (
          <div className="flex items-center gap-2 truncate">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#fa2d48] animate-pulse' : 'bg-white/30'}`} />
            <span className="text-white/90 font-medium truncate">{currentTrack.title}</span>
            <span className="text-white/40">·</span>
            <span className="text-white/60 truncate">{currentTrack.artist}</span>
            {currentTrack.audioQuality.isHiResLossless && (
              <span className="px-1.5 py-0.2 bg-[#fa2d48]/20 text-[#fa2d48] text-[9px] font-semibold rounded tracking-wider">
                HI-RES
              </span>
            )}
          </div>
        ) : (
          <span className="text-white/30">Sonora for Windows — High-Resolution Local Audio</span>
        )}
      </div>

      {/* Right: Quick Tools & Windows 11 Caption Controls */}
      <div className="flex items-center gap-1">
        {/* Shazam Song Detection */}
        <button
          onClick={onOpenShazam}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0088ff]/15 hover:bg-[#0088ff]/25 text-[#00d4ff] text-[11px] font-semibold border border-[#0088ff]/25 transition-colors"
          title="Shazam: Auto-detect playing audio and update file metadata"
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="hidden lg:inline">Shazam</span>
        </button>

        {/* Windows Native Install Action */}
        {onOpenWindowsInstall && !windowsNative.isStandalonePWA() && (
          <button
            onClick={onOpenWindowsInstall}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0078d4]/20 hover:bg-[#0078d4]/30 text-[#2b88d8] text-[11px] font-semibold border border-[#0078d4]/30 transition-colors"
            title="Install Sonora as a Native Windows App"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        <button
          onClick={onOpenEqualizer}
          className="p-1.5 rounded hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors"
          title="10-Band Graphic Equalizer"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors"
          title="Keyboard Shortcuts (Ctrl+,)"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleMiniPlayer}
          className={`p-1.5 rounded transition-colors ${
            isMiniPlayer ? 'bg-[#fa2d48]/20 text-[#fa2d48]' : 'hover:bg-white/[0.08] text-white/60 hover:text-white'
          }`}
          title="Mini Player Mode (Ctrl+M)"
        >
          <Disc className="w-3.5 h-3.5" />
        </button>

        {/* Windows 11 Caption Control Buttons */}
        <div className="flex items-center ml-2 border-l border-white/[0.08] pl-1">
          <button
            onClick={handleMinimize}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
            title="Maximize"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-600 text-white/70 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
