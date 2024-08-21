const {Client} = require("discord.js");
const {token} = require("./config.json");
const shell = require('shelljs')
const client = new Client({intents: []});

client.on("ready", () => {
  console.log("Enzo is here");
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName === "ping") {
      interaction.reply("pong");
    }
    else if (interaction.commandName === "start") {
      
    }
  }
});

client.login(token);