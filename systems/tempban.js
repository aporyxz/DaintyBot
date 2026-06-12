const { EmbedBuilder } = require('discord.js');
const storage = require('../utils/storage');
const embedUtils = require('../utils/embed');
const validator = require('../utils/validator');
const permissions = require('../utils/permissions');
const moderation = require('./moderation');

const tempban = {
  async ban(interaction, users, duration, reason) {
    if (!validator.validateBulkUserCount(users)) {
      return embedUtils.error('Invalid Users', 'Provide 1-20 users to tempban');
    }

    if (!validator.isValidDuration(duration)) {
      return embedUtils.error('Invalid Duration', 'Use format: 1s, 5m, 1h, 7d (max 90d)');
    }

    if (!validator.validateReason(reason)) {
      return embedUtils.error('Invalid Reason', 'Reason must be 1-512 characters');
    }

    const durationMs = validator.parseDuration(duration);
    const maxDuration = 90 * 24 * 60 * 60 * 1000; // 90 days

    if (durationMs > maxDuration) {
      return embedUtils.error('Duration Too Long', 'Maximum tempban duration is 90 days');
    }

    const formattedDuration = validator.formatDuration(durationMs);
    const expiryTime = new Date(Date.now() + durationMs);

    const results = await moderation.processBulkUsers(users, async (user) => {
      const member = await interaction.guild.members.fetch(user.id);
      
      if (!await permissions.canModerateUser(interaction.member, member)) {
        throw new Error(`Cannot tempban ${user.tag} (higher or equal role)`);
      }

      // Ban user
      await interaction.guild.members.ban(user, { reason });

      // Store tempban data
      const tempbanData = {
        userId: user.id,
        guildId: interaction.guild.id,
        moderatorId: interaction.user.id,
        reason,
        expiresAt: expiryTime.toISOString(),
        bannedAt: new Date().toISOString()
      };

      storage.append('tempbans', user.id, tempbanData);

      // Send DM to user
      await moderation.sendDMNotification(user, embedUtils.dmNotification(
        'Temporarily Banned',
        reason,
        interaction.user.tag,
        interaction.guild.name,
        formattedDuration
      ));

      // Set timer for auto-unban
      setTimeout(() => {
        this.handleTempbanExpiry(interaction.client, user.id, tempbanData);
      }, durationMs);
    });

    const logEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⏰ Temporary Ban')
      .addFields(
        { name: 'Users', value: results.success.map(u => `${u} (${u.id})`).join('\n') || 'None', inline: false },
        { name: 'Moderator', value: `${interaction.user} (${interaction.user.id})`, inline: false },
        { name: 'Duration', value: formattedDuration, inline: true },
        { name: 'Expires At', value: expiryTime.toISOString(), inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Count', value: `${results.success.length}/${users.length}`, inline: true }
      )
      .setTimestamp();

    if (results.failed.length > 0) {
      logEmbed.addFields({ name: 'Failed', value: results.failed.map(f => `${f.user.tag}: ${f.error}`).join('\n') });
    }

    await moderation.logAction(interaction.client, logEmbed);

    return embedUtils.success('Temporary Ban', `${results.success.length}/${users.length} user(s) temporarily banned for ${formattedDuration}`);
  },

  async handleTempbanExpiry(client, userId, tempbanData) {
    try {
      const guild = await client.guilds.fetch(tempbanData.guildId);
      
      // Unban user
      await guild.members.unban(userId, 'Temporary ban expired');

      // Remove from storage
      storage.delete('tempbans', userId);

      // Log the automatic unban
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor('#00AA00')
          .setTitle('✅ Automatic Unban')
          .addFields(
            { name: 'User ID', value: userId, inline: true },
            { name: 'Original Ban Reason', value: tempbanData.reason, inline: false },
            { name: 'Banned At', value: tempbanData.bannedAt, inline: true },
            { name: 'Unbanned At', value: new Date().toISOString(), inline: true }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }

      console.log(`✅ Automatically unbanned user ${userId}`);
    } catch (error) {
      console.error(`Error during tempban expiry for user ${userId}:`, error);
      
      // Still remove from storage even if unban fails
      storage.delete('tempbans', userId);
    }
  }
};

module.exports = tempban;
