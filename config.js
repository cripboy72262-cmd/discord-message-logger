module.exports = {
  userToken: process.env.USER_TOKEN || '',
  dbPath: process.env.DB_PATH || process.env.RAILWAY_VOLUME_MOUNT_PATH ? `${process.env.RAILWAY_VOLUME_MOUNT_PATH}/messages.db` : './messages.db',
  environment: process.env.NODE_ENV || 'development',

  // Validation
  validate() {
    if (!this.userToken) {
      throw new Error('USER_TOKEN is not set in environment variables');
    }
    
    console.log(`Environment: ${this.environment}`);
    console.log(`Database path: ${this.dbPath}`);
  }
};
