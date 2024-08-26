const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const shell = require('shelljs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("start")
        .setDescription("Starts the Minecraft server"),
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const enzoDir = shell.pwd();
            shell.cd('C:/Users/maxin/Documents/enzo/COBBLEMON');
            const { stdout, stderr } = await shell.exec('C:/Users/maxin/Documents/enzo/COBBLEMON/run.bat')
            shell.cd(enzoDir);
            
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