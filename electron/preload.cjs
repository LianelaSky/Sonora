const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,

  // Window Controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Native Windows File Dialog
  selectFolder: () => ipcRenderer.invoke('dialog-select-folder'),

  // Native Windows Thumbnail Toolbar & Tray
  updatePlaybackState: (state) => ipcRenderer.send('playback-state-changed', state),

  // Native Windows Notifications
  showNotification: (title, body, icon) => ipcRenderer.send('show-notification', { title, body, icon }),

  // Receive hardware media keys from main process
  onMediaKey: (callback) => {
    ipcRenderer.on('media-key-action', (_event, action) => callback(action));
  }
});
