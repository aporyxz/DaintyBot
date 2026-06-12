const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embedUtils = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-mute')
    .setDescription('Mute users in voice channel')
    .addUserOption(option => 
      option.setName('users')
        .setDescription('Users to mute')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for mute')
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

      const result = await client.systems.voice.mute(interaction, users, reason);
      await interaction.editReply({ embeds: [result] });
    } catch (error) {
      console.error('Error in voice-mute command:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to execute voice-mute command')]
      });
    }
  }
};
