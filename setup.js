const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const envPath = path.join(__dirname, '.env');

async function setup() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║     🤖 DaintyBot Setup Wizard 🤖           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (yes/no): ');
    if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
      console.log('\n❌ Setup cancelled. Existing .env preserved.\n');
      rl.close();
      process.exit(0);
    }
  }

  console.log('\n📋 Please provide your Discord bot credentials:\n');
  console.log('ℹ️  Get these from: https://discord.com/developers/applications\n');

  // DISCORD_TOKEN
  console.log('1️⃣  DISCORD_TOKEN');
  console.log('   📍 Go to: Bot → Copy Token (Reset if exposed)');
  const token = await question('   🔐 Enter your bot token: ');
  if (!token || token.trim().length === 0) {
    console.log('\n❌ Token is required!\n');
    rl.close();
    process.exit(1);
  }

  // CLIENT_ID
  console.log('\n2️⃣  CLIENT_ID');
  console.log('   📍 Go to: General Information → Application ID');
  const clientId = await question('   🆔 Enter your client ID: ');
  if (!clientId || !/^\d+$/.test(clientId)) {
    console.log('\n❌ Client ID must be a valid number!\n');
    rl.close();
    process.exit(1);
  }

  // GUILD_ID
  console.log('\n3️⃣  GUILD_ID');
  console.log('   📍 Right-click your Discord server → Copy Server ID');
  console.log('   💡 You already have this: 1460307567837188288');
  const guildId = await question('   🏢 Enter your guild ID (press Enter to use default): ');
  const finalGuildId = guildId.trim() || '1460307567837188288';

  // LOG_CHANNEL_ID
  console.log('\n4️⃣  LOG_CHANNEL_ID');
  console.log('   📍 Right-click your log channel → Copy Channel ID');
  console.log('   💡 You already have this: 1500228669992603668');
  const logChannelId = await question('   📝 Enter your log channel ID (press Enter to use default): ');
  const finalLogChannelId = logChannelId.trim() || '1500228669992603668';

  // MODERATOR_ROLE_IDS
  console.log('\n5️⃣  MODERATOR_ROLE_IDS (Optional)');
  console.log('   📍 Right-click moderator role → Copy Role ID');
  console.log('   💡 Enter comma-separated role IDs (or press Enter to skip)');
  const modRoles = await question('   👮 Enter moderator role IDs (comma-separated): ');
  const finalModRoles = modRoles.trim() || 'role_id_1,role_id_2,role_id_3';

  // Create .env content
  const envContent = `# 🤖 DaintyBot Environment Variables
# Generated on ${new Date().toISOString()}

DISCORD_TOKEN=${token}
CLIENT_ID=${clientId}
GUILD_ID=${finalGuildId}
LOG_CHANNEL_ID=${finalLogChannelId}
MODERATOR_ROLE_IDS=${finalModRoles}
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     ✅ Setup Complete! ✅                   ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log('📄 .env file created successfully!');
    console.log(`📍 Location: ${envPath}\n`);
    console.log('🔐 Security Notice:');
    console.log('   • .env is NOT committed to Git ✅');
    console.log('   • Never share your .env file ✅');
    console.log('   • Token is safely stored locally ✅\n');
    console.log('📦 Next steps:\n');
    console.log('   1. Install dependencies:');
    console.log('      npm install\n');
    console.log('   2. Deploy commands:');
    console.log('      npm run deploy\n');
    console.log('   3. Start the bot:');
    console.log('      npm start\n');
    console.log('✨ Your bot will be online shortly!\n');
  } catch (error) {
    console.log('\n❌ Error creating .env file:');
    console.error(error.message);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

setup().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
