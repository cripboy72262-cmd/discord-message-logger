const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { Client } = require('discord.js-selfbot-v13');
const logger = require('./logger');
const commands = require('./commands');

const app = express();
const client = new Client();
const PORT = process.env.PORT || 3000;
const DISCORD_TOKEN = process.env.USER_TOKEN || '';

// MIDDLEWARE
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'discord-logger-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// DISCORD BOT
client.once('ready', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Discord user logged in as ${client.user.username}#${client.user.discriminator}`);
  console.log(`📊 Monitoring ${client.guilds.cache.size} guild(s)`);
  logger.initializeDatabase();
  console.log(`${'='.repeat(60)}\n`);
});

client.on('messageCreate', async (message) => {
  if (message.author.id === client.user.id) {
    if (message.content.startsWith('?')) {
      await commands.handleCommand(message, client, logger);
    }
    return;
  }

  try {
    logger.logMessage({
      messageId: message.id,
      authorId: message.author.id,
      authorName: message.author.username,
      authorDisplayName: message.author.displayName || message.author.username,
      authorDiscriminator: message.author.discriminator,
      content: message.content,
      channelId: message.channelId,
      channelName: message.channel.name || 'DM',
      guildId: message.guildId,
      guildName: message.guild ? message.guild.name : 'DM',
      isDM: !message.guild,
      timestamp: message.createdTimestamp,
      attachments: message.attachments.size > 0 ? message.attachments.map(a => a.url).join(', ') : null
    });
  } catch (error) {
    console.error('Error logging message:', error);
  }
});

client.on('error', error => console.error('Discord error:', error.message));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));

// WEB ROUTES
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/login', (req, res) => {
  const { token } = req.body;
  if (!token || token.length < 50) {
    return res.status(400).json({ error: 'Invalid token' });
  }
  req.session.userToken = token;
  req.session.loggedIn = true;
  res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/status', (req, res) => {
  res.json({ loggedIn: req.session.loggedIn || false, user: client.user ? client.user.username : 'Unknown' });
});

const checkLogin = (req, res, next) => {
  if (!req.session.loggedIn) {
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
  const guilds = client.guilds.cache.map(g => ({ id: g.id, name: g.name, memberCount: g.memberCount }));
  res.json({ success: true, guilds });
});

app.get('/api/guild/:guildId/messages', checkLogin, (req, res) => {
  logger.getMessagesByGuild(req.params.guildId, (messages) => {
    res.json({ success: true, messages });
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  logger.closeDatabase();
  client.destroy();
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
  console.log(`Web server started on port ${PORT}`);
});
