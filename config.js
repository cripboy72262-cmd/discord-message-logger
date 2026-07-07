module.exports = {
  userToken: process.env.USER_TOKEN || '',
  dbPath: process.env.DB_PATH || './messages.db',

  // Validation
  validate() {
    if (!this.userToken) {
      throw new Error('USER_TOKEN is not set in .env file');
    }
  }
};
