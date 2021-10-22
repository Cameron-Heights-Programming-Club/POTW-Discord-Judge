const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	info: new SlashCommandBuilder()
        .setName("potw-summary")
        .setDescription("Gives a summary of a user\'s POTW solutions")
        .addStringOption(option =>
            option.setName('user')
                .setDescription("The user to summarize")
                .setRequired(true)),
	async execute(interaction) {
		await interaction.reply('Pong!');
	}
};