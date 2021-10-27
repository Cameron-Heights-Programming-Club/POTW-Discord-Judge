const { SlashCommandBuilder } = require("@discordjs/builders");


module.exports = {
	info: new SlashCommandBuilder()
        .setName("remove-problem")
        .setDescription("Removes a problem from the database")
        .addStringOption(option =>
            option.setName('dmoj-problem-id')
                .setDescription("The dmoj problem to remove")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('problem-path')
                .setDescription("Where to remove the dmoj problem frp,")
                .setRequired(false)),
	async execute(client, interaction) {
		await interaction.reply("Detecting Problem...");
        const dmojProblemID = interaction.options.getString("dmoj-problem-id");
        const problemPath = (interaction.options.getString("problem-path") || "/").replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ".");

        if (problemPath.includes(">-<")){
            await interaction.editReply("Path includes \">-<\", which is strictly prohibited.");
            return;
        }

        const problemCode = problemPath + ">-<" + dmojProblemID;
        if (!client.problems.delete(problemCode)){
            await interaction.editReply("Problem does not already exist!");
            return
        }

        try {
            await client.saveProblems();
            await interaction.editReply("Removed Problem");
        } catch (error) {
            console.error(error);
            await interaction.editReply("Error saving problems!");
        }
	}
};