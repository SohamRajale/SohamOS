const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { initDb, dbOps } = require('./db/database');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 860,
    minWidth: 1160,
    minHeight: 760,
    backgroundColor: '#070b14',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
}

app.whenReady().then(() => {
  initDb(app.getPath('userData'));
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('db:getDashboardData', () => dbOps.getDashboardData());
ipcMain.handle('db:getTasks', () => dbOps.getTasks());
ipcMain.handle('db:saveTask', (_, payload) => dbOps.saveTask(payload));
ipcMain.handle('db:toggleTask', (_, id) => dbOps.toggleTask(id));
ipcMain.handle('db:getContent', () => dbOps.getContent());
ipcMain.handle('db:saveContent', (_, payload) => dbOps.saveContent(payload));
ipcMain.handle('db:getReminders', () => dbOps.getReminders());
ipcMain.handle('db:saveReminder', (_, payload) => dbOps.saveReminder(payload));

ipcMain.on('notify:show', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});
