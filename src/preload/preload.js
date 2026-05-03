const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sohamOS', {
  db: {
    getDashboardData: () => ipcRenderer.invoke('db:getDashboardData'),
    getTasks: () => ipcRenderer.invoke('db:getTasks'),
    saveTask: (payload) => ipcRenderer.invoke('db:saveTask', payload),
    toggleTask: (id) => ipcRenderer.invoke('db:toggleTask', id),
    getContent: () => ipcRenderer.invoke('db:getContent'),
    saveContent: (payload) => ipcRenderer.invoke('db:saveContent', payload),
    getReminders: () => ipcRenderer.invoke('db:getReminders'),
    saveReminder: (payload) => ipcRenderer.invoke('db:saveReminder', payload)
  },
  notifications: {
    show: (title, body) => ipcRenderer.send('notify:show', { title, body })
  }
});
