const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

let db;

const logger = {
  initializeDatabase() {
    db = new sqlite3.Database(config.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        return;
      }
      console.log('✅ Connected to SQLite database');
      this.createTable();
    });
  },

  createTable() {
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
        console.error('Error creating table:', err);
      } else {
        console.log('📊 Messages table ready - logging ALL guilds');
      }
    });
  },

  logMessage(messageData) {
    if (!db) {
      console.error('Database not initialized');
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
            // Message already logged
          } else {
            console.error('Error inserting message:', err);
          }
        }
      }
    );
  },

  getMessageCount(callback) {
    db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
      if (err) {
        console.error('Error getting message count:', err);
        callback(0);
      } else {
        callback(row.count);
      }
    });
  },

  getMessagesByGuild(guildId, callback) {
    db.all('SELECT * FROM messages WHERE guildId = ? ORDER BY timestamp DESC LIMIT 100', [guildId], (err, rows) => {
      if (err) {
        console.error('Error getting guild messages:', err);
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
          console.error('Error closing database:', err);
        } else {
          console.log('Database closed');
        }
      });
    }
  }
};

module.exports = logger;
