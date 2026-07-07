# Discord Message Logger (User Token)

⚠️ **DISCLAIMER**: This uses a Discord user account token for logging. Using user tokens for automation violates Discord's Terms of Service and may result in account termination. Use at your own risk.

A Discord user account message logger that captures all messages from servers the user account is in and stores them in a local SQLite database.

## Features

- 📝 Logs all messages from all Discord servers the user account is in
- 📊 Stores messages in a local SQLite database with full metadata
- 👤 Tracks author information, timestamps, and guild details
- 🔗 Captures attachments and links
- 🛡️ Ignores own messages automatically
- 📍 Shows which guilds the account is monitoring
- ➕ Auto-detects when account joins/leaves guilds
- 🔐 Private and local - no external data transmission

## Installation

### Prerequisites

- Node.js 16.11.0 or higher
- npm or yarn
- Discord user account (with token)

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

4. **Get your user token:**
   - Open Discord in a browser
   - Open Developer Tools (F12)
   - Go to Application → Local Storage → https://discord.com
   - Find `token` key and copy the value (it's in quotes, remove them)
   - Add it to your `.env` file:
     ```
     USER_TOKEN=your_token_here
     DB_PATH=./messages.db
     ```

5. **Start the logger:**
   ```bash
   npm start
   ```

## Usage

### Starting the Logger

```bash
npm start          # Production mode
npm run dev        # Development mode with auto-reload (requires nodemon)
```

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

This logger will:
- ✅ Automatically log messages from ALL servers your account is in
- ✅ Track guild names alongside message data
- ✅ Notify console when account joins/leaves guilds
- ✅ Display all monitored guilds on startup
- ✅ Store all data locally (no external transmission)

## File Structure

```
.
├── index.js          # Main logger entry point (user token)
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
USER_TOKEN=your_user_token_here
DB_PATH=./messages.db
```

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
✅ User account logged in as YourUsername#1234
📍 Monitoring 5 guild(s)
  - My Server (123456789)
  - Test Guild (987654321)
  - Community Hub (555555555)
  - Work Server (111111111)
  - Gaming Group (222222222)
✅ Connected to SQLite database
📊 Messages table ready - logging ALL guilds
📝 Logged message from JohnDoe in My Server/#general
📝 Logged message from JaneSmith in Test Guild/#random
```

## Troubleshooting

### Logger doesn't log messages
- Verify your user token in `.env` is correct
- Make sure the account can access the channels in each server
- Restart the logger after making changes
- Check that your account hasn't been rate-limited

### Database errors
- Ensure `sqlite3` is properly installed
- Delete `messages.db` and restart to reset the database
- Check disk space availability

### Token invalid
- Tokens can expire - regenerate by getting a new one from Discord
- Make sure there are no extra spaces or quotes in the token

### Account getting flagged
- Discord may detect unusual activity
- Run this on a personal, disposable account if concerned
- Don't use it in too many servers simultaneously

## Security Notes

⚠️ **Important**:
- Keep your user token **SECRET** - never share it
- Don't commit `.env` to git
- This tool stores messages locally only
- Your account may be at risk if Discord detects the token usage

## Legal Notice

This project is for educational purposes. Users are responsible for complying with Discord's Terms of Service. The author assumes no liability for account suspension or other consequences.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
