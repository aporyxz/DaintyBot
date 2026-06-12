const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embedUtils = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-unmute')
    .setDescription('Unmute users in voice channel')
    .addUserOption(option => 
      option.setName('users')
        .setDescription('Users to unmute')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unmute')
        .setRequired(true)
        .setMaxLength(512)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  moderatorOnly: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userInput = interaction.options.getUser('users');
      const reason = interaction.options.getString('reason');

      const users = [userInput];

      const result = await client.systems.voice.unmute(interaction, users, reason);
      await interaction.editReply({ embeds: [result] });
    } catch (error) {
      console.error('Error in voice-unmute command:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to execute voice-unmute command')]
      });
    }
  }
};
