const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embedUtils = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-move')
    .setDescription('Move users to a different voice channel')
    .addUserOption(option => 
      option.setName('users')
        .setDescription('Users to move')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Target voice channel')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for move')
        .setRequired(true)
        .setMaxLength(512)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

  moderatorOnly: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const userInput = interaction.options.getUser('users');
      const channel = interaction.options.getChannel('channel');
      const reason = interaction.options.getString('reason');

      const users = [userInput];

      const result = await client.systems.voice.move(interaction, users, channel, reason);
      await interaction.editReply({ embeds: [result] });
    } catch (error) {
      console.error('Error in voice-move command:', error);
      await interaction.editReply({
        embeds: [embedUtils.error('Error', 'Failed to execute voice-move command')]
      });
    }
  }
};
