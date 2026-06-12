# 🚀 DaintyBot Setup Guide

## Quick Start (3 steps)

### Step 1: Run Setup Wizard
```bash
node setup.js
```

The wizard will prompt you for:
- **DISCORD_TOKEN** - Your bot's token (from Developer Portal)
- **CLIENT_ID** - Your app's Application ID
- **GUILD_ID** - Your server ID (optional, has default)
- **LOG_CHANNEL_ID** - Your logging channel (optional, has default)
- **MODERATOR_ROLE_IDS** - Moderator roles (optional)

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Deploy & Start
```bash
# Deploy slash commands
npm run deploy

# Start the bot
npm start
```

---

## 🔐 Security Best Practices

✅ **Do:**
- Keep `.env` file private (never commit to Git)
- Reset your token if it's exposed
- Use the setup wizard for secure input
- Store credentials locally only

❌ **Don't:**
- Share `.env` file contents
- Post token in chat/Discord
- Commit `.env` to version control
- Hardcode credentials in code

---

## 📋 Getting Your Credentials

### Discord Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **Bot** section
4. Click **Reset Token** (if previously exposed)
5. Copy the new token

### Client ID
1. In Developer Portal, go to **General Information**
2. Copy the **Application ID**

### Guild ID (Server ID)
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click your server name
3. Click **Copy Server ID**

### Log Channel ID
1. Right-click the channel where logs should go
2. Click **Copy Channel ID**

### Moderator Role IDs
1. Right-click each moderator role
2. Click **Copy Role ID**
3. Separate multiple IDs with commas

---

## ✅ Verification Checklist

After setup, verify everything:

```bash
# Check that .env exists
ls -la .env

# Verify bot can access Discord
npm start

# Look for this in console:
# ✅ Bot logged in as YourBot#0000
```

---

## 🆘 Troubleshooting

### "Token is invalid"
- ✅ Reset your token in Developer Portal
- ✅ Copy the NEW token (not the old one)
- ✅ Restart bot: `npm start`

### "Bot not responding to commands"
- ✅ Run `npm run deploy` to register commands
- ✅ Verify `GUILD_ID` is correct
- ✅ Check bot has `applications.commands` scope

### ".env file not found"
- ✅ Run `node setup.js` from project root
- ✅ Ensure you're in the DaintyBot directory
- ✅ Check file permissions

### "Cannot read properties of undefined"
- ✅ Missing environment variable
- ✅ Run setup wizard again: `node setup.js`
- ✅ Verify all required fields are filled

---

## 🚀 Deployment (Railway)

For Railway deployment:

1. Connect your GitHub repo
2. **Add these environment variables in Railway dashboard:**
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
   - `LOG_CHANNEL_ID`
   - `MODERATOR_ROLE_IDS`

3. Set **Start Command**: `npm start`

**Never commit `.env` to Git** — Railway reads env vars from dashboard only.

---

## 📚 Additional Resources

- [Discord.js v14 Docs](https://discord.js.org/docs/packages/discord.js/14.14.0)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Railway Docs](https://docs.railway.app/)

---

## ❓ Need Help?

Check `README.md` for full documentation on commands and features.

**Setup complete! Your bot is ready to go! 🎉**
