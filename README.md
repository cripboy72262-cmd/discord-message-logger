# Discord Message Logger

A Discord bot that automatically logs all messages from **all guilds** the bot is in to a local SQLite database.

## Features

- 📝 Logs all messages from all Discord servers (guilds) the bot is in
- 📊 Stores messages in a local SQLite database with full metadata
- 👤 Tracks author information, timestamps, and guild details
- 🔗 Captures attachments and links
- 🛡️ Ignores bot messages automatically
- 📍 Shows which guilds the bot is monitoring
- ➕ Auto-detects when bot joins/leaves guilds

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
   - Add it to your `.env` file:
     ```
     DISCORD_TOKEN=your_token_here
     DB_PATH=./messages.db
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

### Bot Permissions

Make sure your bot has these permissions in each guild:
- View Channels
- Read Messages/View Channels
- Read Message History

### Database

Messages are stored in `messages.db` (SQLite). The database includes:
- Message ID
- Author ID, username, and discriminator
- Message content
- Channel ID and name
- Guild ID and name
- Timestamp
- Attachments

## Multi-Guild Support

This bot will:
- ✅ Automatically log messages from ALL guilds it's in
- ✅ Track guild names alongside message data
- ✅ Notify console when joining/leaving guilds
- ✅ Display all monitored guilds on startup
- ✅ No configuration needed - just add the bot to guilds!

## File Structure

```
.
├── index.js          # Main bot entry point (handles all guilds)
├── config.js         # Configuration management
├── logger.js         # Database logging logic
├── package.json      # Project dependencies
├── .env              # Environment variables (not in git)
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Configuration

Edit your `.env` file:

```env
DISCORD_TOKEN=your_bot_token_here
DB_PATH=./messages.db
```

**Note:** No `GUILD_ID` required! The bot logs all guilds automatically.

## Database Schema

The `messages` table contains:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| messageId | TEXT | Discord message ID (unique) |
| authorId | TEXT | User ID |
| authorName | TEXT | Username |
| authorDiscriminator | TEXT | User discriminator |
| content | TEXT | Message content |
| channelId | TEXT | Channel ID |
| channelName | TEXT | Channel name |
| guildId | TEXT | Guild/Server ID |
| guildName | TEXT | Guild/Server name |
| timestamp | INTEGER | Message timestamp |
| attachments | TEXT | Comma-separated attachment URLs |
| createdAt | DATETIME | Database entry creation time |

## Console Output Example

```
✅ Bot logged in as YourBot#1234
📍 Bot is in 3 guild(s)
  - My Server (123456789)
  - Test Guild (987654321)
  - Community Hub (555555555)
✅ Connected to SQLite database
📊 Messages table ready - logging ALL guilds
📝 Logged message from JohnDoe in My Server/#general
📝 Logged message from JaneSmith in Test Guild/#random
```

## Troubleshooting

### Bot doesn't log messages
- Verify your token in `.env` is correct
- Make sure the bot has "Read Messages" permission in the guilds
- Check that the bot has "Read Message History" enabled
- Restart the bot after changing permissions

### Database errors
- Ensure `sqlite3` is properly installed
- Delete `messages.db` and restart to reset the database
- Check disk space availability

### Guild not appearing
- The bot only logs guilds it has joined
- Check if the bot actually has access to channels in that guild
- Use the console output to verify which guilds are loaded

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
