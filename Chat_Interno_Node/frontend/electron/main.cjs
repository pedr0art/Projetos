const { app, BrowserWindow, ipcMain, Notification, Tray, Menu } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
let win;
let tray = null;

function createWindow() {
  win = new BrowserWindow({
    title: "HermesHub",
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.setMenuBarVisibility(false);

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    win.loadFile(indexPath);
  }

  win.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
      createTray();
    }
  });
}

function createTray() {
  // Garante que não haja múltiplos ícones
  if (tray) {
    tray.destroy();
    tray = null;
  }

  tray = new Tray(path.join(__dirname, 'tray-icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        win.show();
      },
    },
    {
      label: 'Sair',
      click: () => {
        app.isQuiting = true;
        tray.destroy();
        app.quit();
      },
    },
  ]);

  tray.setToolTip('HermesHub');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    win.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
  });

  app.setName('HermesHub'); 
  app.setAppUserModelId('com.hermeshub.app');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (app.isQuiting) app.quit();
  }
});

ipcMain.on('show-notification', (_, { title, body, route }) => {
  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, 'assets', 'icon_.png')
  });

  notification.on('click', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.setAlwaysOnTop(true);     // força o foco
      win.focus();
      win.setAlwaysOnTop(false);  

      // Envia a rota clicada para o renderer 
      win.webContents.send('notification-click', route || '/rooms');
    }
  });

  notification.show();
});

