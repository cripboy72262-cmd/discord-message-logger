module.exports = {
  userToken: process.env.USER_TOKEN || '',
  dbPath: process.env.RAILWAY_VOLUME_MOUNT_PATH ? `${process.env.RAILWAY_VOLUME_MOUNT_PATH}/messages.db` : './data/messages.db'
};
