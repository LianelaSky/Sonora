import { LocalStorageFolder, Track } from '../types/music';
import { parseAudioFile, fetchArtworkFromITunes } from './metadataService';
import { musicDb } from './db';

const AUDIO_EXTENSIONS = ['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg', '.alac', '.aiff', '.wma'];

export interface SyncProgress {
  status: 'idle' | 'scanning' | 'processing' | 'fetching_art' | 'completed' | 'error';
  folderName: string;
  filesFound: number;
  filesProcessed: number;
  currentFile?: string;
  error?: string;
}

export class FolderSyncService {
  private isScanning = false;

  // Check if File System Access API is supported (Chrome/Edge on Windows)
  public isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  // Pick a local folder using modern File System Access API
  public async pickDirectory(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.isFileSystemAccessSupported()) {
      return null;
    }
    try {
      const handle = await (window as any).showDirectoryPicker({
        mode: 'read',
      });
      return handle;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Directory picker error:', err);
      }
      return null;
    }
  }

  // Scan directory handle recursively
  public async scanDirectoryHandle(
    dirHandle: FileSystemDirectoryHandle,
    folderPath: string,
    onProgress?: (progress: SyncProgress) => void
  ): Promise<{ folder: LocalStorageFolder; newTracks: Track[] }> {
    const files: { file: File; path: string }[] = [];

    onProgress?.({
      status: 'scanning',
      folderName: dirHandle.name,
      filesFound: 0,
      filesProcessed: 0,
    });

    async function traverse(currentHandle: any, currentPath: string) {
      for await (const entry of currentHandle.values()) {
        if (entry.kind === 'file') {
          const lowerName = entry.name.toLowerCase();
          if (AUDIO_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
            const file = await entry.getFile();
            files.push({ file, path: `${currentPath}\\${entry.name}` });
          }
        } else if (entry.kind === 'directory') {
          await traverse(entry, `${currentPath}\\${entry.name}`);
        }
      }
    }

    await traverse(dirHandle, folderPath);

    onProgress?.({
      status: 'processing',
      folderName: dirHandle.name,
      filesFound: files.length,
      filesProcessed: 0,
    });

    const newTracks: Track[] = [];
    let totalSize = 0;
    const folderId = 'folder_' + Math.random().toString(36).substring(2, 9);

    for (let i = 0; i < files.length; i++) {
      const { file, path } = files[i];
      totalSize += file.size;

      onProgress?.({
        status: 'processing',
        folderName: dirHandle.name,
        filesFound: files.length,
        filesProcessed: i + 1,
        currentFile: file.name,
      });

      try {
        const track = await parseAudioFile(file, path);
        track.folderId = folderId;
        newTracks.push(track);
        // Save audio blob in IndexedDB for persistent audio streaming
        await musicDb.saveAudioBlob(track.id, file);
      } catch (err) {
        console.warn(`Could not parse ${file.name}:`, err);
      }
    }

    const folder: LocalStorageFolder = {
      id: folderId,
      name: dirHandle.name,
      path: folderPath,
      trackCount: newTracks.length,
      totalSize,
      lastSynced: new Date().toISOString(),
      status: 'synced',
    };

    onProgress?.({
      status: 'completed',
      folderName: dirHandle.name,
      filesFound: files.length,
      filesProcessed: newTracks.length,
    });

    return { folder, newTracks };
  }

  // Scan files from standard <input type="file" webkitdirectory>
  public async scanFileList(
    fileList: FileList,
    folderName: string = 'Imported Music Folder',
    onProgress?: (progress: SyncProgress) => void
  ): Promise<{ folder: LocalStorageFolder; newTracks: Track[] }> {
    const audioFiles: File[] = [];
    let totalSize = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const lower = file.name.toLowerCase();
      if (AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
        audioFiles.push(file);
        totalSize += file.size;
      }
    }

    const folderId = 'folder_' + Math.random().toString(36).substring(2, 9);
    const newTracks: Track[] = [];

    onProgress?.({
      status: 'processing',
      folderName,
      filesFound: audioFiles.length,
      filesProcessed: 0,
    });

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      const relPath = (file as any).webkitRelativePath || file.name;
      const fakeWinPath = `C:\\Users\\Music\\${relPath.replace(/\//g, '\\')}`;

      onProgress?.({
        status: 'processing',
        folderName,
        filesFound: audioFiles.length,
        filesProcessed: i + 1,
        currentFile: file.name,
      });

      try {
        const track = await parseAudioFile(file, fakeWinPath);
        track.folderId = folderId;
        newTracks.push(track);
        await musicDb.saveAudioBlob(track.id, file);
      } catch (e) {
        console.warn('Skipping file due to parse error:', file.name, e);
      }
    }

    const folder: LocalStorageFolder = {
      id: folderId,
      name: folderName,
      path: `C:\\Users\\Music\\${folderName}`,
      trackCount: newTracks.length,
      totalSize,
      lastSynced: new Date().toISOString(),
      status: 'synced',
    };

    onProgress?.({
      status: 'completed',
      folderName,
      filesFound: audioFiles.length,
      filesProcessed: newTracks.length,
    });

    return { folder, newTracks };
  }

  // Batch automatic album art fetcher for all tracks without high-res art
  public async fetchArtworkForTracks(
    tracks: Track[],
    onProgress?: (current: number, total: number, track: Track) => void
  ): Promise<Track[]> {
    const updatedTracks: Track[] = [];

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      onProgress?.(i + 1, tracks.length, track);

      try {
        const itunesResult = await fetchArtworkFromITunes(track.title, track.artist);
        if (itunesResult && itunesResult.artworkUrl) {
          const updated: Track = {
            ...track,
            artworkUrl: itunesResult.artworkUrl,
            year: itunesResult.year || track.year,
            genre: itunesResult.genre || track.genre,
            album: itunesResult.album || track.album,
          };
          await musicDb.saveTrack(updated);
          updatedTracks.push(updated);
          continue;
        }
      } catch (err) {
        console.warn('Artwork fetch error for:', track.title, err);
      }

      updatedTracks.push(track);
      // Small throttle to avoid hitting iTunes rate limits
      await new Promise((r) => setTimeout(r, 200));
    }

    return updatedTracks;
  }
}

export const folderSync = new FolderSyncService();
