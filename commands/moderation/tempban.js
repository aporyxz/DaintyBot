const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embedUtils = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Temporarily ban a user')
    .addUserOption(option => 
      option.setName('users')
        .setDescription('Users to tempban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1h, 30m, 7d, max 90d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for tempban')
        .setRequired(true)
        .setMaxLength(512)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  moderatorOnly: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userInput = interaction.options.getUser('users');
      const duration = interaction.options.getString('duration');
      const reason = interaction.options.getString('reason');

      const users = [userInput];

      const result = await client.systems.tempban.ban(interaction, users, duration, reason);
      await interaction.editReply({ embeds: [result] });
    } catch (error) {
      console.error('Error in tempban command:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to execute tempban command')]
      });
    }
  }
};
