# Discord Message Logger

A Discord bot that automatically logs all messages from your server to a local SQLite database.

## Features

- 📝 Logs all messages from your Discord server
- 💾 Stores messages in a local SQLite database
- 👤 Tracks author information and timestamps
- 🔗 Captures attachments and links
- 🛡️ Ignores bot messages automatically

## Installation

### Prerequisites

- Node.js 16.11.0 or higher
- npm or yarn
- Discord bot token

### Setup Steps

1. **Clone or navigate to the repository:**
   ```bash
   cd discord-message-logger
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your bot:**
   - Get your Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)
   - Get your Guild ID (right-click your server → Copy Server ID)
   - Add these to your `.env` file:
     ```
     DISCORD_TOKEN=your_token_here
     GUILD_ID=your_guild_id_here
     ```

5. **Start the bot:**
   ```bash
   npm start
   ```

## Usage

### Starting the Bot

```bash
npm start          # Production mode
npm run dev        # Development mode with auto-reload (requires nodemon)
```

### Database

Messages are stored in `messages.db` (SQLite). The database includes:
- Message ID
- Author ID and username
- Message content
- Channel information
- Timestamp
- Attachments

## File Structure

```
.
├── index.js          # Main bot entry point
├── config.js         # Configuration management
├── logger.js         # Database logging logic
├── package.json      # Project dependencies
├── .env              # Environment variables (not in git)
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Configuration

Edit your `.env` file to customize:

```env
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_guild_id_here
LOG_CHANNEL_ID=optional_channel_id_here
DB_PATH=./messages.db
```

## Troubleshooting

### Bot doesn't respond
- Verify your token in `.env` is correct
- Make sure the bot has permissions in your Discord server
- Check that your Guild ID is correct

### Database errors
- Ensure `sqlite3` is properly installed
- Delete `messages.db` and restart to reset the database

### Permission issues
- Add these intents to your bot:
  - View Channels
  - Send Messages
  - Read Message History

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
