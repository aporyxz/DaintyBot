const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embedUtils = require('../../utils/embed');
const permissions = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick one or more users')
    .addUserOption(option => 
      option.setName('users')
        .setDescription('Users to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kick')
        .setRequired(true)
        .setMaxLength(512)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  moderatorOnly: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userInput = interaction.options.getUser('users');
      const reason = interaction.options.getString('reason');

      const users = [userInput];

      const result = await client.systems.moderation.kick(interaction, users, reason);
      await interaction.editReply({ embeds: [result] });
    } catch (error) {
      console.error('Error in kick command:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to execute kick command')]
      });
    }
  }
};
