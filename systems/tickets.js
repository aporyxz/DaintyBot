const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const storage = require('../utils/storage');
const transcript = require('../utils/transcript');
const embedUtils = require('../utils/embed');
const permissions = require('../utils/permissions');
const moderation = require('./moderation');

const tickets = {
  async createPanel(interaction, title, description) {
    try {
      const panelEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(title)
        .setDescription(description);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_open')
          .setLabel('Open Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫')
      );

      await interaction.reply({
        embeds: [panelEmbed],
        components: [row],
        ephemeral: false
      });

      return embedUtils.success('Ticket Panel', 'Panel created successfully');
    } catch (error) {
      console.error('Error creating ticket panel:', error);
      throw error;
    }
  },

  async handleOpenTicket(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;
      const user = interaction.user;
      const channelName = `ticket-${user.username}`.toLowerCase().slice(0, 80);

      // Check if user already has an open ticket
      const ticketData = storage.read('tickets');
      const existingTicket = Object.values(ticketData).find(t => 
        t.userId === user.id && t.guildId === guild.id && !t.closed
      );

      if (existingTicket) {
        return await interaction.editReply({
          embeds: [embedUtils.error('Ticket Exists', `You already have an open ticket: <#${existingTicket.channelId}>`)]
        });
      }

      // Create ticket channel
      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: null, // No category - can be configured
        permissionOverwrites: [
          {
            id: guild.id,
            deny: ['ViewChannel'],
          },
          {
            id: user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
          {
            id: guild.me.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'],
          },
        ],
      });

      // Add moderator permissions
      const moderatorRoles = process.env.MODERATOR_ROLE_IDS?.split(',').map(id => id.trim()).filter(id => id) || [];
      for (const roleId of moderatorRoles) {
        try {
          const role = await guild.roles.fetch(roleId);
          if (role) {
            await ticketChannel.permissionOverwrites.create(role, {
              ViewChannel: true,
              SendMessages: true,
              ReadMessageHistory: true,
            });
          }
        } catch (error) {
          console.error(`Error setting permissions for role ${roleId}:`, error);
        }
      }

      // Store ticket data
      const ticketId = ticketChannel.id;
      const ticketInfo = {
        ticketId,
        channelId: ticketChannel.id,
        userId: user.id,
        guildId: guild.id,
        createdAt: new Date().toISOString(),
        closed: false,
        claimedBy: null
      };

      storage.append('tickets', ticketId, ticketInfo);

      // Send welcome message
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🎫 Ticket Opened')
        .setDescription(`Welcome ${user}! Please describe your issue below.`)
        .addFields(
          { name: 'Ticket ID', value: ticketId, inline: true },
          { name: 'Created At', value: new Date().toISOString(), inline: true }
        )
        .setTimestamp();

      const ticketRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel('Claim')
          .setStyle(ButtonStyle.Success)
          .setEmoji('👋'),
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Close')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await ticketChannel.send({
        embeds: [welcomeEmbed],
        components: [ticketRow]
      });

      await interaction.editReply({
        embeds: [embedUtils.success('Ticket Created', `Your ticket has been created: ${ticketChannel}`)]
      });
    } catch (error) {
      console.error('Error opening ticket:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to create ticket')]
      });
    }
  },

  async handleClaimTicket(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      if (!permissions.isModerator(interaction.member)) {
        return await interaction.editReply({
          embeds: [embedUtils.error('Permission Denied', 'Only moderators can claim tickets')]
        });
      }

      const ticketData = storage.read('tickets');
      const ticket = ticketData[interaction.channel.id];

      if (!ticket) {
        return await interaction.editReply({
          embeds: [embedUtils.error('Not a Ticket', 'This is not a ticket channel')]
        });
      }

      if (ticket.claimedBy) {
        return await interaction.editReply({
          embeds: [embedUtils.error('Already Claimed', `This ticket is already claimed by <@${ticket.claimedBy}>`)]
        });
      }

      // Update ticket
      ticket.claimedBy = interaction.user.id;
      storage.append('tickets', ticket.ticketId, ticket);

      // Update channel topic
      await interaction.channel.setTopic(`Claimed by ${interaction.user.tag}`);

      // Log action
      const logEmbed = new EmbedBuilder()
        .setColor('#00AA00')
        .setTitle('🎫 Ticket Claimed')
        .addFields(
          { name: 'Ticket', value: `<#${interaction.channel.id}>`, inline: true },
          { name: 'Moderator', value: `${interaction.user} (${interaction.user.id})`, inline: true }
        )
        .setTimestamp();

      await moderation.logAction(interaction.client, logEmbed);

      await interaction.editReply({
        embeds: [embedUtils.success('Claimed', 'You have claimed this ticket')]
      });

      // Notify in channel
      const claimEmbed = new EmbedBuilder()
        .setColor('#00AA00')
        .setDescription(`✅ This ticket has been claimed by ${interaction.user}`);

      await interaction.channel.send({ embeds: [claimEmbed] });
    } catch (error) {
      console.error('Error claiming ticket:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to claim ticket')]
      });
    }
  },

  async handleCloseTicket(interaction) {
    try {
      if (!permissions.isModerator(interaction.member)) {
        return await interaction.reply({
          embeds: [embedUtils.error('Permission Denied', 'Only moderators can close tickets')],
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId('ticket_close_modal')
        .setTitle('Close Ticket');

      const reasonInput = new TextInputBuilder()
        .setCustomId('close_reason')
        .setLabel('Reason for closing')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Optional reason...');

      const row = new ActionRowBuilder().addComponents(reasonInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (error) {
      console.error('Error showing close modal:', error);
    }
  },

  async handleCloseModal(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const reason = interaction.fields.getTextInputValue('close_reason') || 'No reason provided';
      const ticketData = storage.read('tickets');
      const ticket = ticketData[interaction.channel.id];

      if (!ticket) {
        return await interaction.editReply({
          embeds: [embedUtils.error('Not a Ticket', 'This is not a ticket channel')]
        });
      }

      // Generate transcript
      const transcriptResult = await transcript.generateTranscript(interaction.channel, reason);

      // Get user
      const user = await interaction.client.users.fetch(ticket.userId);

      // Send transcript and close notification to user
      const closeEmbed = new EmbedBuilder()
        .setColor('#FF6B00')
        .setTitle('🎫 Ticket Closed')
        .addFields(
          { name: 'Reason', value: reason, inline: false },
          { name: 'Closed By', value: interaction.user.tag, inline: true },
          { name: 'Closed At', value: new Date().toISOString(), inline: true }
        )
        .setTimestamp();

      try {
        await user.send({
          embeds: [closeEmbed],
          files: transcriptResult.success ? [{ attachment: transcriptResult.filepath, name: transcriptResult.filename }] : []
        });
      } catch (error) {
        console.warn(`Could not send close notification to ${user.tag}:`, error.message);
      }

      // Mark ticket as closed
      ticket.closed = true;
      ticket.closedAt = new Date().toISOString();
      ticket.closedBy = interaction.user.id;
      storage.append('tickets', ticket.ticketId, ticket);

      // Log action
      const logEmbed = new EmbedBuilder()
        .setColor('#FF6B00')
        .setTitle('🎫 Ticket Closed')
        .addFields(
          { name: 'Ticket', value: `${ticket.ticketId}`, inline: true },
          { name: 'User', value: `${user} (${ticket.userId})`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Closed By', value: `${interaction.user} (${interaction.user.id})`, inline: true }
        )
        .setTimestamp();

      await moderation.logAction(interaction.client, logEmbed);

      await interaction.editReply({
        embeds: [embedUtils.success('Closed', 'Ticket will be deleted in 5 seconds')]
      });

      // Delete channel after delay
      setTimeout(() => {
        interaction.channel.delete('Ticket closed').catch(err => {
          console.error('Error deleting ticket channel:', err);
        });
      }, 5000);
    } catch (error) {
      console.error('Error closing ticket:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to close ticket')]
      });
    }
  }
};

module.exports = tickets;
