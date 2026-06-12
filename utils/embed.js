const { EmbedBuilder } = require('discord.js');

const embedUtils = {
  success(title, description) {
    return new EmbedBuilder()
      .setColor('#00AA00')
      .setTitle(`✅ ${title}`)
      .setDescription(description)
      .setTimestamp();
  },

  error(title, description) {
    return new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();
  },

  info(title, description) {
    return new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`ℹ️ ${title}`)
      .setDescription(description)
      .setTimestamp();
  },

  warning(title, description) {
    return new EmbedBuilder()
      .setColor('#FFAA00')
      .setTitle(`⚠️ ${title}`)
      .setDescription(description)
      .setTimestamp();
  },

  modLog(title, moderator, user, reason, duration = null) {
    const embed = new EmbedBuilder()
      .setColor('#FF6B00')
      .setTitle(title)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: false },
        { name: 'Moderator', value: `${moderator} (${moderator.id})`, inline: false },
        { name: 'Reason', value: reason || 'No reason provided', inline: false }
      );

    if (duration) {
      embed.addFields({ name: 'Duration', value: duration, inline: false });
    }

    return embed.setTimestamp();
  },

  dmNotification(action, reason, moderator, serverName, duration = null, attachmentCount = 0) {
    const embed = new EmbedBuilder()
      .setColor('#FF6B00')
      .setTitle(`⚠️ Moderation Action`)
      .addFields(
        { name: 'Action', value: action, inline: true },
        { name: 'Server', value: serverName, inline: true },
        { name: 'Moderator', value: moderator, inline: false },
        { name: 'Reason', value: reason || 'No reason provided', inline: false }
      );

    if (duration) {
      embed.addFields({ name: 'Duration', value: duration, inline: false });
    }

    if (attachmentCount > 0) {
      embed.setFooter({ text: `📎 ${attachmentCount} attachment(s) included` });
    }

    return embed.setTimestamp();
  }
};

module.exports = embedUtils;
