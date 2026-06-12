require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('⚠️ Environment Validation...');

const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'LOG_CHANNEL_ID'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Missing environment variable: ${envVar}`);
  } else {
    console.log(`✅ ${envVar} loaded`);
  }
});

if (process.env.MODERATOR_ROLE_IDS) {
  const roles = process.env.MODERATOR_ROLE_IDS.split(',').map(r => r.trim());
  console.log(`✅ MODERATOR_ROLE_IDS loaded (${roles.length} roles)`);
} else {
  console.warn('⚠️ MODERATOR_ROLE_IDS not set - using ModerateMembers permission fallback');
}

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created data directory');
}
