const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("isomorphic-unfetch");
const parse = require("node-html-parser").parse;

const maxOfPage = async page => {
    if (!page.ok) return -1;

    let pageRoot = parse(await page.text());
    let submissions = pageRoot.querySelectorAll(".score").map(submission => submission.rawText);
    let submissionScores = submissions.map(submission => {
        if (submission == "---") return 0;

        let score = submission.split(" / ");
        return parseInt(score[0])/parseInt(score[1]);
    });
    return Math.max(...submissionScores);
};

module.exports = {
	info: new SlashCommandBuilder()
        .setName("potw-summary")
        .setDescription("Gives a summary of a user\'s POTW solutions")
        .addStringOption(option =>
            option.setName('dmoj-username')
                .setDescription("The dmoj user to summarize")
                .setRequired(true)),
	async execute(client, interaction) {
		await interaction.reply("Calculating...");
        const dmojUser = interaction.options.getString("dmoj-username");
        const userAccount = await fetch("https://dmoj.ca/user/" + dmojUser);
        if (!userAccount.ok){
            await interaction.editReply("User does not exist!");
            return;
        }
        let totalPoints = 0
        let fullSolutions = 0;
        let partialSolutions = 0;
        const totalProblems = Object.entries(client.problems).length;
        let attempted = totalProblems;
        for (let problemCode in client.problems){
            const problemId = problemCode.substr(problemCode.indexOf(">-<") + 3);
            let max = -1;
            let i = 1;
            let problemPage = { ok: true };
            do {
                problemPage = await fetch("https://dmoj.ca/problem/" + problemId + "/submissions/" + dmojUser + "/" + i.toString());
                max = Math.max(max, await maxOfPage(problemPage))
                i++
            } while(problemPage.ok);

            if (max == 1) fullSolutions++;
            else if (max > 0) partialSolutions++;
            
            if (max < 0) attempted--;
            else totalPoints += Math.round(max * client.problems[problemCode]);
        }
        let result = `Summary for ${dmojUser}:\nTotal Points: ${totalPoints}\nFull Solutions: ${fullSolutions}\nPartial Solutions: ${partialSolutions}\nTotal Attempted: ${attempted}/${totalProblems}\n`;

        await interaction.editReply(result);
	}
};