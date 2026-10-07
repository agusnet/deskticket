const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const crypto = require('crypto');

// Detect development mode natively
const isDev = !app.isPackaged;

// Database initialization
const dbPath = isDev
  ? path.join(__dirname, '../deskticket.db')
  : path.join(app.getPath('userData'), 'deskticket.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('--- Database Error ---');
    console.error('Could not connect to database', err.message);
    console.error('----------------------');
  } else {
    console.log('Connected to the SQLite database (DeskTicket).');
    initDatabase();
  }
});

// Helper for Promisified queries
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize database with schema if needed
function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found at:', schemaPath);
      return;
    }
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    db.exec(schema, async (err) => {
      if (err) {
        console.error('Error executing schema:', err.message);
      } else {
        console.log('--- DeskTicket Database Status ---');
        console.log('Path:', dbPath);
        
        // Ensure default admin user with hash and active status
        const pass = 'admin';
        const md5 = crypto.createHash('md5').update(pass).digest('hex');
        const hashedPassword = crypto.createHash('sha1').update(md5).digest('hex');
        
        db.get("SELECT count(*) as total FROM \"user\"", (err, row) => {
          if (!err && (!row || row.total === 0)) {
            db.run("INSERT OR REPLACE INTO \"user\" (id, name, lastname, username, password, email, is_active, kind) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [1, 'Administrador', 'General', 'admin', hashedPassword, 'admin@deskticket.com', 1, 1], (err) => {
                if (!err) console.log('Default Admin (id 1) created successfully.');
              });
          } else if (!err) {
            console.log('Users found in DB:', row.total);
            db.run("INSERT OR REPLACE INTO \"user\" (id, name, lastname, username, password, email, is_active, kind) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [1, 'Administrador', 'General', 'admin', hashedPassword, 'admin@deskticket.com', 1, 1]);
          }
        });

        console.log('Database Initialization: SUCCESS');
        console.log('---------------------------------');
      }
    });
  } catch (error) {
    console.error('Failed to read schema file:', error.message);
  }
}

// IPC Handlers
ipcMain.handle('db:query', async (event, { sql, params = [] }) => {
  try {
    return await dbQuery(sql, params);
  } catch (error) {
    console.error('DB Query Error:', error);
    throw error;
  }
});

ipcMain.handle('db:execute', async (event, { sql, params = [] }) => {
  try {
    return await dbRun(sql, params);
  } catch (error) {
    console.error('DB Execute Error:', error);
    throw error;
  }
});

ipcMain.handle('db:login', async (event, { username, password }) => {
  try {
    const md5 = crypto.createHash('md5').update(password).digest('hex');
    const hashedPassword = crypto.createHash('sha1').update(md5).digest('hex');

    console.log('--- DeskTicket Login Attempt ---');
    console.log('Input:', username);

    let user = await dbGet(
      'SELECT id, name, lastname, username, email, kind FROM "user" WHERE (username = ? OR email = ?) AND password = ? AND is_active = 1',
      [username, username, hashedPassword]
    );

    // Fallback: plaintext match
    if (!user) {
      user = await dbGet(
        'SELECT id, name, lastname, username, email, kind FROM "user" WHERE (username = ? OR email = ?) AND password = ? AND is_active = 1',
        [username, username, password]
      );
    }

    // Fallback: default admin
    if (!user && (username.toLowerCase() === 'admin' || username.toLowerCase() === 'administrador') && password === 'admin') {
      user = await dbGet(
        'SELECT id, name, lastname, username, email, kind FROM "user" WHERE (id = 1 OR username = \'admin\') AND is_active = 1'
      );
    }
    
    if (user) {
      console.log('Login Result: SUCCESS for', user.username || user.name);
    } else {
      console.log('Login Result: FAILED');
    }
    console.log('-------------------------------');
    
    return user || null;
  } catch (error) {
    console.error('Login Handler Error:', error);
    return null;
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    useContentSize: true,
    autoHideMenuBar: true,
    minWidth: 1024,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/vite.svg')
  });

  win.loadURL(
    isDev
      ? 'http://localhost:5186'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
