const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./config');
const logger = require('./logger');

// Initialize Discord client with user token
const client = new Client();

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  logger.closeDatabase();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  logger.closeDatabase();
  client.destroy();
  process.exit(0);
});

// Validate configuration
try {
  config.validate();
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}

// When user account is ready
client.once('ready', () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ User account logged in as ${client.user.username}#${client.user.discriminator}`);
  console.log(`📍 Monitoring ${client.guilds.cache.size} guild(s)`);
  
  // List all guilds the user is in
  if (client.guilds.cache.size > 0) {
    console.log('\n📋 Guilds being monitored:');
    client.guilds.cache.forEach((guild) => {
      console.log(`  ✓ ${guild.name} (${guild.id}) - ${guild.channels.cache.size} channels`);
    });
  } else {
    console.log('⚠️  No guilds found. Add this account to servers to start logging.');
  }
  
  logger.initializeDatabase();
  console.log(`${'='.repeat(50)}\n`);
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
    console.log(`📝 [${new Date().toLocaleTimeString()}] Logged: ${message.author.username} in ${guildInfo}`);
  } catch (error) {
    console.error('Error logging message:', error);
  }
});

// Track when user joins a new guild
client.on('guildCreate', (guild) => {
  console.log(`\n✨ ➕ User joined guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
});

// Track when user leaves a guild
client.on('guildDelete', (guild) => {
  console.log(`\n✨ ➖ User left guild: ${guild.name} (${guild.id})`);
});

// Handle errors
client.on('error', error => {
  console.error('❌ Discord client error:', error.message);
});

client.on('warn', warning => {
  console.warn('⚠️  Discord warning:', warning);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught exception:', error);
  logger.closeDatabase();
  process.exit(1);
});

// Login with user token
client.login(config.userToken).catch(error => {
  console.error('❌ Failed to login:', error.message);
  console.error('Make sure your USER_TOKEN is valid and set in environment variables.');
  process.exit(1);
});

module.exports = client;
