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
  console.log(`📍 Bot is in ${client.guilds.cache.size} guild(s)`);
  
  // List all guilds the bot is in
  client.guilds.cache.forEach((guild) => {
    console.log(`  - ${guild.name} (${guild.id})`);
  });
  
  logger.initializeDatabase();
});

// Log messages from ALL guilds
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

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

// Track when bot joins a new guild
client.on('guildCreate', (guild) => {
  console.log(`➕ Bot joined guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
});

// Track when bot leaves a guild
client.on('guildDelete', (guild) => {
  console.log(`➖ Bot left guild: ${guild.name} (${guild.id})`);
});

// Handle errors
client.on('error', error => console.error('Discord client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));

// Login to Discord
client.login(config.discordToken);

module.exports = client;
