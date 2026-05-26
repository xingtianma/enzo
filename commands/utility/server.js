const { SlashCommandBuilder } = require('discord.js');

const AMP_URL = process.env.AMP_URL?.replace(/\/$/, '');
const AMP_USER = process.env.AMP_USER;
const AMP_PASS = process.env.AMP_PASS;
const AMP_INSTANCE_NAME = process.env.AMP_INSTANCE;

// Direct AMP API helper — bypasses the buggy @neuralnexus/ampapi library
async function ampCall(endpoint, data = {}) {
  const res = await fetch(`${AMP_URL}/API/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/javascript',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`AMP HTTP ${res.status}`);

  const json = await res.json();
  if (json?.Title || json?.Message) {
    throw new Error(`AMP: ${json.Title}: ${json.Message}`);
  }
  return json;
}

async function getInstanceAPI() {
  // Step 1: Login to ADS
  const login = await ampCall('Core/Login', {
    username: AMP_USER,
    password: AMP_PASS,
    token: '',
    rememberMe: true,
  });

  if (!login.success) {
    throw new Error(`AMP login failed for user "${AMP_USER}".`);
  }

  const sessionId = login.sessionID;

  // Step 2: Find the target instance
  const targets = await ampCall('ADSModule/GetInstances', { SESSIONID: sessionId });

  let instanceId = null;
  for (const target of targets) {
    for (const inst of target.AvailableInstances) {
      if (inst.InstanceName === AMP_INSTANCE_NAME) {
        instanceId = inst.InstanceID;
      }
    }
  }
  if (!instanceId) throw new Error(`Instance "${AMP_INSTANCE_NAME}" not found`);

  // Step 3: Login to the specific instance
  const instLogin = await ampCall(`ADSModule/Servers/${instanceId}/API/Core/Login`, {
    username: AMP_USER,
    password: AMP_PASS,
    token: '',
    rememberMe: true,
    SESSIONID: sessionId,
  });

  if (!instLogin.success) {
    throw new Error(`Instance login failed for "${AMP_INSTANCE_NAME}".`);
  }

  const instSession = instLogin.sessionID;
  const instBase = `ADSModule/Servers/${instanceId}/API`;

  // Return an object with the same interface the rest of the code expects
  return {
    Core: {
      Start: () => ampCall(`${instBase}/Core/Start`, { SESSIONID: instSession }),
      Stop: () => ampCall(`${instBase}/Core/Stop`, { SESSIONID: instSession }),
      GetStatus: () => ampCall(`${instBase}/Core/GetStatus`, { SESSIONID: instSession }),
    },
  };
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