const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embedUtils = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-kick')
    .setDescription('Disconnect users from voice channel')
    .addUserOption(option => 
      option.setName('users')
        .setDescription('Users to disconnect')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for disconnect')
        .setRequired(true)
        .setMaxLength(512)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

  moderatorOnly: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userInput = interaction.options.getUser('users');
      const reason = interaction.options.getString('reason');

      const users = [userInput];

      const result = await client.systems.voice.kick(interaction, users, reason);
      await interaction.editReply({ embeds: [result] });
    } catch (error) {
      console.error('Error in voice-kick command:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to execute voice-kick command')]
      });
    }
  }
};
