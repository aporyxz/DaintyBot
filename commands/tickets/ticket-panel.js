const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embedUtils = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Create a ticket panel')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Panel title')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Panel description')
        .setRequired(true)
        .setMaxLength(500)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  moderatorOnly: true,

  async execute(interaction, client) {
    try {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');

      const result = await client.systems.tickets.createPanel(interaction, title, description);
      await interaction.reply({ embeds: [result], ephemeral: true });
    } catch (error) {
      console.error('Error in ticket-panel command:', error);
      await interaction.reply({
        embeds: [embedUtils.error('Error', 'Failed to create ticket panel')],
        ephemeral: true
      });
    }
  }
};
