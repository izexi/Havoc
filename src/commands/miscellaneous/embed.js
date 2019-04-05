const Command = require("../../structures/Command");

class Embed extends Command {
	constructor() {
		super(__filename, {
			description: "Embeds the inputted text.",
			aliases: new Set(["emb"]),
			args: {
				usage: "<text>",
			},
			prompt: {
				initialMsg: ["enter the text that you would like to embed."],
			},
			opts: 0b1011,
		});
	}

	async run() {
		this.response = await this.sendEmbed({
			setDescription: this.text || this.promptResponse[0],
			setFooter: [this.author.tag, this.author.pfp],
		});
	}
}

module.exports = Embed;