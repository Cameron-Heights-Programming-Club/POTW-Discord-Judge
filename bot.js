const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Collection, Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

require("dotenv").config();

const TOKEN = process.env["TOKEN"];
const TEST_GUILD_ID = process.env["TEST_GUILD_ID"];

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
const commands = []; 

// Add commands to dynamic execution
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.info.toJSON());
    client.commands.set(command.info.name, command);
}

// Load problems at startup
client.refreshProblems = () => {
    try {
        client.problems = JSON.parse(fs.readFileSync("./problems.json"));
    } catch (error){
        console.log(error);
        console.log("Error loading problems!");
        client.problems = {};
    }
};

client.saveProblems = async () => {
    fs.writeFile("./problems.json", JSON.stringify(client.problems), (err) => {
        if (err) throw err;
    });
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log("Loading problems!");
    client.refreshProblems();
});

client.once('ready', () => {
    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(TOKEN);
    (async () => {
        try {
            if (!TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            console.error(error);
        }
    })();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(error);
        await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
    }
});

client.login(TOKEN);