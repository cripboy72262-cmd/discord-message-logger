const commands = {
  async handleCommand(message, client, logger) {
    try {
      const args = message.content.slice(1).split(/ +/);
      const command = args.shift().toLowerCase();

      switch (command) {
        case 'help':
          await message.reply('**Commands:** ?help, ?stats, ?user <id> <ch>, ?search <keyword>, ?guilds, ?ping');
          break;
        case 'stats':
          logger.getStats((stats) => {
            message.reply(`📊 **Stats:** ${stats.totalMessages || 0} messages, ${stats.uniqueUsers || 0} users`);
          });
          break;
        case 'user':
          if (args.length < 2) {
            message.reply('Usage: ?user <user_id> <channel_id>');
            return;
          }
          logger.getMessagesByUserAndChannel(args[0], args[1], (msgs) => {
            message.reply(`Found ${msgs.length} messages`);
          });
          break;
        case 'search':
          if (args.length === 0) {
            message.reply('Usage: ?search <keyword>');
            return;
          }
          logger.searchByKeyword(args.join(' '), (msgs) => {
            message.reply(`Found ${msgs.length} messages`);
          });
          break;
        case 'guilds':
          const guilds = client.guilds.cache;
          message.reply(`📍 In ${guilds.size} guild(s)`);
          break;
        case 'ping':
          const sent = await message.reply('🏓 Pinging...');
          const latency = sent.timestamp - message.timestamp;
          await sent.edit(`🏓 Pong! ${latency}ms`);
          break;
      }
    } catch (error) {
      console.error('Command error:', error);
    }
  }
};

module.exports = commands;
