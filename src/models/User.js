const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  discordId: { type: String, unique: true, required: true },
  username: String,
  email: String,
  passwordHash: String,
  avatar: String,
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  settings: {
    autoLog: { type: Boolean, default: true },
    includeEmbeds: { type: Boolean, default: true },
    includeMentions: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.setPassword = async function(password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);
