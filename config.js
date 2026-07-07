module.exports = {
  discordToken: process.env.DISCORD_TOKEN || '',
  dbPath: process.env.DB_PATH || './messages.db',

  // Validation - only token is required now (logs all guilds)
  validate() {
    if (!this.discordToken) {
      throw new Error('DISCORD_TOKEN is not set in .env file');
    }
  }
};
