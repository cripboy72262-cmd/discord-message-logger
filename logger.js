const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db;
let dbInitialized = false;

const logger = {
  initializeDatabase() {
    if (dbInitialized) return;
    
    try {
      const dbDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || './data';
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const dbPath = path.join(dbDir, 'messages.db');
      
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database error:', err.message);
          return;
        }
        console.log('✅ Database connected');
        this.createTables();
        dbInitialized = true;
      });
    } catch (error) {
      console.error('Database initialization error:', error.message);
    }
  },

  createTables() {
    if (!db) return;

    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      messageId TEXT UNIQUE,
      authorId TEXT NOT NULL,
      authorName TEXT NOT NULL,
      authorDisplayName TEXT,
      authorDiscriminator TEXT,
      content TEXT,
      channelId TEXT NOT NULL,
      channelName TEXT,
      guildId TEXT,
      guildName TEXT,
      isDM BOOLEAN DEFAULT 0,
      timestamp INTEGER,
      attachments TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Table creation error:', err.message);
      } else {
        console.log('📊 Table ready');
      }
    });
  },

  logMessage(messageData) {
    if (!db) return;

    try {
      const { messageId, authorId, authorName, authorDisplayName, authorDiscriminator, content, channelId, channelName, guildId, guildName, isDM, timestamp, attachments } = messageData;

      db.run(
        `INSERT OR IGNORE INTO messages (messageId, authorId, authorName, authorDisplayName, authorDiscriminator, content, channelId, channelName, guildId, guildName, isDM, timestamp, attachments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [messageId, authorId, authorName, authorDisplayName, authorDiscriminator, content, channelId, channelName, guildId, guildName, isDM ? 1 : 0, timestamp, attachments]
      );
    } catch (error) {
      console.error('Log message error:', error.message);
    }
  },

  getRecentMessages(limit, callback) {
    if (!db) {
      callback([]);
      return;
    }
    try {
      db.all('SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?', [limit], (err, rows) => {
        callback(rows || []);
      });
    } catch (e) {
      callback([]);
    }
  },

  searchMessages(query, callback) {
    if (!db) {
      callback([]);
      return;
    }
    try {
      const q = `%${query}%`;
      db.all('SELECT * FROM messages WHERE authorName LIKE ? OR authorId LIKE ? ORDER BY timestamp DESC LIMIT 500', [q, q], (err, rows) => {
        callback(rows || []);
      });
    } catch (e) {
      callback([]);
    }
  },

  searchByKeyword(keyword, callback) {
    if (!db) {
      callback([]);
      return;
    }
    try {
      const k = `%${keyword}%`;
      db.all('SELECT * FROM messages WHERE content LIKE ? ORDER BY timestamp DESC LIMIT 1000', [k], (err, rows) => {
        callback(rows || []);
      });
    } catch (e) {
      callback([]);
    }
  },

  getMessagesByUser(userId, callback) {
    if (!db) {
      callback([]);
      return;
    }
    try {
      db.all('SELECT * FROM messages WHERE authorId = ? ORDER BY timestamp DESC LIMIT 1000', [userId], (err, rows) => {
        callback(rows || []);
      });
    } catch (e) {
      callback([]);
    }
  },

  getMessagesByUserAndChannel(userId, channelId, callback) {
    if (!db) {
      callback([]);
      return;
    }
    try {
      db.all('SELECT * FROM messages WHERE authorId = ? AND channelId = ? ORDER BY timestamp DESC LIMIT 1000', [userId, channelId], (err, rows) => {
        callback(rows || []);
      });
    } catch (e) {
      callback([]);
    }
  },

  getMessagesByGuild(guildId, callback) {
    if (!db) {
      callback([]);
      return;
    }
    try {
      db.all('SELECT * FROM messages WHERE guildId = ? ORDER BY timestamp DESC LIMIT 1000', [guildId], (err, rows) => {
        callback(rows || []);
      });
    } catch (e) {
      callback([]);
    }
  },

  getStats(callback) {
    if (!db) {
      callback({ totalMessages: 0, uniqueUsers: 0, totalGuilds: 0 });
      return;
    }
    try {
      db.get('SELECT COUNT(*) as total FROM messages', (err, row) => {
        const stats = { totalMessages: row ? row.total : 0 };
        db.get('SELECT COUNT(DISTINCT authorId) as total FROM messages', (err, row) => {
          stats.uniqueUsers = row ? row.total : 0;
          db.get('SELECT COUNT(DISTINCT guildId) as total FROM messages', (err, row) => {
            stats.totalGuilds = row ? row.total : 0;
            callback(stats);
          });
        });
      });
    } catch (e) {
      callback({ totalMessages: 0, uniqueUsers: 0, totalGuilds: 0 });
    }
  },

  closeDatabase() {
    if (db) {
      try {
        db.close();
        dbInitialized = false;
      } catch (e) {}
    }
  }
};

module.exports = logger;
