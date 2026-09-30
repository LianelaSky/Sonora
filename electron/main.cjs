const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage, globalShortcut, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d0d12',
    autoHideMenuBar: true,
    title: 'Sonora Music',
    icon: path.join(__dirname, '../public/pwa-512x512.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#121217',
      symbolColor: '#ffffff',
      height: 40,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const devUrl = 'http://localhost:3000';
  const prodPath = path.join(__dirname, '../dist/index.html');

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl).catch(() => {
      if (fs.existsSync(prodPath)) {
        mainWindow.loadFile(prodPath);
      }
    });
  } else {
    mainWindow.loadFile(prodPath);
  }

  // Windows Taskbar Thumbar Buttons (interactive media controls in Windows 11 taskbar preview)
  setupTaskbarThumbar(false);

  // Setup Windows System Tray
  setupSystemTray();

  // Register Windows Global Media Keys
  registerGlobalMediaKeys();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTaskbarThumbar(isPlaying) {
  if (process.platform !== 'win32' || !mainWindow) return;

  try {
    const iconPrev = nativeImage.createFromPath(path.join(__dirname, '../public/pwa-192x192.png')).resize({ width: 16, height: 16 });
    mainWindow.setThumbarButtons([
      {
        tooltip: 'Previous Track',
        icon: iconPrev,
        click: () => mainWindow.webContents.send('media-key-action', 'prev'),
      },
      {
        tooltip: isPlaying ? 'Pause' : 'Play',
        icon: iconPrev,
        click: () => mainWindow.webContents.send('media-key-action', 'toggle_play'),
      },
      {
        tooltip: 'Next Track',
        icon: iconPrev,
        click: () => mainWindow.webContents.send('media-key-action', 'next'),
      },
    ]);
  } catch (err) {
    // Thumbar not supported or icons pending
  }
}

function setupSystemTray() {
  try {
    const iconPath = path.join(__dirname, '../public/pwa-192x192.png');
    if (!fs.existsSync(iconPath)) return;

    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    tray = new Tray(trayIcon);
    tray.setToolTip('Sonora Music for Windows');

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Sonora Music', enabled: false },
      { type: 'separator' },
      { label: 'Play / Pause', click: () => mainWindow?.webContents.send('media-key-action', 'toggle_play') },
      { label: 'Next Track', click: () => mainWindow?.webContents.send('media-key-action', 'next') },
      { label: 'Previous Track', click: () => mainWindow?.webContents.send('media-key-action', 'prev') },
      { type: 'separator' },
      { label: 'Show Sonora', click: () => mainWindow?.show() },
      { label: 'Quit', click: () => app.quit() },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      mainWindow?.show();
    });
  } catch (e) {
    console.warn('System tray initialization skipped:', e);
  }
}

function registerGlobalMediaKeys() {
  try {
    globalShortcut.register('MediaPlayPause', () => mainWindow?.webContents.send('media-key-action', 'toggle_play'));
    globalShortcut.register('MediaNextTrack', () => mainWindow?.webContents.send('media-key-action', 'next'));
    globalShortcut.register('MediaPreviousTrack', () => mainWindow?.webContents.send('media-key-action', 'prev'));
    globalShortcut.register('MediaStop', () => mainWindow?.webContents.send('media-key-action', 'stop'));
  } catch (err) {
    console.warn('Could not register hardware media keys:', err);
  }
}

// Window controls IPC
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());
ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() || false);

// Native Windows File Dialog for Selecting Local Music Folders
ipcMain.handle('dialog-select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Windows Music Folder',
  });
  return result.filePaths;
});

// Windows Toast Notification
ipcMain.on('show-notification', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, '../public/pwa-192x192.png'),
    }).show();
  }
});

// Update Taskbar Thumbar state
ipcMain.on('playback-state-changed', (_event, { isPlaying }) => {
  setupTaskbarThumbar(isPlaying);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
