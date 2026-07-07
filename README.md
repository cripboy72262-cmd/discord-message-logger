# Discord Message Logger (User Token) - Railway Ready ✅

✅ **This project is now ready for Railway deployment!**

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
- 🔒 Private and local - no external data transmission
- 🚀 **Railway deployment ready with persistent storage**

## Quick Start - Local

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn
- Discord user account token

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/cripboy72262-cmd/discord-message-logger.git
cd discord-message-logger

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Add your user token to .env
# USER_TOKEN=your_token_here

# 5. Start the logger
npm start
```

## Railway Deployment ✅

### Step-by-Step Deployment

1. **Push code to GitHub** (already done)

2. **Create Railway Project**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `discord-message-logger`

3. **Configure Environment Variables**
   - In Railway dashboard, go to Variables
   - Add: `USER_TOKEN` = your Discord user token
   - Add: `NODE_ENV` = `production`
   - Add: `DB_PATH` = `/app/data/messages.db`

4. **Enable Persistent Storage**
   - In Railway dashboard, go to Storage
   - Add a volume
   - Mount path: `/app/data`
   - This ensures your database persists across restarts

5. **Deploy**
   - Railway will automatically build and deploy
   - Check logs to confirm successful connection

### Expected Console Output

```
==================================================
✅ User account logged in as YourUsername#1234
📍 Monitoring 5 guild(s)

📋 Guilds being monitored:
  ✓ My Server (123456789) - 12 channels
  ✓ Test Guild (987654321) - 8 channels
  ✓ Community Hub (555555555) - 25 channels
  ✓ Work Server (111111111) - 5 channels
  ✓ Gaming Group (222222222) - 15 channels
==================================================

✅ Connected to SQLite database at /app/data/messages.db
📊 Messages table ready - logging ALL guilds
📈 Total messages in database: 0

📝 [10:30:45 AM] Logged: JohnDoe in My Server/#general
📝 [10:31:02 AM] Logged: JaneSmith in Test Guild/#random
```

## Getting Your User Token

1. Open Discord in a **web browser** (not desktop app)
2. Press **F12** to open Developer Tools
3. Go to **Application → Local Storage → https://discord.com**
4. Find the `token` key (copy just the value, remove quotes)
5. Paste into Railway environment variables as `USER_TOKEN`

⚠️ **KEEP YOUR TOKEN SECRET** - Never share it or commit it to git!

## How It Works

- **Local Logging**: All messages are logged to `messages.db` on the server
- **Multi-Guild**: Automatically logs from all servers your account is in
- **No External Data**: Everything stays in your database
- **Persistent Storage**: Railway volume ensures data survives restarts
- **Auto-Recovery**: Railway will automatically restart if the process crashes

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

## File Structure

```
.
├── index.js              # Main logger entry point
├── config.js             # Configuration management
├── logger.js             # Database logging logic
├── package.json          # Project dependencies & scripts
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── railway.json          # Railway deployment config ✅
├── Dockerfile            # Docker configuration (Railway uses this)
├── start.sh              # Startup script
└── README.md             # This file
```

## Troubleshooting

### Deploy Issues

**Build fails on Railway**
- Check that `package.json` is correctly formatted
- Ensure Node.js engine requirement is met (16+)
- Check build logs in Railway dashboard

**Database not persisting**
- Verify volume is mounted at `/app/data`
- Check Railway storage settings

**User token errors**
- Confirm `USER_TOKEN` is set in environment variables
- Ensure token is copied correctly (no extra spaces)
- Try getting a new token from Discord

### Local Issues

**Logger doesn't log messages**
- Verify user token is correct and valid
- Make sure account can access the channels
- Restart the logger
- Check Discord hasn't flagged the account

**Database errors**
- Delete `messages.db` and restart
- Check disk space
- Verify write permissions

**Token invalid**
- Tokens can expire - get a fresh one from Discord
- No extra spaces or quotes around the token

## Security Notes

⚠️ **Important**:
- Keep your user token **ABSOLUTELY SECRET**
- Never commit `.env` to git
- All messages are stored locally
- Your account is at risk using user tokens with automation
- Discord may detect and suspend the account

## Legal Notice

This project is for **educational purposes only**. Users are responsible for complying with Discord's Terms of Service. The author assumes no liability for account suspension or other consequences of using this tool.

## Performance Tips

- **Railway**: Use persistent volume for best performance
- **Local**: SQLite can handle millions of messages
- **Monitoring**: Check logs regularly in Railway dashboard
- **Cleanup**: Database can grow large - consider periodic exports

## Monitoring on Railway

1. Go to your Railway project
2. Click on the service
3. View **Logs** tab for real-time output
4. Check **Metrics** for CPU/Memory usage
5. View **Environment** for variable management

## Support

For issues, check:
- Railway status: [status.railway.app](https://status.railway.app)
- Discord API: [discord.js docs](https://discord.js.org/)
- This repo: [GitHub Issues](https://github.com/cripboy72262-cmd/discord-message-logger/issues)

## License

MIT

---

**Ready to deploy? Push to GitHub and connect your Railway project!** 🚀
