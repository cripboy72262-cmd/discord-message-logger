const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./config');
const logger = require('./logger');

// Initialize Discord client with user token
const client = new Client();

// When user account is ready
client.once('ready', () => {
  console.log(`✅ User account logged in as ${client.user.username}#${client.user.discriminator}`);
  console.log(`📍 Monitoring ${client.guilds.cache.size} guild(s)`);
  
  // List all guilds the user is in
  client.guilds.cache.forEach((guild) => {
    console.log(`  - ${guild.name} (${guild.id})`);
  });
  
  logger.initializeDatabase();
});

// Log messages from ALL guilds the user is in
client.on('messageCreate', async (message) => {
  // Don't log our own messages, but log everything else
  if (message.author.id === client.user.id) return;

  try {
    // Log message to database
    logger.logMessage({
      messageId: message.id,
      authorId: message.author.id,
      authorName: message.author.username,
      authorDiscriminator: message.author.discriminator,
      content: message.content,
      channelId: message.channelId,
      channelName: message.channel.name || 'DM',
      guildId: message.guildId,
      guildName: message.guild ? message.guild.name : 'DM',
      timestamp: message.createdTimestamp,
      attachments: message.attachments.size > 0 ? message.attachments.map(a => a.url).join(', ') : null
    });

    const guildInfo = message.guild ? `${message.guild.name}/#${message.channel.name}` : 'DM';
    console.log(`📝 Logged message from ${message.author.username} in ${guildInfo}`);
  } catch (error) {
    console.error('Error logging message:', error);
  }
});

// Track when user joins a new guild
client.on('guildCreate', (guild) => {
  console.log(`➕ User joined guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
});

// Track when user leaves a guild
client.on('guildDelete', (guild) => {
  console.log(`➖ User left guild: ${guild.name} (${guild.id})`);
});

// Handle errors
client.on('error', error => console.error('Discord client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));

// Login with user token
client.login(config.userToken);

module.exports = client;
