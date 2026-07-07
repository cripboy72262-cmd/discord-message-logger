module.exports = {
  discordToken: process.env.DISCORD_TOKEN || '',
  guildId: process.env.GUILD_ID || '',
  logChannelId: process.env.LOG_CHANNEL_ID || '',
  dbPath: process.env.DB_PATH || './messages.db',

  // Validation
  validate() {
    if (!this.discordToken) {
      throw new Error('DISCORD_TOKEN is not set in .env file');
    }
    if (!this.guildId) {
      throw new Error('GUILD_ID is not set in .env file');
    }
  }
};
