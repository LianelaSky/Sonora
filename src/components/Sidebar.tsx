import React from 'react';
import { 
  Search, 
  Clock, 
  Users, 
  Disc, 
  Music2, 
  Layers, 
  Folder, 
  Sparkles, 
  Plus, 
  ListMusic,
  CheckCircle2,
  RefreshCw,
  Radio,
  Download
} from 'lucide-react';
import { LibraryViewMode, SmartPlaylist, UserPlaylist } from '../types/music';

interface SidebarProps {
  currentView: LibraryViewMode;
  onSelectView: (view: LibraryViewMode) => void;
  smartPlaylists: SmartPlaylist[];
  selectedSmartPlaylistId: string | null;
  onSelectSmartPlaylist: (id: string) => void;
  userPlaylists: UserPlaylist[];
  selectedUserPlaylistId: string | null;
  onSelectUserPlaylist: (id: string) => void;
  onCreateSmartPlaylist: () => void;
  onCreatePlaylist: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSyncingFolders: boolean;
  totalTrackCount: number;
  onOpenWindowsInstall?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  smartPlaylists,
  selectedSmartPlaylistId,
  onSelectSmartPlaylist,
  userPlaylists,
  selectedUserPlaylistId,
  onSelectUserPlaylist,
  onCreateSmartPlaylist,
  onCreatePlaylist,
  searchQuery,
  onSearchChange,
  isSyncingFolders,
  totalTrackCount,
  onOpenWindowsInstall,
}) => {
  const libraryItems = [
    { id: 'listen-now' as LibraryViewMode, label: 'Listen Now', icon: Radio },
    { id: 'recently-added' as LibraryViewMode, label: 'Recently Added', icon: Clock },
    { id: 'artists' as LibraryViewMode, label: 'Artists', icon: Users },
    { id: 'albums' as LibraryViewMode, label: 'Albums', icon: Disc },
    { id: 'songs' as LibraryViewMode, label: 'Songs', icon: Music2 },
    { id: 'genres' as LibraryViewMode, label: 'Genres', icon: Layers },
    { 
      id: 'folders' as LibraryViewMode, 
      label: 'Local Storage Folders', 
      icon: Folder, 
      extraBadge: isSyncingFolders ? 'Syncing...' : undefined 
    },
  ];

  return (
    <aside className="w-64 bg-[#16161c]/95 border-r border-white/[0.06] flex flex-col h-full select-none text-sm shrink-0 backdrop-blur-2xl">
      {/* Search Bar matching Apple Music Windows */}
      <div className="p-3 pb-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
          <input
            id="sidebar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentView !== 'search') {
                onSelectView('search');
              }
            }}
            placeholder="Search"
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] text-xs text-white placeholder-white/40 border border-white/[0.04] focus:border-white/20 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-white/40 hover:text-white text-xs p-0.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-6">
        {/* Library Section */}
        <div>
          <div className="px-3 pb-1 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
            Library
          </div>
          <div className="space-y-0.5">
            {libraryItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id && !selectedSmartPlaylistId && !selectedUserPlaylistId;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    isActive
                      ? 'bg-[#fa2d48] text-white font-medium shadow-sm'
                      : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#fa2d48]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.extraBadge && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-300 font-normal">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      {item.extraBadge}
                    </span>
                  )}
                  {item.id === 'songs' && totalTrackCount > 0 && !isActive && (
                    <span className="text-[11px] text-white/40 tabular-nums">
                      {totalTrackCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Playlists Section */}
        <div>
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
              Smart Playlists
            </span>
            <button
              onClick={onCreateSmartPlaylist}
              className="text-white/40 hover:text-[#fa2d48] transition-colors p-0.5"
              title="Create New Smart Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {smartPlaylists.map((pl) => {
              const isActive = currentView === 'smart-playlist' && selectedSmartPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => onSelectSmartPlaylist(pl.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-colors text-left ${
                    isActive
                      ? 'bg-[#fa2d48] text-white font-medium shadow-sm'
                      : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                  <span className="truncate flex-1">{pl.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Playlists Section */}
        <div>
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
              Playlists
            </span>
            <button
              onClick={onCreatePlaylist}
              className="text-white/40 hover:text-[#fa2d48] transition-colors p-0.5"
              title="Create New Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {userPlaylists.length === 0 ? (
              <div className="px-3 py-2 text-xs text-white/30 italic">
                No user playlists yet
              </div>
            ) : (
              userPlaylists.map((pl) => {
                const isActive = currentView === 'playlist' && selectedUserPlaylistId === pl.id;
                return (
                  <button
                    key={pl.id}
                    onClick={() => onSelectUserPlaylist(pl.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-colors text-left ${
                      isActive
                        ? 'bg-[#fa2d48] text-white font-medium shadow-sm'
                        : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <ListMusic className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/40'}`} />
                    <span className="truncate flex-1">{pl.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Audio Engine Hardware Status Badge & Windows Native App Install (Apple Music style) */}
      <div className="p-3 border-t border-white/[0.06] bg-black/20 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-white/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>High-Res Audio Engine</span>
          </div>
          <span className="text-[10px] text-white/40 font-mono">24/96 DAC</span>
        </div>
        <div className="text-[10px] text-white/30 truncate">
          Offline Storage & Background Active
        </div>

        {onOpenWindowsInstall && (
          <button
            onClick={onOpenWindowsInstall}
            className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-white/[0.05] hover:bg-[#0078d4]/20 border border-white/10 hover:border-[#0078d4]/40 text-[#2b88d8] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Install Windows Desktop App</span>
          </button>
        )}
      </div>
    </aside>
  );
};
