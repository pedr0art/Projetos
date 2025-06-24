const { app, BrowserWindow, ipcMain, Notification, Tray, Menu } = require('electron');
const path = require('path');
const AutoLaunch = require('electron-auto-launch');

const isDev = !app.isPackaged;
let win;
let tray = null;

// Configurar Auto Launch
const autoLauncher = new AutoLaunch({
  name: 'MeuAppInterno', // Nome que vai aparecer no Gerenciador de Inicialização
});

autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) {
    autoLauncher.enable().catch((err) => {
      console.error('Erro ao ativar auto-launch:', err);
    });
  }
}).catch((err) => {
  console.error('Erro ao verificar auto-launch:', err);
});

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
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
  if (tray) return;

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
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Meu App Interno');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    win.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (app.isQuiting) app.quit();
  }
});

// Notificações
ipcMain.on('show-notification', (_, { title, body }) => {
  new Notification({ title, body }).show();
});
