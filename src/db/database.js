const path = require('path');
const Database = require('better-sqlite3');

let db;

function initDb(userDataPath) {
  const dbPath = path.join(userDataPath, 'sohamos.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT,
      time_slot TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      remind_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

const dbOps = {
  getTasks: () => db.prepare('SELECT * FROM tasks ORDER BY completed ASC, date ASC, time_slot ASC').all(),
  saveTask: ({ title, date, timeSlot }) =>
    db.prepare('INSERT INTO tasks (title, date, time_slot) VALUES (?, ?, ?)').run(title, date || null, timeSlot || null),
  toggleTask: (id) => db.prepare('UPDATE tasks SET completed = CASE completed WHEN 1 THEN 0 ELSE 1 END WHERE id = ?').run(id),

  getContent: () => db.prepare('SELECT * FROM content_items ORDER BY created_at DESC').all(),
  saveContent: ({ kind, title, body }) =>
    db.prepare('INSERT INTO content_items (kind, title, body) VALUES (?, ?, ?)').run(kind, title, body || ''),

  getReminders: () => db.prepare('SELECT * FROM reminders ORDER BY remind_at ASC').all(),
  saveReminder: ({ title, remindAt }) =>
    db.prepare('INSERT INTO reminders (title, remind_at) VALUES (?, ?)').run(title, remindAt),

  getDashboardData: () => {
    const pendingTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE completed = 0').get().count;
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    const contentIdeas = db.prepare("SELECT COUNT(*) as count FROM content_items WHERE kind = 'idea'").get().count;
    const scripts = db.prepare("SELECT COUNT(*) as count FROM content_items WHERE kind = 'script'").get().count;
    const productivityScore = totalTasks > 0 ? Math.round(((totalTasks - pendingTasks) / totalTasks) * 100) : 0;

    return { pendingTasks, totalTasks, contentIdeas, scripts, productivityScore };
  }
};

module.exports = { initDb, dbOps };
