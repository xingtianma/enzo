const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("start")
        .setDescription("Starts the Minecraft server"),
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            // Replace this with your actual command to start the Minecraft server
            const { stdout, stderr } = await execPromise('path/to/start_minecraft_server.sh');
            
            if (stderr) {
                console.error(`Error: ${stderr}`);
                await interaction.editReply('There was an error starting the Minecraft server.');
            } else {
                console.log(`Server output: ${stdout}`);
                await interaction.editReply('Minecraft server has been started successfully!');
            }
        } catch (error) {
            console.error(`Exception: ${error}`);
            await interaction.editReply('Failed to start the Minecraft server. Please check the logs.');
        }
    }
};