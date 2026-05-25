const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Control the Minecraft server')
    .addSubcommand(sub =>
      sub.setName('start').setDescription('Start the Minecraft server'))
    .addSubcommand(sub =>
      sub.setName('stop').setDescription('Stop the Minecraft server'))
    .addSubcommand(sub =>
      sub.setName('status').setDescription('Check server status')),

  async execute(interaction) {
    const action = interaction.options.getSubcommand();

    if (action === 'start') {

    }

    if (action === 'stop') {

    }

    if (action === 'status') {

    }
  }
};