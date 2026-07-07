const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { Client } = require('discord.js-selfbot-v13');
const logger = require('./logger');
const commands = require('./commands');

const app = express();
const client = new Client({
  checkUpdate: false,
  intents: 32767
});

const PORT = process.env.PORT || 3000;
const DISCORD_TOKEN = process.env.USER_TOKEN || '';

// MIDDLEWARE
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory session store for Railway
const sessions = {};

app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  if (sessionId) {
    req.session = sessions[sessionId] || {};
    req.sessionId = sessionId;
  }
  next();
});

// DISCORD BOT
let botReady = false;

client.once('ready', () => {
  botReady = true;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Discord user logged in as ${client.user.username}`);
  console.log(`📊 Monitoring ${client.guilds.cache.size} guild(s)`);
  console.log(`${'='.repeat(60)}\n`);
  logger.initializeDatabase();
});

client.on('messageCreate', async (message) => {
  if (message.author.id === client.user.id) {
    if (message.content.startsWith('?')) {
      try {
        await commands.handleCommand(message, client, logger);
      } catch (e) {
        console.error('Command error:', e.message);
      }
    }
    return;
  }

  try {
    logger.logMessage({
      messageId: message.id,
      authorId: message.author.id,
      authorName: message.author.username,
      authorDisplayName: message.author.displayName || message.author.username,
      authorDiscriminator: message.author.discriminator || '0',
      content: message.content || '',
      channelId: message.channelId,
      channelName: message.channel.name || 'DM',
      guildId: message.guildId,
      guildName: message.guild ? message.guild.name : 'DM',
      isDM: !message.guild,
      timestamp: message.createdTimestamp,
      attachments: message.attachments.size > 0 ? message.attachments.map(a => a.url).join(', ') : null
    });
  } catch (error) {
    console.error('Error logging message:', error.message);
  }
});

client.on('error', error => console.error('Discord error:', error.message));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error.message));

// WEB ROUTES
app.get('/health', (req, res) => {
  res.json({ status: botReady ? 'ready' : 'connecting', timestamp: new Date().toISOString() });
});

app.post('/api/login', (req, res) => {
  const { token } = req.body;
  if (!token || token.length < 50) {
    return res.status(400).json({ error: 'Invalid token' });
  }
  const sessionId = Math.random().toString(36).substring(7);
  sessions[sessionId] = { loggedIn: true, userToken: token, createdAt: Date.now() };
  res.json({ success: true, sessionId });
});

app.post('/api/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
  }
  res.json({ success: true });
});

app.get('/api/status', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionId ? sessions[sessionId] : null;
  res.json({
    loggedIn: session && session.loggedIn,
    user: client.user ? client.user.username : 'Unknown',
    botReady
  });
});

const checkLogin = (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || !sessions[sessionId] || !sessions[sessionId].loggedIn) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

app.get('/api/messages', checkLogin, (req, res) => {
  logger.getRecentMessages(req.query.limit || 100, (messages) => {
    res.json({ success: true, messages });
  });
});

app.get('/api/search', checkLogin, (req, res) => {
  const query = req.query.q || '';
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }
  logger.searchMessages(query, (messages) => {
    res.json({ success: true, messages });
  });
});

app.get('/api/user/:userId', checkLogin, (req, res) => {
  logger.getMessagesByUser(req.params.userId, (messages) => {
    res.json({ success: true, messages });
  });
});

app.get('/api/user/:userId/channel/:channelId', checkLogin, (req, res) => {
  logger.getMessagesByUserAndChannel(req.params.userId, req.params.channelId, (messages) => {
    res.json({ success: true, messages });
  });
});

app.get('/api/keyword', checkLogin, (req, res) => {
  const keyword = req.query.k || '';
  if (!keyword || keyword.length < 2) {
    return res.status(400).json({ error: 'Keyword too short' });
  }
  logger.searchByKeyword(keyword, (messages) => {
    res.json({ success: true, messages });
  });
});

app.get('/api/stats', checkLogin, (req, res) => {
  logger.getStats((stats) => {
    res.json({ success: true, stats });
  });
});

app.get('/api/guilds', checkLogin, (req, res) => {
  const guilds = client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    memberCount: g.memberCount || 0
  }));
  res.json({ success: true, guilds });
});

app.get('/api/guild/:guildId/messages', checkLogin, (req, res) => {
  logger.getMessagesByGuild(req.params.guildId, (messages) => {
    res.json({ success: true, messages });
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  logger.closeDatabase();
  if (client && client.destroy) {
    client.destroy();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  logger.closeDatabase();
  if (client && client.destroy) {
    client.destroy();
  }
  process.exit(0);
});

if (!DISCORD_TOKEN) {
  console.error('USER_TOKEN not set!');
  process.exit(1);
}

client.login(DISCORD_TOKEN).catch(error => {
  console.error('Failed to login:', error.message);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
});

module.exports = { app, client };
