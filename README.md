# DaintyBot - Production-Ready Discord Moderation Bot

A fully-featured, production-ready Discord.js v14 bot with moderation, ticketing, and voice management systems.

## Features

### 🛡️ Moderation System
- **Ban** - Ban single or multiple users
- **Kick** - Kick single or multiple users
- **Timeout** - Timeout users with custom duration
- **Tempban** - Temporary bans with automatic unban (persists across restarts)
- Full user DM notifications with reason and duration
- Comprehensive logging to dedicated channel

### 🎫 Ticket System
- User-friendly ticket panel with buttons
- Automatic private ticket channel creation
- Moderator claiming system
- Ticket transcripts (saved as files)
- User notifications with transcript on close
- Automatic channel cleanup

### 🎙️ Voice Management
- **Voice Kick** - Disconnect users from voice
- **Voice Mute** - Mute users in voice
- **Voice Unmute** - Unmute users in voice
- **Voice Move** - Move users between voice channels
- All actions send user notifications

### 📊 Logging & Storage
- Centralized logging to single channel
- JSON-based persistent storage
- Automatic tempban reload on bot restart
- Error tracking and reporting

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/aporyxz/DaintyBot.git
cd DaintyBot
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Fill in your environment variables**
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
LOG_CHANNEL_ID=your_log_channel_id_here
MODERATOR_ROLE_IDS=role_id_1,role_id_2,role_id_3
```

5. **Deploy slash commands**
```bash
npm run deploy
```

6. **Start the bot**
```bash
npm start
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | Yes | Your bot's Discord token |
| `CLIENT_ID` | Yes | Your bot's client ID |
| `GUILD_ID` | Yes | Your server's guild ID |
| `LOG_CHANNEL_ID` | Yes | Channel ID for logging |
| `MODERATOR_ROLE_IDS` | No | Comma-separated moderator role IDs |

### Moderator Setup

If `MODERATOR_ROLE_IDS` is not set, the bot falls back to checking the `ModerateMembers` permission.

Example with multiple roles:
```env
MODERATOR_ROLE_IDS=12345678901,98765432109,11111111111
```

## Commands

### Moderation

| Command | Options | Description |
|---------|---------|-------------|
| `/ban` | users, reason | Ban user(s) |
| `/kick` | users, reason | Kick user(s) |
| `/timeout` | users, duration, reason | Timeout user(s) |
| `/tempban` | users, duration, reason | Temporarily ban user(s) |

### Voice

| Command | Options | Description |
|---------|---------|-------------|
| `/voice-kick` | users, reason | Disconnect from voice |
| `/voice-mute` | users, reason | Mute in voice |
| `/voice-unmute` | users, reason | Unmute in voice |
| `/voice-move` | users, channel, reason | Move to channel |

### Tickets

| Command | Options | Description |
|---------|---------|-------------|
| `/ticket-panel` | title, description | Create ticket panel |

## Duration Format

All duration options support:
- `s` - seconds (e.g., `30s`)
- `m` - minutes (e.g., `5m`)
- `h` - hours (e.g., `1h`)
- `d` - days (e.g., `7d`)

**Example:** `/timeout users:@user duration:1h reason:Spam`

## Architecture

```
DaintyBot/
├── index.js                 # Main entry point
├── deploy-commands.js       # Command deployment
├── commands/
│   ├── moderation/
│   │   ├── ban.js
│   │   ├── kick.js
│   │   ├── timeout.js
│   │   └── tempban.js
│   ├── voice/
│   │   ├── voice-kick.js
│   │   ├── voice-mute.js
│   │   ├── voice-unmute.js
│   │   └── voice-move.js
│   └── tickets/
│       └── ticket-panel.js
├── events/
│   ├── ready.js             # Bot startup
│   └── interactionCreate.js # Interaction handler
├── systems/
│   ├── moderation.js        # Moderation logic
│   ├── tempban.js           # Temporary ban system
│   ├── voice.js             # Voice management
│   └── tickets.js           # Ticket system
├── utils/
│   ├── embed.js             # Embed utilities
│   ├── embed.js             # Embed builders
│   ├── validator.js         # Input validation
│   ├── permissions.js       # Permission checks
│   ├── storage.js           # JSON storage
│   ├── transcript.js        # Ticket transcripts
│   ├── errorHandler.js      # Error logging
│   └── envValidator.js      # Env validation
├── data/                    # Persistent data
│   ├── tempbans.json
│   ├── tickets.json
│   └── transcripts/
└── package.json
```

## Features in Detail

### Tempban System
- Bans user immediately
- Stores expiry time in persistent JSON storage
- Automatically unbans when timer expires
- Survives bot restarts (timers are rebuilt on startup)
- Logs both ban and automatic unban events

### Ticket System
- Users can open tickets with a single button click
- Tickets are private (user + mods only)
- Moderators can claim tickets
- On close, transcript is generated and sent to user
- Channel is automatically deleted after 5 seconds

### Error Handling
- All commands wrapped in try/catch
- Global unhandled rejection handler
- All errors logged to dedicated channel
- Bot never crashes

### Rate Limiting
- Bulk operations process sequentially
- 250ms delay between user operations (configurable)
- Safe failure isolation per user

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Use `npm start` as start command
4. Deploy!

### Environment Variables on Railway
```
DISCORD_TOKEN
CLIENT_ID
GUILD_ID
LOG_CHANNEL_ID
MODERATOR_ROLE_IDS
```

## Logging

All actions are logged to the configured `LOG_CHANNEL_ID`:
- ✅ Successful moderation actions
- ⏰ Temporary bans (start and auto-unban)
- 🎫 Ticket creation, claims, closes
- 🎙️ Voice actions
- ⚠️ Errors and exceptions

## Troubleshooting

### Bot not responding to commands
- Run `npm run deploy` to register commands
- Ensure `GUILD_ID` is correct
- Check bot has `applications.commands` scope

### Tempban not auto-unbanning
- Check `data/tempbans.json` exists
- Verify `LOG_CHANNEL_ID` is accessible
- Check bot has ban permissions

### Ticket system not working
- Ensure bot has channel creation permissions
- Verify `MODERATOR_ROLE_IDS` are correct
- Check `LOG_CHANNEL_ID` exists

## Support & Contributions

For issues or suggestions, please open an issue on GitHub.

## License

MIT
