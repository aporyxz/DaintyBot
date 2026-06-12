const { EmbedBuilder } = require('discord.js');
const embedUtils = require('../utils/embed');
const validator = require('../utils/validator');
const permissions = require('../utils/permissions');
const errorHandler = require('../utils/errorHandler');

const moderation = {
  async sendDMNotification(user, embed) {
    try {
      await user.send({ embeds: [embed] });
      return true;
    } catch (error) {
      console.warn(`Could not send DM to ${user.tag}:`, error.message);
      return false;
    }
  },

  async logAction(client, embed) {
    try {
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (!logChannel) {
        console.warn('Log channel not found');
        return false;
      }
      await logChannel.send({ embeds: [embed] });
      return true;
    } catch (error) {
      console.error('Error logging action:', error);
      return false;
    }
  },

  async processBulkUsers(users, callback, delayMs = 250) {
    const results = {
      success: [],
      failed: []
    };

    for (const user of users) {
      try {
        await callback(user);
        results.success.push(user);
        
        // Add delay between operations
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        results.failed.push({ user, error: error.message });
      }
    }

    return results;
  },

  async ban(interaction, users, reason) {
    if (!validator.validateBulkUserCount(users)) {
      return embedUtils.error('Invalid Users', 'Provide 1-20 users to ban');
    }

    if (!validator.validateReason(reason)) {
      return embedUtils.error('Invalid Reason', 'Reason must be 1-512 characters');
    }

    const results = await this.processBulkUsers(users, async (user) => {
      const member = await interaction.guild.members.fetch(user.id);
      
      if (!await permissions.canModerateUser(interaction.member, member)) {
        throw new Error(`Cannot ban ${user.tag} (higher or equal role)`);
      }

      await interaction.guild.members.ban(user, { reason });
      await this.sendDMNotification(user, embedUtils.dmNotification(
        'Banned',
        reason,
        interaction.user.tag,
        interaction.guild.name
      ));
    });

    const logEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🔨 Ban')
      .addFields(
        { name: 'Users', value: results.success.map(u => `${u} (${u.id})`).join('\n') || 'None', inline: false },
        { name: 'Moderator', value: `${interaction.user} (${interaction.user.id})`, inline: false },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Count', value: `${results.success.length}/${users.length}`, inline: true }
      )
      .setTimestamp();

    if (results.failed.length > 0) {
      logEmbed.addFields({ name: 'Failed', value: results.failed.map(f => `${f.user.tag}: ${f.error}`).join('\n') });
    }

    await this.logAction(interaction.client, logEmbed);

    return embedUtils.success('Ban', `${results.success.length}/${users.length} user(s) banned`);
  },

  async kick(interaction, users, reason) {
    if (!validator.validateBulkUserCount(users)) {
      return embedUtils.error('Invalid Users', 'Provide 1-20 users to kick');
    }

    if (!validator.validateReason(reason)) {
      return embedUtils.error('Invalid Reason', 'Reason must be 1-512 characters');
    }

    const results = await this.processBulkUsers(users, async (user) => {
      const member = await interaction.guild.members.fetch(user.id);
      
      if (!await permissions.canModerateUser(interaction.member, member)) {
        throw new Error(`Cannot kick ${user.tag} (higher or equal role)`);
      }

      await member.kick(reason);
      await this.sendDMNotification(user, embedUtils.dmNotification(
        'Kicked',
        reason,
        interaction.user.tag,
        interaction.guild.name
      ));
    });

    const logEmbed = new EmbedBuilder()
      .setColor('#FF9900')
      .setTitle('👢 Kick')
      .addFields(
        { name: 'Users', value: results.success.map(u => `${u} (${u.id})`).join('\n') || 'None', inline: false },
        { name: 'Moderator', value: `${interaction.user} (${interaction.user.id})`, inline: false },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Count', value: `${results.success.length}/${users.length}`, inline: true }
      )
      .setTimestamp();

    if (results.failed.length > 0) {
      logEmbed.addFields({ name: 'Failed', value: results.failed.map(f => `${f.user.tag}: ${f.error}`).join('\n') });
    }

    await this.logAction(interaction.client, logEmbed);

    return embedUtils.success('Kick', `${results.success.length}/${users.length} user(s) kicked`);
  },

  async timeout(interaction, users, duration, reason) {
    if (!validator.validateBulkUserCount(users)) {
      return embedUtils.error('Invalid Users', 'Provide 1-20 users to timeout');
    }

    if (!validator.isValidDuration(duration)) {
      return embedUtils.error('Invalid Duration', 'Use format: 1s, 5m, 1h, 7d');
    }

    if (!validator.validateReason(reason)) {
      return embedUtils.error('Invalid Reason', 'Reason must be 1-512 characters');
    }

    const durationMs = validator.parseDuration(duration);
    const formattedDuration = validator.formatDuration(durationMs);

    const results = await this.processBulkUsers(users, async (user) => {
      const member = await interaction.guild.members.fetch(user.id);
      
      if (!await permissions.canModerateUser(interaction.member, member)) {
        throw new Error(`Cannot timeout ${user.tag} (higher or equal role)`);
      }

      await member.timeout(durationMs, reason);
      await this.sendDMNotification(user, embedUtils.dmNotification(
        'Timed Out',
        reason,
        interaction.user.tag,
        interaction.guild.name,
        formattedDuration
      ));
    });

    const logEmbed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('⏱️ Timeout')
      .addFields(
        { name: 'Users', value: results.success.map(u => `${u} (${u.id})`).join('\n') || 'None', inline: false },
        { name: 'Moderator', value: `${interaction.user} (${interaction.user.id})`, inline: false },
        { name: 'Duration', value: formattedDuration, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Count', value: `${results.success.length}/${users.length}`, inline: true }
      )
      .setTimestamp();

    if (results.failed.length > 0) {
      logEmbed.addFields({ name: 'Failed', value: results.failed.map(f => `${f.user.tag}: ${f.error}`).join('\n') });
    }

    await this.logAction(interaction.client, logEmbed);

    return embedUtils.success('Timeout', `${results.success.length}/${users.length} user(s) timed out for ${formattedDuration}`);
  }
};

module.exports = moderation;
