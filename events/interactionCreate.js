const errorHandler = require('../utils/errorHandler');
const permissions = require('../utils/permissions');
const embedUtils = require('../utils/embed');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          return await errorHandler.sendErrorEmbed(interaction, 'Command not found');
        }

        // Check permissions
        if (command.moderatorOnly && !permissions.isModerator(interaction.member)) {
          return await errorHandler.sendErrorEmbed(interaction, 'You do not have permission to use this command');
        }

        try {
          await command.execute(interaction, client);
        } catch (error) {
          console.error(`Error executing command ${interaction.commandName}:`, error);
          errorHandler.logError(client, error, `Command Error: ${interaction.commandName}`);
          
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [embedUtils.error('Command Error', 'An error occurred while executing the command')] });
          } else {
            await interaction.reply({ embeds: [embedUtils.error('Command Error', 'An error occurred while executing the command')], ephemeral: true });
          }
        }
      }

      // Handle button interactions
      if (interaction.isButton()) {
        const [system, action] = interaction.customId.split('_');

        if (system === 'ticket') {
          const ticketSystem = client.systems.tickets;
          
          if (action === 'open') {
            await ticketSystem.handleOpenTicket(interaction);
          } else if (action === 'claim') {
            await ticketSystem.handleClaimTicket(interaction);
          } else if (action === 'close') {
            await ticketSystem.handleCloseTicket(interaction);
          }
        }
      }

      // Handle modal submissions
      if (interaction.isModalSubmit()) {
        const modalId = interaction.customId;

        if (modalId === 'ticket_close_modal') {
          const ticketSystem = client.systems.tickets;
          await ticketSystem.handleCloseModal(interaction);
        }
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      errorHandler.logError(client, error, 'Interaction Handler Error');
    }
  },
};
