const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("isomorphic-unfetch");


module.exports = {
	info: new SlashCommandBuilder()
        .setName("add-problem")
        .setDescription("Adds a problem to the database")
        .addStringOption(option =>
            option.setName('dmoj-problem-id')
                .setDescription("The dmoj problem to add")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('problem-path')
                .setDescription("Where to add the dmoj problem to")
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('problem-value')
                .setDescription("The value of the problem")
                .setRequired(false)),
	async execute(client, interaction) {
		await interaction.reply("Detecting Problem...");
        const dmojProblemID = interaction.options.getString("dmoj-problem-id");
        const problemLink = await fetch(`https://dmoj.ca/problem/${dmojProblemID}`);
        if (!problemLink.ok){
            await interaction.editReply("Problem not available!");
            return;
        }
        const problemPath = (interaction.options.getString("problem-path") || "/").replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, "");

        if (problemPath.includes(">-<")){
            await interaction.editReply("Path includes \">-<\", which is strictly prohibited.");
            return;
        }
        

        const problemCode = problemPath + ">-<" + dmojProblemID;
        console.log(problemCode);
        if (client.problems.hasOwnProperty(problemCode)){
            await interaction.editReply("Duplicate problem in desired location!");
            return;
        }
        
        const problemValue = interaction.options.getInteger("problem-value") || 0;
        client.problems[problemCode] = problemValue;
        
        try {
            await client.saveProblems();
            await interaction.editReply("Successfully added problem with code: " + problemCode);
        } catch (error) {
            console.error(error);
            await interaction.editReply("Error saving problems!");
        }
	}
};