const { REST, Routes} = require("discord.js")
const botID = "1274104343167111168";
const serverID = "1254267128312365167";
const botToken = "MTI3NDEwNDM0MzE2NzExMTE2OA.G9ZCVT.8YYKgZED1mLMisV1KqgxwQe0mcI6HlXUaD3uSU";

const rest = new REST().setToken(botToken);
const slashRegister = async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(botID, serverID), {
      body: [
        {
          name: "ping",
          description: "simple ping command"
        }
      ]
    })
  }
  catch (error) {
    console.error(error);
  }
}

slashRegister();