require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const errorHandler = require('./utils/errorHandler');

// Validate environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'LOG_CHANNEL_ID'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

// Collections
client.commands = new Collection();
client.systems = {};

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandCategories = fs.readdirSync(commandsPath);

commandCategories.forEach(category => {
  const categoryPath = path.join(commandsPath, category);
  const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

  commandFiles.forEach(file => {
    const filePath = path.join(categoryPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    }
  });
});

// Load systems
const systemsPath = path.join(__dirname, 'systems');
const systemFiles = fs.readdirSync(systemsPath).filter(file => file.endsWith('.js'));

systemFiles.forEach(file => {
  const filePath = path.join(systemsPath, file);
  const system = require(filePath);
  const systemName = file.replace('.js', '');
  client.systems[systemName] = system;
  console.log(`✅ Loaded system: ${systemName}`);
});

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

eventFiles.forEach(file => {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
  } else {
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
  console.log(`✅ Loaded event: ${event.name}`);
});

// Global error handlers
process.on('unhandledRejection', error => {
  console.error('❌ Unhandled Promise Rejection:', error);
  errorHandler.logError(client, error, 'Unhandled Rejection');
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  errorHandler.logError(client, error, 'Uncaught Exception');
  process.exit(1);
});

client.login(process.env.DISCORD_TOKEN);
