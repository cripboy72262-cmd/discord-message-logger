const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db;
let dbInitialized = false;

const logger = {
  initializeDatabase() {
    if (dbInitialized) return;
    
    const dbDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || './data';
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbPath = path.join(dbDir, 'messages.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        return;
      }
      console.log('✅ Connected to SQLite database');
      this.createTables();
      dbInitialized = true;
    });
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
        console.error('Error creating table:', err.message);
      } else {
        console.log('📊 Messages table ready');
      }
    });
  },

  logMessage(messageData) {
    if (!db) return;

    const { messageId, authorId, authorName, authorDisplayName, authorDiscriminator, content, channelId, channelName, guildId, guildName, isDM, timestamp, attachments } = messageData;

    db.run(
      `INSERT INTO messages (messageId, authorId, authorName, authorDisplayName, authorDiscriminator, content, channelId, channelName, guildId, guildName, isDM, timestamp, attachments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [messageId, authorId, authorName, authorDisplayName, authorDiscriminator, content, channelId, channelName, guildId, guildName, isDM ? 1 : 0, timestamp, attachments],
      function(err) {
        if (err && !err.message.includes('UNIQUE')) {
          console.error('Error inserting:', err.message);
        }
      }
    );
  },

  getRecentMessages(limit, callback) {
    if (!db) {
      callback([]);
      return;
    }
    db.all('SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?', [limit], (err, rows) => {
      callback(rows || []);
    });
  },

  searchMessages(query, callback) {
    if (!db) {
      callback([]);
      return;
    }
    const searchQuery = `%${query}%`;
    db.all('SELECT * FROM messages WHERE authorName LIKE ? OR authorDisplayName LIKE ? OR authorId LIKE ? ORDER BY timestamp DESC LIMIT 500', [searchQuery, searchQuery, searchQuery], (err, rows) => {
      callback(rows || []);
    });
  },

  searchByKeyword(keyword, callback) {
    if (!db) {
      callback([]);
      return;
    }
    const searchKeyword = `%${keyword}%`;
    db.all('SELECT * FROM messages WHERE content LIKE ? ORDER BY timestamp DESC LIMIT 1000', [searchKeyword], (err, rows) => {
      callback(rows || []);
    });
  },

  getMessagesByUser(userId, callback) {
    if (!db) {
      callback([]);
      return;
    }
    db.all('SELECT * FROM messages WHERE authorId = ? ORDER BY timestamp DESC LIMIT 1000', [userId], (err, rows) => {
      callback(rows || []);
    });
  },

  getMessagesByUserAndChannel(userId, channelId, callback) {
    if (!db) {
      callback([]);
      return;
    }
    db.all('SELECT * FROM messages WHERE authorId = ? AND channelId = ? ORDER BY timestamp DESC LIMIT 1000', [userId, channelId], (err, rows) => {
      callback(rows || []);
    });
  },

  getMessagesByGuild(guildId, callback) {
    if (!db) {
      callback([]);
      return;
    }
    db.all('SELECT * FROM messages WHERE guildId = ? ORDER BY timestamp DESC LIMIT 1000', [guildId], (err, rows) => {
      callback(rows || []);
    });
  },

  getStats(callback) {
    if (!db) {
      callback({});
      return;
    }
    const stats = {};
    db.get('SELECT COUNT(*) as total FROM messages', (err, row) => {
      stats.totalMessages = row ? row.total : 0;
      db.get('SELECT COUNT(DISTINCT authorId) as total FROM messages', (err, row) => {
        stats.uniqueUsers = row ? row.total : 0;
        db.get('SELECT COUNT(DISTINCT guildId) as total FROM messages', (err, row) => {
          stats.totalGuilds = row ? row.total : 0;
          callback(stats);
        });
      });
    });
  },

  closeDatabase() {
    if (db) {
      db.close();
    }
  }
};

module.exports = logger;
