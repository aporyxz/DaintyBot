const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embedUtils = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout one or more users')
    .addUserOption(option => 
      option.setName('users')
        .setDescription('Users to timeout')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1h, 30m, 7d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for timeout')
        .setRequired(true)
        .setMaxLength(512)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  moderatorOnly: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userInput = interaction.options.getUser('users');
      const duration = interaction.options.getString('duration');
      const reason = interaction.options.getString('reason');

      const users = [userInput];

      const result = await client.systems.moderation.timeout(interaction, users, duration, reason);
      await interaction.editReply({ embeds: [result] });
    } catch (error) {
      console.error('Error in timeout command:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to execute timeout command')]
      });
    }
  }
};
