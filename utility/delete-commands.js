require('dotenv').config();

const { REST, Routes } = require('discord.js');

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

const rest = new REST().setToken(token);

// for global commands
rest.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);