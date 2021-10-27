const { SlashCommandBuilder } = require("@discordjs/builders");


module.exports = {
	info: new SlashCommandBuilder()
        .setName("list-problems")
        .setDescription("Lists all database problems"),
	async execute(client, interaction) {
        await interaction.reply("Accessing Problems...");
        let result = "All Problems:\n";
        for (let problem in client.problems){
            result += problem + "\n";
        }
        await interaction.editReply(result);
	}
};