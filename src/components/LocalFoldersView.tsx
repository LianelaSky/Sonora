import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  RefreshCw, 
  Sparkles, 
  Trash2, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  Image, 
  FileAudio,
  ArrowRight,
  Info
} from 'lucide-react';
import { LocalStorageFolder, Track } from '../types/music';
import { folderSync, SyncProgress } from '../services/folderSync';
import { musicDb } from '../services/db';

interface LocalFoldersViewProps {
  folders: LocalStorageFolder[];
  tracks: Track[];
  onFoldersUpdated: (folders: LocalStorageFolder[], newTracks?: Track[]) => void;
  onTracksUpdated: (tracks: Track[]) => void;
  onPlayTrack: (track: Track) => void;
}

export const LocalFoldersView: React.FC<LocalFoldersViewProps> = ({
  folders,
  tracks,
  onFoldersUpdated,
  onTracksUpdated,
  onPlayTrack,
}) => {
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [artFetchProgress, setArtFetchProgress] = useState<{ current: number; total: number; trackTitle: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Modern Directory Picker (Chrome/Edge on Windows)
  const handleAddFolderDirectoryPicker = async () => {
    try {
      const handle = await folderSync.pickDirectory();
      if (!handle) return;

      const defaultPath = `C:\\Music\\${handle.name}`;
      const { folder, newTracks } = await folderSync.scanDirectoryHandle(handle, defaultPath, (prog) => {
        setSyncProgress(prog);
      });

      // Save to IndexedDB
      await musicDb.saveFolder(folder);
      await musicDb.saveTracks(newTracks);

      const updatedFolders = [...folders, folder];
      const updatedTracks = [...tracks, ...newTracks];

      onFoldersUpdated(updatedFolders, newTracks);
      onTracksUpdated(updatedTracks);
      setSyncProgress(null);
    } catch (err) {
      console.error('Failed to import directory:', err);
      setSyncProgress(null);
    }
  };

  // Fallback webkitdirectory file input
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const folderName = files[0].webkitRelativePath?.split('/')[0] || 'Imported Music';
    try {
      const { folder, newTracks } = await folderSync.scanFileList(files, folderName, (prog) => {
        setSyncProgress(prog);
      });

      await musicDb.saveFolder(folder);
      await musicDb.saveTracks(newTracks);

      onFoldersUpdated([...folders, folder], newTracks);
      onTracksUpdated([...tracks, ...newTracks]);
      setSyncProgress(null);
    } catch (err) {
      console.error('Scan error:', err);
      setSyncProgress(null);
    }
  };

  // Re-sync all local folders
  const handleResyncAll = async () => {
    setSyncProgress({
      status: 'scanning',
      folderName: 'All Library Folders',
      filesFound: tracks.length,
      filesProcessed: 0,
    });

    // Update timestamps and refresh tracks from DB
    const updated = folders.map((f) => ({
      ...f,
      lastSynced: new Date().toISOString(),
      status: 'synced' as const,
    }));

    for (const f of updated) {
      await musicDb.saveFolder(f);
    }

    setTimeout(() => {
      onFoldersUpdated(updated);
      setSyncProgress(null);
    }, 800);
  };

  // Remove a folder from library
  const handleRemoveFolder = async (folderId: string) => {
    if (!confirm('Remove this folder from your library? Audio files on disk will not be deleted.')) return;

    await musicDb.deleteFolder(folderId);
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    const updatedTracks = tracks.filter((t) => t.folderId !== folderId);

    // Clean up tracks
    const removedTracks = tracks.filter((t) => t.folderId === folderId);
    for (const t of removedTracks) {
      await musicDb.deleteTrack(t.id);
    }

    onFoldersUpdated(updatedFolders);
    onTracksUpdated(updatedTracks);
  };

  // Batch automatic album art fetching for all tracks
  const handleFetchAllArtwork = async () => {
    const tracksToFetch = tracks;
    setArtFetchProgress({ current: 0, total: tracksToFetch.length, trackTitle: 'Starting...' });

    const updated = await folderSync.fetchArtworkForTracks(tracksToFetch, (current, total, track) => {
      setArtFetchProgress({ current, total, trackTitle: `${track.artist} - ${track.title}` });
    });

    onTracksUpdated(updated);
    setArtFetchProgress(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Local Storage & Folders</h1>
          <p className="text-sm text-white/50 mt-1">
            Manage local Windows music folders, scan high-resolution files, and synchronize metadata offline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Automatic Album Art Fetcher Trigger */}
          <button
            onClick={handleFetchAllArtwork}
            disabled={!!artFetchProgress}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-medium transition-colors border border-white/10 disabled:opacity-50"
            title="Automatically query iTunes for 600x600 album artwork for all tracks"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fetch All Album Artwork</span>
          </button>

          {/* Re-sync Folders */}
          <button
            onClick={handleResyncAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-medium transition-colors border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white/70" />
            <span>Re-sync All Folders</span>
          </button>

          {/* Add Folder Button */}
          {folderSync.isFileSystemAccessSupported() ? (
            <button
              onClick={handleAddFolderDirectoryPicker}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/20 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Music Folder</span>
            </button>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fa2d48] hover:bg-[#e0263f] text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/20 transition-colors cursor-pointer">
              <FolderPlus className="w-4 h-4" />
              <span>Add Music Folder</span>
              <input
                type="file"
                // @ts-ignore
                webkitdirectory="true"
                directory="true"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Syncing or Album Art Fetching Progress Banner */}
      {syncProgress && (
        <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 flex items-center gap-4">
          <RefreshCw className="w-5 h-5 text-[#fa2d48] animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs text-white mb-1">
              <span className="font-semibold truncate">
                Syncing: {syncProgress.folderName}
              </span>
              <span className="text-white/50 tabular-nums">
                {syncProgress.filesProcessed} / {syncProgress.filesFound} files
              </span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#fa2d48] h-full transition-all duration-200"
                style={{
                  width: `${
                    syncProgress.filesFound > 0
                      ? (syncProgress.filesProcessed / syncProgress.filesFound) * 100
                      : 10
                  }%`,
                }}
              />
            </div>
            {syncProgress.currentFile && (
              <div className="text-[11px] text-white/40 truncate mt-1">
                Parsing: {syncProgress.currentFile}
              </div>
            )}
          </div>
        </div>
      )}

      {artFetchProgress && (
        <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 flex items-center gap-4">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs text-white mb-1">
              <span className="font-semibold truncate">
                Fetching Artwork: {artFetchProgress.trackTitle}
              </span>
              <span className="text-white/50 tabular-nums">
                {artFetchProgress.current} / {artFetchProgress.total} tracks
              </span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-200"
                style={{
                  width: `${(artFetchProgress.current / artFetchProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Folders Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Configured Storage Locations ({folders.length})
        </h2>

        {folders.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center">
            <HardDrive className="w-12 h-12 text-white/20 mb-3" />
            <h3 className="text-base font-semibold text-white">No local folders attached</h3>
            <p className="text-xs text-white/50 max-w-sm mt-1 mb-4 leading-relaxed">
              Connect your local music directory to import FLAC, ALAC, WAV, and MP3 files with high-res audio playback and offline lyrics.
            </p>
            <button
              onClick={handleAddFolderDirectoryPicker}
              className="px-4 py-2 rounded-lg bg-[#fa2d48] text-white text-xs font-semibold"
            >
              Select Folder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folders.map((folder) => {
              const folderTracks = tracks.filter((t) => t.folderId === folder.id);
              const hiResCount = folderTracks.filter((t) => t.audioQuality.isHiResLossless).length;

              return (
                <div
                  key={folder.id}
                  className="p-5 rounded-2xl bg-[#1a1a22]/80 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#fa2d48]">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm group-hover:text-[#fa2d48] transition-colors truncate max-w-[240px]">
                            {folder.name}
                          </h3>
                          <div className="text-[11px] text-white/40 font-mono truncate max-w-[260px]">
                            {folder.path}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveFolder(folder.id)}
                        className="text-white/30 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                        title="Remove Folder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-black/20 border border-white/[0.04] text-xs">
                      <div>
                        <div className="text-[10px] text-white/40">Tracks</div>
                        <div className="font-bold text-white tabular-nums">{folder.trackCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40">Size</div>
                        <div className="font-bold text-white tabular-nums">{formatBytes(folder.totalSize)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40">Hi-Res Masters</div>
                        <div className="font-bold text-[#fa2d48] tabular-nums">{hiResCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-white/50">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Synced
                    </span>
                    <span className="flex items-center gap-1 text-white/40">
                      <Clock className="w-3 h-3" />
                      {new Date(folder.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Local Metadata Sync Guidelines Box */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-2">
        <div className="flex items-center gap-2 font-semibold text-white/80">
          <Info className="w-4 h-4 text-[#fa2d48]" />
          <span>Local Storage & High-Resolution Playback Information</span>
        </div>
        <p className="text-white/50 leading-relaxed">
          Sonora indexes audio files directly from your Windows file system into offline browser IndexedDB storage.
          All audio streams (FLAC, ALAC, WAV, MP3) stay on your device and are never uploaded to any remote server.
          Metadata and artwork are synchronized locally, preserving 24-bit studio fidelity and offline lyrics playback.
        </p>
      </div>
    </div>
  );
};
