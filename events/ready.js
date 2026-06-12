const storage = require('../utils/storage');
const errorHandler = require('../utils/errorHandler');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    client.user.setActivity('moderation & tickets', { type: 'WATCHING' });

    // Reload tempbans on startup
    try {
      const tempbans = storage.read('tempbans');
      let reloadCount = 0;

      for (const [userId, banData] of Object.entries(tempbans)) {
        const expiryTime = new Date(banData.expiresAt).getTime();
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        if (timeUntilExpiry <= 0) {
          // Expired, unban immediately
          try {
            const guild = await client.guilds.fetch(banData.guildId);
            await guild.members.unban(userId, 'Temporary ban expired');
            console.log(`⏰ Automatically unbanned user ${userId}`);
            storage.delete('tempbans', userId);
          } catch (error) {
            console.error(`Error auto-unbanning ${userId}:`, error);
          }
        } else {
          // Set timer for expiry
          setTimeout(() => {
            client.systems.tempban.handleTempbanExpiry(client, userId, banData);
          }, timeUntilExpiry);
          reloadCount++;
        }
      }

      if (reloadCount > 0) {
        console.log(`⏰ Reloaded ${reloadCount} active tempbans`);
      }
    } catch (error) {
      console.error('Error reloading tempbans:', error);
      errorHandler.logError(client, error, 'Tempban Reload Error');
    }
  },
};
