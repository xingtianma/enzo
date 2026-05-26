const { SlashCommandBuilder } = require('discord.js');
const { ADS } = require('@neuralnexus/ampapi');

const AMP_URL = process.env.AMP_URL;
const AMP_USER = process.env.AMP_USER;
const AMP_PASS = process.env.AMP_PASS;
const AMP_INSTANCE_NAME = process.env.AMP_INSTANCE;

async function getInstanceAPI() {
  const ads = new ADS(AMP_URL, AMP_USER, AMP_PASS);
  const loginResult = await ads.APILogin();
  console.log('AMP Login result:', JSON.stringify(loginResult));

  if (!loginResult || !loginResult.success) {
    throw new Error(`AMP login failed for user "${AMP_USER}". Check credentials.`);
  }

  const targets = await ads.ADSModule.GetInstances();
  for (const target of targets) {
    for (const instance of target.AvailableInstances) {
      if (instance.InstanceName === AMP_INSTANCE_NAME) {
        return await ads.InstanceLogin(instance.InstanceID, 'Minecraft');
      }
    }
  }
  throw new Error(`Instance "${AMP_INSTANCE_NAME}" not found`);
}

const STATE_MAP = {
  0: 'Stopped',
  5: 'Pre-start',
  7: 'Configuring',
  10: 'Ready / Running',
  15: 'Restarting',
  20: 'Stopping',
  25: 'Pre-start (custom)',
  30: 'Maintenance',
  35: 'Indeterminate',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Controls the Minecraft server')
    .addSubcommand(sub =>
      sub.setName('start').setDescription('Start the Minecraft server'))
    .addSubcommand(sub =>
      sub.setName('stop').setDescription('Stop the Minecraft server'))
    .addSubcommand(sub =>
      sub.setName('status').setDescription('Check server status')),

  async execute(interaction) {
    const action = interaction.options.getSubcommand();
    await interaction.deferReply();

    try {
      const api = await getInstanceAPI();

      if (action === 'start') {
        await api.Core.Start();
        await interaction.editReply('Minecraft server starting...')
      }
      if (action === 'stop') {
        await api.Core.Stop();
        await interaction.editReply('Minecraft server stopping...');
      }
      if (action === 'status') {
        const status = await api.Core.GetStatus();

        const messages = {
          0: 'Server is offline...',
          5: 'Server is starting...',
          7: 'Server is configuring...',
          10: 'Server is online...',
          15: 'Server is restarting...',
          20: 'Server is stopping...',
        };

        const reply = messages[status.State] ?? 'Server status unknown';
        await interaction.editReply(reply);
      }
    }
    catch (err) {
      console.error('AMP Error: ', err);
      await interaction.editReply(err.message);
    }
  }
};