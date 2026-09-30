import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Track, 
  LibraryViewMode, 
  SmartPlaylist, 
  UserPlaylist, 
  LocalStorageFolder, 
  KeyboardShortcutConfig 
} from './types/music';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { LibraryView } from './components/LibraryView';
import { LyricsView } from './components/LyricsView';
import { LocalFoldersView } from './components/LocalFoldersView';
import { SmartPlaylistModal } from './components/SmartPlaylistModal';
import { EqualizerModal } from './components/EqualizerModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { MiniPlayer } from './components/MiniPlayer';
import { AudioVisualizer } from './components/AudioVisualizer';
import { QueueDrawer } from './components/QueueDrawer';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { ShazamModal } from './components/ShazamModal';
import { audioEngine } from './services/audioEngine';
import { musicDb } from './services/db';
import { 
  INITIAL_TRACKS, 
  DEFAULT_SMART_PLAYLISTS, 
  DEFAULT_LOCAL_FOLDERS, 
  DEFAULT_KEYBOARD_SHORTCUTS,
  DEFAULT_EQUALIZER_PRESETS,
  evaluateSmartPlaylist 
} from './services/sampleData';

export default function App() {
  // Library & Data State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [smartPlaylists, setSmartPlaylists] = useState<SmartPlaylist[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [folders, setFolders] = useState<LocalStorageFolder[]>([]);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutConfig[]>(DEFAULT_KEYBOARD_SHORTCUTS);

  // Navigation State
  const [currentView, setCurrentView] = useState<LibraryViewMode>('listen-now');
  const [selectedSmartPlaylistId, setSelectedSmartPlaylistId] = useState<string | null>(null);
  const [selectedUserPlaylistId, setSelectedUserPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Track[]>([]);

  // Audio Processing State
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [soundCheckEnabled, setSoundCheckEnabled] = useState<boolean>(true);

  // UI Modal & Panel States
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [showQueue, setShowQueue] = useState<boolean>(false);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(false);
  const [showEqualizer, setShowEqualizer] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [showSmartModal, setShowSmartModal] = useState<boolean>(false);
  const [editingSmartPlaylist, setEditingSmartPlaylist] = useState<SmartPlaylist | null>(null);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState<boolean>(false);
  const [showShazamModal, setShowShazamModal] = useState<boolean>(false);
  const [shazamTrack, setShazamTrack] = useState<Track | null>(null);
  const [isMiniPlayer, setIsMiniPlayer] = useState<boolean>(false);
  const [isSyncingFolders, setIsSyncingFolders] = useState<boolean>(false);

  // References for playback callbacks
  const currentTrackRef = useRef<Track | null>(null);
  currentTrackRef.current = currentTrack;
  const queueRef = useRef<Track[]>([]);
  queueRef.current = queue;
  const isShuffleRef = useRef<boolean>(false);
  isShuffleRef.current = isShuffle;
  const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');
  repeatModeRef.current = repeatMode;
  const tracksRef = useRef<Track[]>([]);
  tracksRef.current = tracks;

  // Initialize DB and Load Data
  useEffect(() => {
    async function initData() {
      try {
        let loadedTracks = await musicDb.getAllTracks();
        if (loadedTracks.length === 0) {
          // Seed with high-res demo tracks
          await musicDb.saveTracks(INITIAL_TRACKS);
          loadedTracks = INITIAL_TRACKS;
        }

        let loadedSmart = await musicDb.getAllSmartPlaylists();
        if (loadedSmart.length === 0) {
          for (const sp of DEFAULT_SMART_PLAYLISTS) {
            await musicDb.saveSmartPlaylist(sp);
          }
          loadedSmart = DEFAULT_SMART_PLAYLISTS;
        }

        const loadedPlaylists = await musicDb.getAllPlaylists();

        let loadedFolders = await musicDb.getAllFolders();
        if (loadedFolders.length === 0) {
          for (const f of DEFAULT_LOCAL_FOLDERS) {
            await musicDb.saveFolder(f);
          }
          loadedFolders = DEFAULT_LOCAL_FOLDERS;
        }

        const savedGains = await musicDb.getSetting<number[]>('eqGains', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const savedShortcuts = await musicDb.getSetting<KeyboardShortcutConfig[]>('shortcuts', DEFAULT_KEYBOARD_SHORTCUTS);
        const savedSoundCheck = await musicDb.getSetting<boolean>('soundCheck', true);

        setTracks(loadedTracks);
        setSmartPlaylists(loadedSmart);
        setUserPlaylists(loadedPlaylists);
        setFolders(loadedFolders);
        setEqGains(savedGains);
        setShortcuts(savedShortcuts);
        setSoundCheckEnabled(savedSoundCheck);

        // Pre-populate queue with first few tracks
        if (loadedTracks.length > 0) {
          setCurrentTrack(loadedTracks[0]);
          setDuration(loadedTracks[0].duration);
          setQueue(loadedTracks.slice(1));
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }

    initData();
  }, []);

  // Setup Audio Engine callbacks & Media Session background handlers
  useEffect(() => {
    audioEngine.onTimeUpdate = (curr, dur) => {
      setCurrentTime(curr);
      if (dur > 0) setDuration(dur);
    };

    audioEngine.onPlayStateChange = (playing) => {
      setIsPlaying(playing);
    };

    audioEngine.onEnded = () => {
      handleNextTrack();
    };

    audioEngine.setMediaSessionHandlers({
      onPlay: () => handleTogglePlay(),
      onPause: () => handleTogglePlay(),
      onNext: () => handleNextTrack(),
      onPrev: () => handlePrevTrack(),
      onSeek: (seconds) => audioEngine.seek(seconds),
    });

    audioEngine.setVolume(volume);
  }, []);

  // Audio Playback Handlers
  const handlePlayTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration);

    // Increment play count
    const updatedTrack: Track = {
      ...track,
      playCount: track.playCount + 1,
      lastPlayed: new Date().toISOString(),
    };

    setTracks((prev) => prev.map((t) => (t.id === track.id ? updatedTrack : t)));
    musicDb.saveTrack(updatedTrack).catch(() => {});

    // Update queue if not provided
    if (newQueue) {
      setQueue(newQueue.filter((t) => t.id !== track.id));
    } else {
      const idx = tracksRef.current.findIndex((t) => t.id === track.id);
      if (idx !== -1) {
        setQueue(tracksRef.current.slice(idx + 1));
      }
    }

    // Play via Audio Engine
    await audioEngine.playTrack(track, 0);
  }, []);

  const handleTogglePlay = useCallback(async () => {
    if (!currentTrackRef.current) {
      if (tracksRef.current.length > 0) {
        handlePlayTrack(tracksRef.current[0]);
      }
      return;
    }
    await audioEngine.togglePlay(isPlaying);
  }, [isPlaying, handlePlayTrack]);

  const handleNextTrack = useCallback(() => {
    if (repeatModeRef.current === 'one' && currentTrackRef.current) {
      audioEngine.seek(0);
      audioEngine.playTrack(currentTrackRef.current, 0);
      return;
    }

    if (queueRef.current.length > 0) {
      const next = queueRef.current[0];
      const remainingQueue = queueRef.current.slice(1);
      handlePlayTrack(next, remainingQueue);
    } else if (repeatModeRef.current === 'all' && tracksRef.current.length > 0) {
      handlePlayTrack(tracksRef.current[0]);
    } else {
      audioEngine.stopAll();
      setIsPlaying(false);
    }
  }, [handlePlayTrack]);

  const handlePrevTrack = useCallback(() => {
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }

    const currentIdx = tracksRef.current.findIndex((t) => t.id === currentTrackRef.current?.id);
    if (currentIdx > 0) {
      handlePlayTrack(tracksRef.current[currentIdx - 1]);
    } else {
      audioEngine.seek(0);
    }
  }, [currentTime, handlePlayTrack]);

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
    if (!isShuffle && queue.length > 0) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
    }
  };

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const handleToggleFavorite = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const updated = { ...t, isFavorite: !t.isFavorite };
          musicDb.saveTrack(updated).catch(() => {});
          return updated;
        }
        return t;
      })
    );
  };

  const handleUpdateTrackLyrics = (trackId: string, lyrics: Track['lyrics']) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const updated = { ...t, lyrics };
          musicDb.saveTrack(updated).catch(() => {});
          if (currentTrack?.id === trackId) {
            setCurrentTrack(updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      for (const s of shortcuts) {
        const matchesKey =
          (s.currentKey === 'Space' && key === ' ') ||
          s.currentKey.toLowerCase() === key.toLowerCase();

        const matchesModifiers =
          (!s.requiresCtrl || ctrl) &&
          (!s.requiresShift || shift) &&
          (!s.requiresAlt || alt);

        if (matchesKey && matchesModifiers) {
          e.preventDefault();

          switch (s.id) {
            case 'play_pause':
              handleTogglePlay();
              break;
            case 'next_track':
              handleNextTrack();
              break;
            case 'prev_track':
              handlePrevTrack();
              break;
            case 'volume_up':
              handleVolumeChange(Math.min(1, volume + 0.05));
              break;
            case 'volume_down':
              handleVolumeChange(Math.max(0, volume - 0.05));
              break;
            case 'toggle_lyrics':
              setShowLyrics((prev) => !prev);
              break;
            case 'toggle_queue':
              setShowQueue((prev) => !prev);
              break;
            case 'focus_search': {
              const searchInput = document.getElementById('sidebar-search-input');
              if (searchInput) searchInput.focus();
              break;
            }
            case 'toggle_mini':
              setIsMiniPlayer((prev) => !prev);
              break;
            case 'sync_folders':
              setCurrentView('folders');
              break;
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, volume, handleTogglePlay, handleNextTrack, handlePrevTrack]);

  // Compute displayed tracks based on current view or playlist
  const displayedTracks = React.useMemo(() => {
    if (currentView === 'smart-playlist' && selectedSmartPlaylistId) {
      const pl = smartPlaylists.find((p) => p.id === selectedSmartPlaylistId);
      if (pl) return evaluateSmartPlaylist(pl, tracks);
    }
    if (currentView === 'playlist' && selectedUserPlaylistId) {
      const pl = userPlaylists.find((p) => p.id === selectedUserPlaylistId);
      if (pl) {
        return tracks.filter((t) => pl.trackIds.includes(t.id));
      }
    }
    return tracks;
  }, [currentView, selectedSmartPlaylistId, selectedUserPlaylistId, smartPlaylists, userPlaylists, tracks]);

  const currentSmartPlaylist = smartPlaylists.find((p) => p.id === selectedSmartPlaylistId) || null;
  const currentPlaylist = userPlaylists.find((p) => p.id === selectedUserPlaylistId) || null;

  // Save EQ Gains
  const handleSaveEqGains = (gains: number[]) => {
    setEqGains(gains);
    audioEngine.setEqGains(gains);
    musicDb.setSetting('eqGains', gains).catch(() => {});
  };

  // Save Shortcuts
  const handleSaveShortcuts = (newShortcuts: KeyboardShortcutConfig[]) => {
    setShortcuts(newShortcuts);
    musicDb.setSetting('shortcuts', newShortcuts).catch(() => {});
  };

  // Save Smart Playlist
  const handleSaveSmartPlaylist = async (playlist: SmartPlaylist) => {
    await musicDb.saveSmartPlaylist(playlist);
    setSmartPlaylists((prev) => {
      const exists = prev.some((p) => p.id === playlist.id);
      return exists ? prev.map((p) => (p.id === playlist.id ? playlist : p)) : [...prev, playlist];
    });
    setSelectedSmartPlaylistId(playlist.id);
    setCurrentView('smart-playlist');
    setShowSmartModal(false);
  };

  // Create User Playlist
  const handleCreateUserPlaylist = async (name: string, description: string) => {
    const newPlaylist: UserPlaylist = {
      id: 'pl_' + Math.random().toString(36).substring(2, 9),
      name,
      description,
      trackIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSmart: false,
    };
    await musicDb.savePlaylist(newPlaylist);
    setUserPlaylists((prev) => [...prev, newPlaylist]);
    setSelectedUserPlaylistId(newPlaylist.id);
    setCurrentView('playlist');
  };

  // Shazam Auto-Detect & Update File Metadata
  const handleOpenShazam = (track?: Track) => {
    setShazamTrack(track || currentTrack);
    setShowShazamModal(true);
  };

  const handleApplyShazamMetadata = async (trackId: string, updates: Partial<Track>) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const updated = { ...t, ...updates };
          musicDb.saveTrack(updated).catch(() => {});
          if (currentTrack?.id === trackId) {
            setCurrentTrack(updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d0d12] text-[#f5f5f7] overflow-hidden select-none font-sans">
      {/* Windows 11 Title Bar */}
      <TitleBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onToggleMiniPlayer={() => setIsMiniPlayer(!isMiniPlayer)}
        isMiniPlayer={isMiniPlayer}
        onOpenEqualizer={() => setShowEqualizer(true)}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onOpenShazam={() => handleOpenShazam()}
        onOpenSearch={() => {
          setCurrentView('search');
          const input = document.getElementById('sidebar-search-input');
          if (input) input.focus();
        }}
        searchQuery={searchQuery}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Apple Music Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
            setSelectedSmartPlaylistId(null);
            setSelectedUserPlaylistId(null);
          }}
          smartPlaylists={smartPlaylists}
          selectedSmartPlaylistId={selectedSmartPlaylistId}
          onSelectSmartPlaylist={(id) => {
            setSelectedSmartPlaylistId(id);
            setSelectedUserPlaylistId(null);
            setCurrentView('smart-playlist');
          }}
          userPlaylists={userPlaylists}
          selectedUserPlaylistId={selectedUserPlaylistId}
          onSelectUserPlaylist={(id) => {
            setSelectedUserPlaylistId(id);
            setSelectedSmartPlaylistId(null);
            setCurrentView('playlist');
          }}
          onCreateSmartPlaylist={() => {
            setEditingSmartPlaylist(null);
            setShowSmartModal(true);
          }}
          onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSyncingFolders={isSyncingFolders}
          totalTrackCount={tracks.length}
        />

        {/* Primary Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#15151c] to-[#0d0d12]">
          {currentView === 'folders' ? (
            <LocalFoldersView
              folders={folders}
              tracks={tracks}
              onFoldersUpdated={(updatedFolders) => setFolders(updatedFolders)}
              onTracksUpdated={(updatedTracks) => setTracks(updatedTracks)}
              onPlayTrack={handlePlayTrack}
            />
          ) : (
            <LibraryView
              viewMode={currentView}
              tracks={displayedTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onTogglePlay={handleTogglePlay}
              onToggleFavorite={handleToggleFavorite}
              onOpenLyrics={() => setShowLyrics(true)}
              onIdentifyTrack={(track) => handleOpenShazam(track)}
              smartPlaylists={smartPlaylists}
              currentSmartPlaylist={currentSmartPlaylist}
              currentPlaylist={currentPlaylist}
              onEditSmartPlaylist={(sp) => {
                setEditingSmartPlaylist(sp);
                setShowSmartModal(true);
              }}
              searchQuery={searchQuery}
            />
          )}
        </main>

        {/* Up Next Queue Drawer */}
        {showQueue && (
          <QueueDrawer
            currentTrack={currentTrack}
            queue={queue}
            onPlayTrack={(track) => handlePlayTrack(track)}
            onClearQueue={() => setQueue([])}
            onClose={() => setShowQueue(false)}
          />
        )}
      </div>

      {/* Apple Music Bottom Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        showLyrics={showLyrics}
        showQueue={showQueue}
        showVisualizer={showVisualizer}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onToggleLyrics={() => setShowLyrics(!showLyrics)}
        onToggleQueue={() => setShowQueue(!showQueue)}
        onToggleVisualizer={() => setShowVisualizer(!showVisualizer)}
        onOpenEqualizer={() => setShowEqualizer(true)}
        onOpenShazam={() => handleOpenShazam()}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Live Lyrics Full Overlay */}
      {showLyrics && (
        <LyricsView
          currentTrack={currentTrack}
          currentTime={currentTime}
          onSeek={handleSeek}
          onClose={() => setShowLyrics(false)}
          onUpdateTrackLyrics={handleUpdateTrackLyrics}
        />
      )}

      {/* Real-time Spectrum Analyzer */}
      {showVisualizer && (
        <AudioVisualizer
          isPlaying={isPlaying}
          onClose={() => setShowVisualizer(false)}
        />
      )}

      {/* Floating Windows MiniPlayer */}
      {isMiniPlayer && (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={handleTogglePlay}
          onPrev={handlePrevTrack}
          onNext={handleNextTrack}
          onSeek={handleSeek}
          onRestore={() => setIsMiniPlayer(false)}
          onOpenLyrics={() => setShowLyrics(true)}
        />
      )}

      {/* Modals */}
      {showEqualizer && (
        <EqualizerModal
          eqGains={eqGains}
          onChangeGains={handleSaveEqGains}
          soundCheckEnabled={soundCheckEnabled}
          onToggleSoundCheck={() => setSoundCheckEnabled(!soundCheckEnabled)}
          onClose={() => setShowEqualizer(false)}
        />
      )}

      {showShortcuts && (
        <ShortcutsModal
          shortcuts={shortcuts}
          onSaveShortcuts={handleSaveShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      )}

      {showSmartModal && (
        <SmartPlaylistModal
          initialPlaylist={editingSmartPlaylist}
          allTracks={tracks}
          onSave={handleSaveSmartPlaylist}
          onClose={() => {
            setShowSmartModal(false);
            setEditingSmartPlaylist(null);
          }}
        />
      )}

      {showCreatePlaylistModal && (
        <CreatePlaylistModal
          onSave={handleCreateUserPlaylist}
          onClose={() => setShowCreatePlaylistModal(false)}
        />
      )}

      {/* Shazam Song Detection Modal */}
      {showShazamModal && (
        <ShazamModal
          track={shazamTrack || currentTrack}
          onApplyMetadata={handleApplyShazamMetadata}
          onClose={() => setShowShazamModal(false)}
        />
      )}
    </div>
  );
}
