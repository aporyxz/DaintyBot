const { EmbedBuilder } = require('discord.js');

const errorHandler = {
  async logError(client, error, context = 'Unknown Error') {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${context}:`, error);

    try {
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (!logChannel) return;

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('⚠️ Bot Error')
        .setDescription(`\`\`\`${error.message || 'Unknown error'}\`\`\``)
        .addFields(
          { name: 'Context', value: context, inline: true },
          { name: 'Timestamp', value: timestamp, inline: true },
          { name: 'Stack', value: `\`\`\`${(error.stack || 'No stack trace').slice(0, 1000)}\`\`\`` }
        )
        .setFooter({ text: 'Error logged at' })
        .setTimestamp();

      await logChannel.send({ embeds: [errorEmbed] }).catch(() => {});
    } catch (err) {
      console.error('Failed to log error to channel:', err);
    }
  },

  async sendErrorEmbed(interaction, message = 'An error occurred') {
    try {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error')
        .setDescription(message)
        .setTimestamp();

      const response = interaction.replied || interaction.deferred 
        ? await interaction.editReply({ embeds: [errorEmbed] })
        : await interaction.reply({ embeds: [errorEmbed], ephemeral: true });

      return response;
    } catch (err) {
      console.error('Failed to send error embed:', err);
    }
  }
};

module.exports = errorHandler;
