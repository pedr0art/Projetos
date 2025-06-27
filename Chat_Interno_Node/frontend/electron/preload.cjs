const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  notify: (data) => ipcRenderer.send('show-notification', data),
  onNotificationClick: (callback) => ipcRenderer.on('notification-click', (_, route) => callback(route))
});
