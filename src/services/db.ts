import { Track, SmartPlaylist, UserPlaylist, LocalStorageFolder, KeyboardShortcutConfig } from '../types/music';

const DB_NAME = 'SonoraMusicDB';
const DB_VERSION = 2;

export interface DBState {
  tracks: Track[];
  smartPlaylists: SmartPlaylist[];
  playlists: UserPlaylist[];
  folders: LocalStorageFolder[];
  audioFiles: Map<string, Blob>;
}

class MusicDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('audioBlobs')) {
          db.createObjectStore('audioBlobs');
        }
        if (!db.objectStoreNames.contains('smartPlaylists')) {
          db.createObjectStore('smartPlaylists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Tracks
  async getAllTracks(): Promise<Track[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveTrack(track: Track): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      const req = store.put(track);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async saveTracks(tracks: Track[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      tracks.forEach((t) => store.put(t));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteTrack(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['tracks', 'audioBlobs'], 'readwrite');
      tx.objectStore('tracks').delete(id);
      tx.objectStore('audioBlobs').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Audio Blobs (for local files)
  async saveAudioBlob(trackId: string, blob: Blob): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audioBlobs', 'readwrite');
      const store = tx.objectStore('audioBlobs');
      const req = store.put(blob, trackId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getAudioBlob(trackId: string): Promise<Blob | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audioBlobs', 'readonly');
      const store = tx.objectStore('audioBlobs');
      const req = store.get(trackId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // Smart Playlists
  async getAllSmartPlaylists(): Promise<SmartPlaylist[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('smartPlaylists', 'readonly');
      const store = tx.objectStore('smartPlaylists');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveSmartPlaylist(playlist: SmartPlaylist): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('smartPlaylists', 'readwrite');
      const store = tx.objectStore('smartPlaylists');
      const req = store.put(playlist);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteSmartPlaylist(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('smartPlaylists', 'readwrite');
      const store = tx.objectStore('smartPlaylists');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Custom User Playlists
  async getAllPlaylists(): Promise<UserPlaylist[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('playlists', 'readonly');
      const store = tx.objectStore('playlists');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async savePlaylist(playlist: UserPlaylist): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('playlists', 'readwrite');
      const store = tx.objectStore('playlists');
      const req = store.put(playlist);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deletePlaylist(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('playlists', 'readwrite');
      const store = tx.objectStore('playlists');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Folders
  async getAllFolders(): Promise<LocalStorageFolder[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('folders', 'readonly');
      const store = tx.objectStore('folders');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveFolder(folder: LocalStorageFolder): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('folders', 'readwrite');
      const store = tx.objectStore('folders');
      const req = store.put(folder);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteFolder(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('folders', 'readwrite');
      const store = tx.objectStore('folders');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Settings
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : defaultValue);
      req.onerror = () => resolve(defaultValue);
    });
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const musicDb = new MusicDatabase();
