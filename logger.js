const sqlite3 = require('sqlite3').verbose();
const config = require('./config');
const path = require('path');
const fs = require('fs');

let db;
let dbInitialized = false;

const logger = {
  initializeDatabase() {
    if (dbInitialized) return;
    
    // Ensure directory exists
    const dbDir = path.dirname(config.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new sqlite3.Database(config.dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
        return;
      }
      console.log('✅ Connected to SQLite database at ' + config.dbPath);
      this.createTable();
      dbInitialized = true;
    });
  },

  createTable() {
    if (!db) {
      console.error('Database not initialized');
      return;
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        messageId TEXT UNIQUE,
        authorId TEXT NOT NULL,
        authorName TEXT NOT NULL,
        authorDiscriminator TEXT,
        content TEXT,
        channelId TEXT NOT NULL,
        channelName TEXT,
        guildId TEXT,
        guildName TEXT,
        timestamp INTEGER,
        attachments TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
      } else {
        console.log('📊 Messages table ready - logging ALL guilds');
        this.getMessageCount((count) => {
          console.log(`📈 Total messages in database: ${count}`);
        });
      }
    });
  },

  logMessage(messageData) {
    if (!db) {
      console.error('❌ Database not initialized');
      return;
    }

    const { messageId, authorId, authorName, authorDiscriminator, content, channelId, channelName, guildId, guildName, timestamp, attachments } = messageData;

    db.run(
      `INSERT INTO messages (messageId, authorId, authorName, authorDiscriminator, content, channelId, channelName, guildId, guildName, timestamp, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [messageId, authorId, authorName, authorDiscriminator, content, channelId, channelName, guildId, guildName, timestamp, attachments],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            // Message already logged, ignore
          } else {
            console.error('❌ Error inserting message:', err.message);
          }
        }
      }
    );
  },

  getMessageCount(callback) {
    if (!db) {
      callback(0);
      return;
    }
    
    db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
      if (err) {
        console.error('❌ Error getting message count:', err.message);
        callback(0);
      } else {
        callback(row ? row.count : 0);
      }
    });
  },

  getMessagesByGuild(guildId, callback) {
    if (!db) {
      callback([]);
      return;
    }
    
    db.all('SELECT * FROM messages WHERE guildId = ? ORDER BY timestamp DESC LIMIT 100', [guildId], (err, rows) => {
      if (err) {
        console.error('❌ Error getting guild messages:', err.message);
        callback([]);
      } else {
        callback(rows || []);
      }
    });
  },

  getRecentMessages(limit = 50, callback) {
    if (!db) {
      callback([]);
      return;
    }
    
    db.all('SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?', [limit], (err, rows) => {
      if (err) {
        console.error('❌ Error getting recent messages:', err.message);
        callback([]);
      } else {
        callback(rows || []);
      }
    });
  },

  closeDatabase() {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('✅ Database closed');
          dbInitialized = false;
        }
      });
    }
  }
};

module.exports = logger;
