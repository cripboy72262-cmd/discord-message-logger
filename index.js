const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./config');
const logger = require('./logger');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ]
});

// When bot is ready
client.once('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  logger.initializeDatabase();
});

// Log messages
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  try {
    // Log message to database
    logger.logMessage({
      messageId: message.id,
      authorId: message.author.id,
      authorName: message.author.username,
      content: message.content,
      channelId: message.channelId,
      channelName: message.channel.name || 'DM',
      guildId: message.guildId,
      timestamp: message.createdTimestamp,
      attachments: message.attachments.size > 0 ? message.attachments.map(a => a.url).join(', ') : null
    });

    console.log(`📝 Logged message from ${message.author.username} in #${message.channel.name || 'DM'}`);
  } catch (error) {
    console.error('Error logging message:', error);
  }
});

// Handle errors
client.on('error', error => console.error('Discord client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));

// Login to Discord
client.login(config.discordToken);

module.exports = client;
