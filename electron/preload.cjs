const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Authentication
  login: (credentials) => ipcRenderer.invoke('db:login', credentials),
  
  // Generic DB methods
  query: (sql, params) => ipcRenderer.invoke('db:query', { sql, params }),
  execute: (sql, params) => ipcRenderer.invoke('db:execute', { sql, params }),

  // Helpers
  getProjects: () => ipcRenderer.invoke('db:query', { sql: 'SELECT * FROM project ORDER BY name ASC' }),
  getCategories: () => ipcRenderer.invoke('db:query', { sql: 'SELECT * FROM category ORDER BY name ASC' }),
  getKinds: () => ipcRenderer.invoke('db:query', { sql: 'SELECT * FROM kind ORDER BY id ASC' }),
  getStatuses: () => ipcRenderer.invoke('db:query', { sql: 'SELECT * FROM status ORDER BY id ASC' }),
  getPriorities: () => ipcRenderer.invoke('db:query', { sql: 'SELECT * FROM priority ORDER BY id ASC' }),
  getUsers: () => ipcRenderer.invoke('db:query', { sql: 'SELECT id, username, name, lastname, kind, is_active FROM "user" WHERE is_active = 1 ORDER BY name ASC' }),
});
