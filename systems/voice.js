const { EmbedBuilder } = require('discord.js');
const embedUtils = require('../utils/embed');
const permissions = require('../utils/permissions');
const moderation = require('./moderation');
const validator = require('../utils/validator');

const voice = {
  async kick(interaction, users, reason) {
    if (!validator.validateBulkUserCount(users)) {
      return embedUtils.error('Invalid Users', 'Provide 1-20 users to voice kick');
    }

    if (!validator.validateReason(reason)) {
      return embedUtils.error('Invalid Reason', 'Reason must be 1-512 characters');
    }

    const results = await moderation.processBulkUsers(users, async (user) => {
      const member = await interaction.guild.members.fetch(user.id);

      // Check if user is in voice
      if (!member.voice.channel) {
        throw new Error(`${user.tag} is not in a voice channel`);
      }

      // Check permissions
      if (!await permissions.canModerateUser(interaction.member, member)) {
        throw new Error(`Cannot voice kick ${user.tag} (higher or equal role)`);
      }

      // Disconnect from voice
      await member.voice.disconnect(reason);

      // Send DM notification
      await moderation.sendDMNotification(user, embedUtils.dmNotification(
        'Disconnected from Voice',
        reason,
        interaction.user.tag,
        interaction.guild.name
      ));
    });

    const logEmbed = new EmbedBuilder()
      .setColor('#FF6B00')
      .setTitle('🔊 Voice Kick')
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

    await moderation.logAction(interaction.client, logEmbed);

    return embedUtils.success('Voice Kick', `${results.success.length}/${users.length} user(s) disconnected from voice`);
  },

  async mute(interaction, users, reason) {
    if (!validator.validateBulkUserCount(users)) {
      return embedUtils.error('Invalid Users', 'Provide 1-20 users to mute');
    }

    if (!validator.validateReason(reason)) {
      return embedUtils.error('Invalid Reason', 'Reason must be 1-512 characters');
    }

    const results = await moderation.processBulkUsers(users, async (user) => {
      const member = await interaction.guild.members.fetch(user.id);

      // Check if user is in voice
      if (!member.voice.channel) {
        throw new Error(`${user.tag} is not in a voice channel`);
      }

      // Check permissions
      if (!await permissions.canModerateUser(interaction.member, member)) {
        throw new Error(`Cannot mute ${user.tag} (higher or equal role)`);
      }

      // Mute user
      await member.voice.setMute(true, reason);

      // Send DM notification
      await moderation.sendDMNotification(user, embedUtils.dmNotification(
        'Muted in Voice',
        reason,
        interaction.user.tag,
        interaction.guild.name
      ));
    });

    const logEmbed = new EmbedBuilder()
      .setColor('#FF9900')
      .setTitle('🔇 Voice Mute')
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

    await moderation.logAction(interaction.client, logEmbed);

    return embedUtils.success('Voice Mute', `${results.success.length}/${users.length} user(s) muted`);
  },

  async unmute(interaction, users, reason) {
    if (!validator.validateBulkUserCount(users)) {
      return embedUtils.error('Invalid Users', 'Provide 1-20 users to unmute');
    }

    if (!validator.validateReason(reason)) {
      return embedUtils.error('Invalid Reason', 'Reason must be 1-512 characters');
    }

    const results = await moderation.processBulkUsers(users, async (user) => {
      const member = await interaction.guild.members.fetch(user.id);

      // Check if user is in voice
      if (!member.voice.channel) {
        throw new Error(`${user.tag} is not in a voice channel`);
      }

      // Check permissions
      if (!await permissions.canModerateUser(interaction.member, member)) {
        throw new Error(`Cannot unmute ${user.tag} (higher or equal role)`);
      }

      // Unmute user
      await member.voice.setMute(false, reason);

      // Send DM notification
      await moderation.sendDMNotification(user, embedUtils.dmNotification(
        'Unmuted in Voice',
        reason,
        interaction.user.tag,
        interaction.guild.name
      ));
    });

    const logEmbed = new EmbedBuilder()
      .setColor('#00AA00')
      .setTitle('🔊 Voice Unmute')
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

    await moderation.logAction(interaction.client, logEmbed);

    return embedUtils.success('Voice Unmute', `${results.success.length}/${users.length} user(s) unmuted`);
  },

  async move(interaction, users, channel, reason) {
    if (!validator.validateBulkUserCount(users)) {
      return embedUtils.error('Invalid Users', 'Provide 1-20 users to move');
    }

    if (!channel || !channel.isVoice()) {
      return embedUtils.error('Invalid Channel', 'Target must be a voice channel');
    }

    if (!validator.validateReason(reason)) {
      return embedUtils.error('Invalid Reason', 'Reason must be 1-512 characters');
    }

    const results = await moderation.processBulkUsers(users, async (user) => {
      const member = await interaction.guild.members.fetch(user.id);

      // Check if user is in voice
      if (!member.voice.channel) {
        throw new Error(`${user.tag} is not in a voice channel`);
      }

      // Check permissions
      if (!await permissions.canModerateUser(interaction.member, member)) {
        throw new Error(`Cannot move ${user.tag} (higher or equal role)`);
      }

      // Move to channel
      await member.voice.setChannel(channel, reason);

      // Send DM notification
      await moderation.sendDMNotification(user, embedUtils.dmNotification(
        'Moved in Voice',
        reason,
        interaction.user.tag,
        interaction.guild.name
      ));
    });

    const logEmbed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('📞 Voice Move')
      .addFields(
        { name: 'Users', value: results.success.map(u => `${u} (${u.id})`).join('\n') || 'None', inline: false },
        { name: 'Target Channel', value: `${channel} (${channel.id})`, inline: false },
        { name: 'Moderator', value: `${interaction.user} (${interaction.user.id})`, inline: false },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Count', value: `${results.success.length}/${users.length}`, inline: true }
      )
      .setTimestamp();

    if (results.failed.length > 0) {
      logEmbed.addFields({ name: 'Failed', value: results.failed.map(f => `${f.user.tag}: ${f.error}`).join('\n') });
    }

    await moderation.logAction(interaction.client, logEmbed);

    return embedUtils.success('Voice Move', `${results.success.length}/${users.length} user(s) moved to ${channel}`);
  }
};

module.exports = voice;
