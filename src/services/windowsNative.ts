import { Track } from '../types/music';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      selectFolder: () => Promise<string[] | undefined>;
      updatePlaybackState: (state: { isPlaying: boolean; trackTitle?: string; artist?: string }) => void;
      showNotification: (title: string, body: string, icon?: string) => void;
      onMediaKey: (callback: (action: string) => void) => void;
    };
  }
}

export class WindowsNativeBridge {
  // Check if running on Windows OS
  public isWindowsOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('windows') || ua.includes('win32') || ua.includes('win64');
  }

  // Check if running inside Electron wrapper
  public isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
  }

  // Check if running as an installed standalone PWA on Windows
  public isStandalonePWA(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      this.isElectron()
    );
  }

  // Check if Windows 11 Window Controls Overlay is active
  public isWindowControlsOverlayActive(): boolean {
    if (typeof navigator === 'undefined') return false;
    return !!(navigator as any).windowControlsOverlay?.visible;
  }

  // Minimize Window (delegates to Electron or MiniPlayer)
  public minimize(onFallbackMiniPlayer?: () => void) {
    if (this.isElectron()) {
      window.electronAPI?.minimize();
    } else if (onFallbackMiniPlayer) {
      onFallbackMiniPlayer();
    }
  }

  // Maximize / Restore Window
  public maximize() {
    if (this.isElectron()) {
      window.electronAPI?.maximize();
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // Close Window
  public close(onFallback?: () => void) {
    if (this.isElectron()) {
      window.electronAPI?.close();
    } else if (onFallback) {
      onFallback();
    }
  }

  // Native Windows Toast Notification (Action Center)
  public async notifyTrackChange(track: Track) {
    if (this.isElectron()) {
      window.electronAPI?.showNotification(track.title, `${track.artist} · ${track.album}`, track.artworkUrl);
      return;
    }

    if (typeof Notification !== 'undefined') {
      try {
        if (Notification.permission === 'granted') {
          new Notification(track.title, {
            body: `${track.artist} — ${track.album}`,
            icon: track.artworkUrl || '/pwa-192x192.png',
            silent: true,
          });
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification(track.title, {
              body: `${track.artist} — ${track.album}`,
              icon: track.artworkUrl || '/pwa-192x192.png',
              silent: true,
            });
          }
        }
      } catch (e) {
        // Notification silent fallback
      }
    }
  }

  // Sync state with Windows Taskbar Thumbnail Toolbar
  public updateThumbar(isPlaying: boolean, track?: Track) {
    if (this.isElectron()) {
      window.electronAPI?.updatePlaybackState({
        isPlaying,
        trackTitle: track?.title,
        artist: track?.artist,
      });
    }
  }

  // Native Windows Folder Selector
  public async selectWindowsFolder(): Promise<string | null> {
    if (this.isElectron()) {
      const paths = await window.electronAPI?.selectFolder();
      if (paths && paths.length > 0) {
        return paths[0];
      }
      return null;
    }
    return null;
  }
}

export const windowsNative = new WindowsNativeBridge();
