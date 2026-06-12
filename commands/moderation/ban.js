const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embedUtils = require('../../utils/embed');
const permissions = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban one or more users')
    .addUserOption(option => 
      option.setName('users')
        .setDescription('Users to ban (mention multiple with commas)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ban')
        .setRequired(true)
        .setMaxLength(512)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  moderatorOnly: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userInput = interaction.options.getUser('users');
      const reason = interaction.options.getString('reason');

      // Get users from mention
      const users = [userInput];

      const result = await client.systems.moderation.ban(interaction, users, reason);
      await interaction.editReply({ embeds: [result] });
    } catch (error) {
      console.error('Error in ban command:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to execute ban command')]
      });
    }
  }
};
